import os

import pytest
import sqlalchemy as sa
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models.ticket import TicketStatus

# 使用环境变量中的数据库URL，如果没有则使用SQLite
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# SQLite需要特殊的connect_args，PostgreSQL不需要
connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Module-scoped fixture for database setup
# For PostgreSQL, we assume migrations have been run externally
# For SQLite, we create tables here
@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Setup database once for all tests"""
    if "sqlite" in SQLALCHEMY_DATABASE_URL:
        # SQLite: 创建表
        Base.metadata.create_all(bind=engine)
        yield
        Base.metadata.drop_all(bind=engine)
    else:
        # PostgreSQL: 假设已经运行了migrations（包含触发器）
        yield


@pytest.fixture(scope="function")
def db():
    # 获取数据库连接
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        # 清理数据
        if "postgresql" in SQLALCHEMY_DATABASE_URL:
            # PostgreSQL: 使用TRUNCATE清理数据（保留表结构和触发器）
            db.execute(
                sa.text("TRUNCATE TABLE ticket_tags, tickets, tags RESTART IDENTITY CASCADE")
            )
            db.commit()
        else:
            # SQLite: 删除所有数据
            for table in reversed(Base.metadata.sorted_tables):
                db.execute(table.delete())
            db.commit()
        db.close()


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
