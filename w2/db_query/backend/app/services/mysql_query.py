"""MySQL query execution service."""

import aiomysql
from typing import Dict, List, Any
from datetime import datetime


async def execute_query(pool: aiomysql.Pool, sql: str) -> Dict[str, Any]:
    """
    Execute SQL query against MySQL database.

    Args:
        pool: aiomysql connection pool
        sql: SQL query string

    Returns:
        Dictionary with columns, rows, and execution metadata

    Raises:
        Exception: If query execution fails
    """
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            # Execute query
            await cursor.execute(sql)

            # Fetch all rows
            rows = await cursor.fetchall()

            # Get column metadata from cursor description
            columns: List[Dict[str, str]] = []
            if cursor.description:
                for desc in cursor.description:
                    column_name = desc[0]
                    # Map MySQL type codes to type names
                    type_code = desc[1]
                    data_type = _map_mysql_type(type_code)

                    columns.append({"name": column_name, "dataType": data_type})

            # Convert rows to list of dictionaries
            result_rows: List[Dict[str, Any]] = []
            for row in rows:
                # Convert datetime objects to strings for JSON serialization
                processed_row = {}
                for key, value in row.items():
                    if isinstance(value, datetime):
                        processed_row[key] = value.isoformat()
                    else:
                        processed_row[key] = value
                result_rows.append(processed_row)

            return {
                "columns": columns,
                "rows": result_rows,
                "rowCount": len(result_rows),
            }


def _map_mysql_type(type_code: int) -> str:
    """
    Map MySQL type codes to human-readable type names.

    Args:
        type_code: MySQL field type code

    Returns:
        Human-readable type name
    """
    # MySQL type codes from aiomysql/pymysql
    # Reference: https://dev.mysql.com/doc/dev/mysql-server/latest/field__types_8h.html
    type_map = {
        0: "DECIMAL",
        1: "TINY",
        2: "SHORT",
        3: "LONG",
        4: "FLOAT",
        5: "DOUBLE",
        6: "NULL",
        7: "TIMESTAMP",
        8: "LONGLONG",
        9: "INT24",
        10: "DATE",
        11: "TIME",
        12: "DATETIME",
        13: "YEAR",
        14: "NEWDATE",
        15: "VARCHAR",
        16: "BIT",
        245: "JSON",
        246: "NEWDECIMAL",
        247: "ENUM",
        248: "SET",
        249: "TINY_BLOB",
        250: "MEDIUM_BLOB",
        251: "LONG_BLOB",
        252: "BLOB",
        253: "VAR_STRING",
        254: "STRING",
        255: "GEOMETRY",
    }

    return type_map.get(type_code, f"UNKNOWN({type_code})")
