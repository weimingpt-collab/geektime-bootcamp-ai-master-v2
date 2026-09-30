"""Database URL parser utility for detecting database type."""

from urllib.parse import urlparse
from app.models.database import DatabaseType


def detect_database_type(url: str) -> DatabaseType:
    """
    Detect database type from connection URL.

    Args:
        url: Database connection URL (e.g., postgresql://... or mysql://...)

    Returns:
        DatabaseType enum value

    Raises:
        ValueError: If database type cannot be determined or is unsupported
    """
    try:
        parsed = urlparse(url)
        scheme = parsed.scheme.lower()

        # Handle common PostgreSQL schemes
        if scheme in ("postgresql", "postgres"):
            return DatabaseType.POSTGRESQL

        # Handle common MySQL schemes
        if scheme in ("mysql", "mysql+pymysql", "mysql+aiomysql"):
            return DatabaseType.MYSQL

        raise ValueError(
            f"Unsupported database type: {scheme}. "
            f"Supported types: postgresql, postgres, mysql"
        )

    except Exception as e:
        raise ValueError(f"Failed to parse database URL: {str(e)}")
