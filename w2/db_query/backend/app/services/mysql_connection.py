"""Database connection service for managing MySQL connections."""

import aiomysql
from typing import Dict
from datetime import datetime
from app.models.database import DatabaseConnection, ConnectionStatus


# Global connection pool cache
_connection_pools: Dict[str, aiomysql.Pool] = {}


async def test_connection(url: str) -> tuple[bool, str | None]:
    """
    Test MySQL database connection.

    Args:
        url: MySQL connection URL (mysql://user:password@host:port/database)

    Returns:
        Tuple of (success, error_message)
    """
    try:
        # Parse MySQL URL
        # Format: mysql://user:password@host:port/database
        from urllib.parse import urlparse

        parsed = urlparse(url)

        # Extract connection parameters
        host = parsed.hostname or "localhost"
        port = parsed.port or 3306
        user = parsed.username or "root"
        password = parsed.password or ""
        database = parsed.path.lstrip("/") if parsed.path else None

        # Test connection
        conn = await aiomysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            db=database,
        )
        await conn.ensure_closed()
        return True, None
    except Exception as e:
        return False, str(e)


async def get_connection_pool(
    name: str, url: str, min_size: int = 1, max_size: int = 5
) -> aiomysql.Pool:
    """
    Get or create aiomysql connection pool for a database.

    Args:
        name: Database connection name
        url: MySQL connection URL
        min_size: Minimum pool size
        max_size: Maximum pool size

    Returns:
        aiomysql connection pool
    """
    if name not in _connection_pools:
        # Parse MySQL URL
        from urllib.parse import urlparse

        parsed = urlparse(url)

        # Extract connection parameters
        host = parsed.hostname or "localhost"
        port = parsed.port or 3306
        user = parsed.username or "root"
        password = parsed.password or ""
        database = parsed.path.lstrip("/") if parsed.path else None

        pool = await aiomysql.create_pool(
            host=host,
            port=port,
            user=user,
            password=password,
            db=database,
            minsize=min_size,
            maxsize=max_size,
            autocommit=True,
        )
        _connection_pools[name] = pool
    return _connection_pools[name]


async def close_connection_pool(name: str) -> None:
    """
    Close connection pool for a database.

    Args:
        name: Database connection name
    """
    if name in _connection_pools:
        pool = _connection_pools.pop(name)
        pool.close()
        await pool.wait_closed()


async def close_all_connection_pools() -> None:
    """Close all connection pools."""
    for name in list(_connection_pools.keys()):
        await close_connection_pool(name)
