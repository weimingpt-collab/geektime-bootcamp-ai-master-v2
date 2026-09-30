"""Metadata extraction service for MySQL databases."""

import aiomysql
from typing import Dict, List, Any


async def extract_metadata(database_name: str, pool: aiomysql.Pool) -> Dict[str, Any]:
    """
    Extract database metadata from MySQL.

    Args:
        database_name: Database connection name
        pool: aiomysql connection pool

    Returns:
        Dictionary containing tables and views metadata
    """
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            # Get the actual database name from the connection
            await cursor.execute("SELECT DATABASE()")
            result = await cursor.fetchone()
            db_name = result["DATABASE()"]

            if not db_name:
                return {"tables": [], "views": []}

            # Get all tables and views
            tables_query = """
                SELECT
                    TABLE_SCHEMA as schemaname,
                    TABLE_NAME as tablename,
                    TABLE_TYPE as type
                FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = %s
                ORDER BY TABLE_SCHEMA, TABLE_NAME
            """
            await cursor.execute(tables_query, (db_name,))
            tables_rows = await cursor.fetchall()

            tables: List[Dict[str, Any]] = []
            views: List[Dict[str, Any]] = []

            for row in tables_rows:
                schema_name = row["schemaname"]
                table_name = row["tablename"]
                table_type = "table" if row["type"] == "BASE TABLE" else "view"

                # Get columns for this table/view
                columns_query = """
                    SELECT
                        c.COLUMN_NAME as column_name,
                        c.DATA_TYPE as data_type,
                        c.CHARACTER_MAXIMUM_LENGTH as character_maximum_length,
                        c.IS_NULLABLE as is_nullable,
                        c.COLUMN_DEFAULT as column_default,
                        c.ORDINAL_POSITION as ordinal_position,
                        c.COLUMN_KEY as column_key,
                        c.EXTRA as extra
                    FROM INFORMATION_SCHEMA.COLUMNS c
                    WHERE c.TABLE_SCHEMA = %s
                        AND c.TABLE_NAME = %s
                    ORDER BY c.ORDINAL_POSITION
                """
                await cursor.execute(columns_query, (schema_name, table_name))
                columns_rows = await cursor.fetchall()

                # Get primary key and unique constraints
                constraints_query = """
                    SELECT
                        kcu.COLUMN_NAME,
                        tc.CONSTRAINT_TYPE
                    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                    JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
                        ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
                        AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
                        AND tc.TABLE_NAME = kcu.TABLE_NAME
                    WHERE tc.TABLE_SCHEMA = %s
                        AND tc.TABLE_NAME = %s
                        AND tc.CONSTRAINT_TYPE IN ('PRIMARY KEY', 'UNIQUE')
                """
                await cursor.execute(constraints_query, (schema_name, table_name))
                constraints_rows = await cursor.fetchall()

                # Build constraint maps
                primary_keys = set()
                unique_cols = set()
                for constraint in constraints_rows:
                    if constraint["CONSTRAINT_TYPE"] == "PRIMARY KEY":
                        primary_keys.add(constraint["COLUMN_NAME"])
                    elif constraint["CONSTRAINT_TYPE"] == "UNIQUE":
                        unique_cols.add(constraint["COLUMN_NAME"])

                # Build column metadata
                columns: List[Dict[str, Any]] = []
                for col_row in columns_rows:
                    data_type = col_row["data_type"]
                    if col_row["character_maximum_length"]:
                        data_type = f"{data_type}({col_row['character_maximum_length']})"

                    column_meta = {
                        "name": col_row["column_name"],
                        "dataType": data_type,
                        "nullable": col_row["is_nullable"] == "YES",
                        "primaryKey": col_row["column_name"] in primary_keys,
                        "unique": col_row["column_name"] in unique_cols,
                        "defaultValue": col_row["column_default"],
                    }
                    columns.append(column_meta)

                # Get row count for tables (not views)
                row_count = None
                if table_type == "table":
                    try:
                        count_query = f"SELECT COUNT(*) as count FROM `{schema_name}`.`{table_name}`"
                        await cursor.execute(count_query)
                        count_result = await cursor.fetchone()
                        if count_result:
                            row_count = count_result["count"]
                    except Exception:
                        # If count fails, leave as None
                        pass

                table_meta = {
                    "name": table_name,
                    "type": table_type,
                    "schemaName": schema_name,
                    "columns": columns,
                }
                if row_count is not None:
                    table_meta["rowCount"] = row_count

                if table_type == "table":
                    tables.append(table_meta)
                else:
                    views.append(table_meta)

            return {
                "tables": tables,
                "views": views,
            }
