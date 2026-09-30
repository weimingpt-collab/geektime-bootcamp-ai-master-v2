"""Query execution API endpoints."""

import json
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from typing import List
from app.database import get_session
from app.models.database import DatabaseConnection, DatabaseType
from app.models.query import QuerySource
from app.models.schemas import (
    QueryInput,
    QueryResult,
    QueryHistoryEntry,
    NaturalLanguageInput,
    GeneratedSqlResponse,
)
from app.services.query_wrapper import execute_query_with_service
from app.services.query import get_query_history
from app.services.sql_validator import SqlValidationError, validate_sql
from app.services.export import (
    MAX_EXPORT_ROWS,
    build_filename,
    inject_limit,
    stream_csv,
    stream_json,
)
from app.services.nl2sql import nl2sql_service
from app.services.metadata import get_cached_metadata
from app.adapters.registry import adapter_registry
from app.adapters.base import ConnectionConfig

router = APIRouter(prefix="/api/v1/dbs", tags=["queries"])


def to_history_entry(history) -> QueryHistoryEntry:
    """Convert QueryHistory to QueryHistoryEntry schema."""
    return QueryHistoryEntry(
        id=history.id,
        databaseName=history.database_name,
        sqlText=history.sql_text,
        executedAt=history.executed_at,
        executionTimeMs=history.execution_time_ms,
        rowCount=history.row_count,
        success=history.success,
        errorMessage=history.error_message,
        querySource=history.query_source.value,
    )


@router.post("/{name}/query", response_model=QueryResult)
async def execute_sql_query(
    name: str,
    input_data: QueryInput,
    session: Session = Depends(get_session),
) -> QueryResult:
    """
    Execute SQL query against a database.

    Args:
        name: Database connection name
        input_data: Query input with SQL
        session: Database session

    Returns:
        Query result with columns and rows
    """
    # Get connection
    statement = select(DatabaseConnection).where(
        DatabaseConnection.name == name
    )
    connection = session.exec(statement).first()

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Database connection '{name}' not found",
        )

    # Execute query
    try:
        result = await execute_query_with_service(
            session,
            name,
            connection.db_type,
            connection.url,
            input_data.sql,
            QuerySource.MANUAL,
        )
        return result
    except SqlValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query execution failed: {str(e)}",
        )


@router.get("/{name}/history", response_model=List[QueryHistoryEntry])
async def get_query_history_for_database(
    name: str,
    limit: int = 50,
    session: Session = Depends(get_session),
) -> List[QueryHistoryEntry]:
    """
    Get query history for a database.

    Args:
        name: Database connection name
        limit: Maximum number of queries to return
        session: Database session

    Returns:
        List of query history entries
    """
    # Verify connection exists
    statement = select(DatabaseConnection).where(
        DatabaseConnection.name == name
    )
    connection = session.exec(statement).first()

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Database connection '{name}' not found",
        )

    # Get history
    history_list = await get_query_history(session, name, limit)
    return [to_history_entry(h) for h in history_list]


@router.post("/{name}/query/natural", response_model=GeneratedSqlResponse)
async def natural_language_to_sql(
    name: str,
    input_data: NaturalLanguageInput,
    session: Session = Depends(get_session),
) -> GeneratedSqlResponse:
    """
    Convert natural language to SQL query using OpenAI.

    Args:
        name: Database connection name
        input_data: Natural language prompt
        session: Database session

    Returns:
        Generated SQL query with explanation
    """
    # Get connection
    statement = select(DatabaseConnection).where(DatabaseConnection.name == name)
    connection = session.exec(statement).first()

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Database connection '{name}' not found",
        )

    # Get metadata for context
    try:
        metadata_obj = await get_cached_metadata(session, connection.name)
        if not metadata_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Metadata not found for database '{name}'. Please refresh metadata first.",
            )
        metadata = json.loads(metadata_obj.metadata_json)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load metadata: {str(e)}",
        )

    # Generate SQL
    try:
        result = await nl2sql_service.generate_sql(input_data.prompt, metadata, connection.db_type)
        return GeneratedSqlResponse(
            sql=result["sql"],
            explanation=result["explanation"],
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate SQL: {str(e)}",
        )


@router.get("/{name}/query/export")
async def export_query_results(
    name: str,
    sql: str = Query(..., min_length=1, description="SELECT query to export (URL-encoded)."),
    format: str = Query(..., description="Export format: 'csv' or 'json'."),
    limit: int = Query(
        MAX_EXPORT_ROWS,
        ge=1,
        le=MAX_EXPORT_ROWS,
        description=f"Maximum rows to export. Hard cap {MAX_EXPORT_ROWS}.",
    ),
    delimiter: str = Query(",", description="CSV field delimiter (ignored for JSON)."),
    session: Session = Depends(get_session),
):
    """Export query results as a streamed file (CSV or JSON).

    Re-executes the given SELECT on the target database and streams the
    result back as a downloadable file. Used for large result sets that
    exceed the default LIMIT 1000 of the POST /query endpoint.

    Behavior:
    - SQL is validated with sqlglot; only SELECT is allowed.
    - `limit` is injected into the SQL AST (no default LIMIT 1000).
    - Response is chunked; the browser downloads directly to disk.
    - CSV output starts with a UTF-8 BOM for Excel compatibility.
    - CSV fields prone to formula injection (starting with = + - @)
      are prefixed with a single quote.

    Errors:
    - 400: non-SELECT SQL, limit exceeds cap, or malformed request.
    - 404: database connection not found.
    - 504: export exceeded the 60s timeout.
    """
    # Validate format enum (FastAPI's Enum support is heavier than a
    # simple check here; keep it explicit for the error message).
    if format not in ("csv", "json"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid format '{format}'. Must be 'csv' or 'json'.",
        )

    # Look up connection
    statement = select(DatabaseConnection).where(DatabaseConnection.name == name)
    connection = session.exec(statement).first()

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Database connection '{name}' not found",
        )

    # Validate SQL: SELECT only. Do NOT apply the default LIMIT 1000
    # (we inject the caller-supplied `limit` via AST rewrite instead).
    is_valid, error_message = validate_sql(sql, connection.db_type)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message or "Invalid SQL query",
        )

    # Inject the export limit via sqlglot AST rewrite.
    export_sql = inject_limit(sql, limit, connection.db_type)

    # Build adapter directly (bypass database_service which applies its
    # own LIMIT 1000). The registry caches pools by (type, name).
    # ConnectionConfig.command_timeout defaults to 60s, enforcing the
    # export timeout at the driver level (asyncpg raises
    # QueryCanceledError; aiomysql raises OperationalError on timeout).
    config = ConnectionConfig(url=connection.url, name=connection.name)
    adapter = adapter_registry.get_adapter(connection.db_type, config)

    filename = build_filename(connection.name, format)

    if format == "csv":
        media_type = "text/csv; charset=utf-8"
        generator = stream_csv(adapter, export_sql, max_rows=limit, delimiter=delimiter)
    else:
        media_type = "application/json; charset=utf-8"
        generator = stream_json(adapter, export_sql, max_rows=limit)

    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"',
    }

    return StreamingResponse(
        generator,
        media_type=media_type,
        headers=headers,
    )
