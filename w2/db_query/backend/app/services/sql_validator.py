"""SQL validation service using sqlglot."""

import sqlglot
from sqlglot import exp
from app.models.database import DatabaseType


class SqlValidationError(Exception):
    """Raised when SQL validation fails."""

    pass


def validate_sql(sql: str, db_type: DatabaseType = DatabaseType.POSTGRESQL) -> tuple[bool, str | None]:
    """
    Validate SQL query using sqlglot.

    Args:
        sql: SQL query string to validate
        db_type: Database type (PostgreSQL or MySQL)

    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        # Determine dialect
        dialect = "postgres" if db_type == DatabaseType.POSTGRESQL else "mysql"

        # Parse SQL
        parsed = sqlglot.parse_one(sql, dialect=dialect)
        if parsed is None:
            return False, "Failed to parse SQL query"

        # Check if it's a SELECT statement
        if not isinstance(parsed, exp.Select):
            return False, "Only SELECT statements are allowed"

        return True, None
    except sqlglot.errors.ParseError as e:
        return False, f"SQL parse error: {str(e)}"
    except Exception as e:
        return False, f"SQL validation error: {str(e)}"


def add_limit_if_missing(sql: str, limit: int = 1000, db_type: DatabaseType = DatabaseType.POSTGRESQL) -> str:
    """
    Add LIMIT clause to SELECT statement if missing.

    Args:
        sql: SQL query string
        limit: Maximum number of rows to return (default: 1000)
        db_type: Database type (PostgreSQL or MySQL)

    Returns:
        SQL query with LIMIT clause added if missing
    """
    try:
        # Determine dialect
        dialect = "postgres" if db_type == DatabaseType.POSTGRESQL else "mysql"

        parsed = sqlglot.parse_one(sql, dialect=dialect)
        if parsed is None:
            return sql

        # Check if LIMIT already exists
        if parsed.find(exp.Limit):
            return sql

        # Add LIMIT clause
        parsed.set("limit", exp.Limit(expression=exp.Literal.number(limit)))
        return parsed.sql(dialect=dialect)
    except Exception:
        # If parsing fails, return original SQL
        return sql


def validate_and_transform_sql(sql: str, limit: int = 1000, db_type: DatabaseType = DatabaseType.POSTGRESQL) -> str:
    """
    Validate SQL and add LIMIT if missing.

    Args:
        sql: SQL query string
        limit: Maximum number of rows to return (default: 1000)
        db_type: Database type (PostgreSQL or MySQL)

    Returns:
        Validated and transformed SQL query

    Raises:
        SqlValidationError: If SQL validation fails
    """
    is_valid, error_message = validate_sql(sql, db_type)
    if not is_valid:
        raise SqlValidationError(error_message or "Invalid SQL query")

    return add_limit_if_missing(sql, limit, db_type)
