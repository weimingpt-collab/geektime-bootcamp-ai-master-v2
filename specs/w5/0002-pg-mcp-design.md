# PostgreSQL MCP Server - 技术设计文档

## 文档信息

| 项目     | 内容              |
|----------|-------------------|
| 文档版本 | v1.0              |
| 创建日期 | 2025-12-20        |
| 状态     | 草稿              |
| 关联 PRD | 0001-pg-mcp-prd.md |
| 项目代号 | pg-mcp            |

---

## 1. 概述

### 1.1 设计目标

基于 PRD 需求，设计一个安全、高性能、可扩展的 PostgreSQL MCP 服务器，实现自然语言到 SQL 的转换和执行。

### 1.2 技术栈

| 组件             | 技术选择                    | 版本要求   | 用途                     |
|------------------|-----------------------------|------------|--------------------------|
| MCP 框架         | FastMCP                     | 2.0+       | MCP 协议服务器实现       |
| PostgreSQL 驱动  | asyncpg                     | 0.29+      | 异步数据库连接和查询     |
| SQL 解析         | SQLGlot                     | 26.0+      | SQL 解析、验证和转换     |
| 数据模型         | Pydantic                    | 2.0+       | 配置管理和数据验证       |
| LLM 集成         | openai                      | 1.50+      | 自然语言转 SQL           |
| 异步运行时       | asyncio (内置)              | Python 3.11+ | 异步 I/O                 |

### 1.3 设计原则

1. **安全第一**：多层防御，所有 SQL 必须经过严格验证
2. **异步优先**：全链路异步，最大化并发性能
3. **单一职责**：组件职责清晰，便于测试和维护
4. **故障隔离**：熔断器和超时机制防止级联故障
5. **可观测性**：内置指标、日志和链路追踪

---

## 2. 系统架构

### 2.1 架构总览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MCP Client                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ MCP Protocol (stdio/SSE)
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FastMCP Server Layer                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Tool: query()                                │    │
│  │  - Request validation (Pydantic)                                     │    │
│  │  - Rate limiting                                                     │    │
│  │  - Request ID generation                                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Query Orchestrator                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ SQL Generator│→ │ SQL Validator│→ │ SQL Executor │→ │Result Validator│   │
│  │  (OpenAI)    │  │  (SQLGlot)   │  │  (asyncpg)   │  │   (OpenAI)    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│   Schema Cache       │ │  Connection Pool     │ │   Circuit Breaker    │
│  (In-Memory)         │ │    (asyncpg)         │ │   (LLM/DB)           │
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘
              │                     │
              ▼                     ▼
┌──────────────────────┐ ┌──────────────────────┐
│   PostgreSQL DB      │ │    OpenAI API        │
└──────────────────────┘ └──────────────────────┘
```

### 2.2 分层架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      Presentation Layer                          │
│  - FastMCP Server                                                │
│  - Tool definitions                                              │
│  - Request/Response serialization                                │
├─────────────────────────────────────────────────────────────────┤
│                       Service Layer                              │
│  - QueryOrchestrator (核心协调器)                                │
│  - SQLGenerator (LLM 调用)                                       │
│  - SQLValidator (安全验证)                                       │
│  - SQLExecutor (查询执行)                                        │
│  - ResultValidator (结果验证)                                    │
├─────────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                          │
│  - SchemaCache (Schema 缓存)                                     │
│  - ConnectionPool (连接池管理)                                   │
│  - CircuitBreaker (熔断器)                                       │
│  - MetricsCollector (指标收集)                                   │
├─────────────────────────────────────────────────────────────────┤
│                       External Services                          │
│  - PostgreSQL Database                                           │
│  - OpenAI API                                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 项目结构

```
pg-mcp/
├── pyproject.toml                 # 项目配置和依赖
├── README.md
├── .env.example                   # 环境变量示例
│
├── src/
│   └── pg_mcp/
│       ├── __init__.py
│       ├── __main__.py            # 入口点
│       ├── server.py              # FastMCP 服务器定义
│       │
│       ├── config/                # 配置管理
│       │   ├── __init__.py
│       │   └── settings.py        # Pydantic Settings
│       │
│       ├── models/                # Pydantic 数据模型
│       │   ├── __init__.py
│       │   ├── schema.py          # Schema 相关模型
│       │   ├── query.py           # 查询请求/响应模型
│       │   └── errors.py          # 错误模型
│       │
│       ├── services/              # 核心服务
│       │   ├── __init__.py
│       │   ├── orchestrator.py    # 查询协调器
│       │   ├── sql_generator.py   # SQL 生成 (OpenAI)
│       │   ├── sql_validator.py   # SQL 验证 (SQLGlot)
│       │   ├── sql_executor.py    # SQL 执行 (asyncpg)
│       │   └── result_validator.py # 结果验证 (OpenAI)
│       │
│       ├── cache/                 # 缓存管理
│       │   ├── __init__.py
│       │   └── schema_cache.py    # Schema 缓存
│       │
│       ├── db/                    # 数据库层
│       │   ├── __init__.py
│       │   ├── pool.py            # 连接池管理
│       │   └── introspection.py   # Schema 内省查询
│       │
│       ├── resilience/            # 弹性组件
│       │   ├── __init__.py
│       │   ├── circuit_breaker.py # 熔断器
│       │   ├── rate_limiter.py    # 限流器
│       │   └── retry.py           # 重试策略
│       │
│       ├── observability/         # 可观测性
│       │   ├── __init__.py
│       │   ├── metrics.py         # Prometheus 指标
│       │   ├── logging.py         # 结构化日志
│       │   └── tracing.py         # OpenTelemetry 追踪
│       │
│       └── prompts/               # LLM Prompt 模板
│           ├── __init__.py
│           ├── sql_generation.py  # SQL 生成 prompt
│           └── result_validation.py # 结果验证 prompt
│
└── tests/
    ├── __init__.py
    ├── conftest.py                # pytest fixtures
    ├── unit/                      # 单元测试
    ├── integration/               # 集成测试
    └── e2e/                       # 端到端测试
```

---

## 4. 核心组件设计

### 4.1 配置管理 (Pydantic Settings)

```python
# src/pg_mcp/config/settings.py

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseConfig(BaseSettings):
    """单个数据库连接配置"""
    model_config = SettingsConfigDict(extra="forbid")

    name: str = Field(..., description="数据库标识名称")
    host: str = Field(default="localhost")
    port: int = Field(default=5432, ge=1, le=65535)
    user: str = Field(...)
    password: SecretStr = Field(...)
    database: str = Field(...)
    ssl_mode: str = Field(default="prefer", pattern="^(disable|allow|prefer|require|verify-ca|verify-full)$")

    # 连接池配置
    min_connections: int = Field(default=2, ge=1)
    max_connections: int = Field(default=20, ge=1)
    connection_timeout: float = Field(default=10.0, ge=1.0)


class OpenAIConfig(BaseSettings):
    """OpenAI API 配置"""
    model_config = SettingsConfigDict(extra="forbid")

    api_key: SecretStr = Field(...)
    model: str = Field(default="gpt-5.2-mini")
    max_tokens: int = Field(default=4096, ge=100, le=16384)
    temperature: float = Field(default=0.0, ge=0.0, le=2.0)
    timeout: float = Field(default=30.0, ge=5.0)


class SecurityConfig(BaseSettings):
    """安全配置"""
    model_config = SettingsConfigDict(extra="forbid")

    query_timeout_seconds: int = Field(default=30, ge=1, le=300)
    max_result_rows: int = Field(default=10000, ge=1, le=100000)
    blocked_tables: list[str] = Field(default_factory=list)
    blocked_columns: list[str] = Field(default_factory=list)
    blocked_functions: list[str] = Field(
        default_factory=lambda: [
            "pg_sleep", "pg_terminate_backend", "pg_cancel_backend",
            "pg_reload_conf", "pg_rotate_logfile", "lo_import", "lo_export"
        ]
    )
    allow_explain: bool = Field(default=False)
    readonly_role: str | None = Field(default=None, description="强制切换到的只读角色")
    safe_search_path: str = Field(default="public", description="安全的 search_path 设置")


class ValidationConfig(BaseSettings):
    """结果验证配置"""
    model_config = SettingsConfigDict(extra="forbid")

    enabled: bool = Field(default=True)
    confidence_threshold: int = Field(default=70, ge=0, le=100)
    max_retries: int = Field(default=2, ge=0, le=5)
    timeout_seconds: float = Field(default=10.0, ge=1.0)
    sample_rows: int = Field(default=10, ge=1, le=100)


class CacheConfig(BaseSettings):
    """缓存配置"""
    model_config = SettingsConfigDict(extra="forbid")

    auto_refresh: bool = Field(default=True)
    refresh_interval_minutes: int = Field(default=60, ge=1)
    startup_timeout_seconds: float = Field(default=30.0, ge=5.0)


class ResilienceConfig(BaseSettings):
    """弹性配置"""
    model_config = SettingsConfigDict(extra="forbid")

    # 熔断器配置
    circuit_breaker_failure_threshold: int = Field(default=5, ge=1)
    circuit_breaker_recovery_timeout: int = Field(default=30, ge=5)

    # 限流配置
    max_concurrent_queries: int = Field(default=10, ge=1)
    max_concurrent_llm_calls: int = Field(default=5, ge=1)
    request_queue_size: int = Field(default=100, ge=10)

    # 重试配置
    db_retry_attempts: int = Field(default=3, ge=0)
    db_retry_delay: float = Field(default=1.0, ge=0.1)


class Settings(BaseSettings):
    """主配置类"""
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_nested_delimiter="__",
        extra="ignore",
    )

    # 服务配置
    service_name: str = Field(default="pg-mcp")
    log_level: str = Field(default="INFO", pattern="^(DEBUG|INFO|WARNING|ERROR|CRITICAL)$")
    log_format: str = Field(default="json", pattern="^(json|text)$")

    # 子配置
    databases: list[DatabaseConfig] = Field(default_factory=list)
    openai: OpenAIConfig = Field(default_factory=OpenAIConfig)
    security: SecurityConfig = Field(default_factory=SecurityConfig)
    validation: ValidationConfig = Field(default_factory=ValidationConfig)
    cache: CacheConfig = Field(default_factory=CacheConfig)
    resilience: ResilienceConfig = Field(default_factory=ResilienceConfig)

    @field_validator("databases")
    @classmethod
    def validate_databases(cls, v: list[DatabaseConfig]) -> list[DatabaseConfig]:
        if not v:
            raise ValueError("至少需要配置一个数据库")
        names = [db.name for db in v]
        if len(names) != len(set(names)):
            raise ValueError("数据库名称必须唯一")
        return v
```

### 4.2 数据模型 (Pydantic Models)

```python
# src/pg_mcp/models/schema.py

from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class ColumnInfo(BaseModel):
    """列信息"""
    name: str
    data_type: str
    is_nullable: bool
    default_value: str | None = None
    is_primary_key: bool = False
    comment: str | None = None


class ForeignKeyInfo(BaseModel):
    """外键信息"""
    column: str
    references_table: str
    references_column: str
    constraint_name: str


class IndexInfo(BaseModel):
    """索引信息"""
    name: str
    columns: list[str]
    is_unique: bool
    is_primary: bool
    index_type: str  # btree, hash, gin, gist, etc.


class TableInfo(BaseModel):
    """表信息"""
    schema_name: str = Field(default="public")
    table_name: str
    table_type: str = Field(default="BASE TABLE")  # BASE TABLE, VIEW
    columns: list[ColumnInfo] = Field(default_factory=list)
    primary_key: list[str] = Field(default_factory=list)
    foreign_keys: list[ForeignKeyInfo] = Field(default_factory=list)
    indexes: list[IndexInfo] = Field(default_factory=list)
    comment: str | None = None
    row_count_estimate: int | None = None


class EnumTypeInfo(BaseModel):
    """枚举类型信息"""
    schema_name: str
    type_name: str
    values: list[str]


class DatabaseSchema(BaseModel):
    """数据库 Schema 完整信息"""
    database_name: str
    tables: list[TableInfo] = Field(default_factory=list)
    views: list[TableInfo] = Field(default_factory=list)
    enum_types: list[EnumTypeInfo] = Field(default_factory=list)
    cached_at: datetime = Field(default_factory=datetime.utcnow)
    version: str = Field(default="1.0")

    def get_table(self, name: str, schema: str = "public") -> TableInfo | None:
        """根据名称查找表"""
        for table in self.tables + self.views:
            if table.table_name == name and table.schema_name == schema:
                return table
        return None

    def to_prompt_context(self, max_tables: int | None = None) -> str:
        """生成用于 LLM prompt 的 schema 上下文"""
        lines = [f"Database: {self.database_name}\n"]

        tables_to_include = self.tables[:max_tables] if max_tables else self.tables

        for table in tables_to_include:
            lines.append(f"\nTable: {table.schema_name}.{table.table_name}")
            if table.comment:
                lines.append(f"  -- {table.comment}")
            lines.append("  Columns:")
            for col in table.columns:
                pk_marker = " [PK]" if col.is_primary_key else ""
                null_marker = "" if col.is_nullable else " NOT NULL"
                comment = f" -- {col.comment}" if col.comment else ""
                lines.append(f"    - {col.name}: {col.data_type}{pk_marker}{null_marker}{comment}")

            if table.foreign_keys:
                lines.append("  Foreign Keys:")
                for fk in table.foreign_keys:
                    lines.append(f"    - {fk.column} -> {fk.references_table}.{fk.references_column}")

        return "\n".join(lines)
```

```python
# src/pg_mcp/models/query.py

from datetime import datetime
from enum import Enum
from typing import Any
from pydantic import BaseModel, Field


class ReturnType(str, Enum):
    SQL = "sql"
    RESULT = "result"


class QueryRequest(BaseModel):
    """查询请求模型"""
    question: str = Field(..., min_length=1, max_length=10000)
    database: str | None = Field(default=None)
    return_type: ReturnType = Field(default=ReturnType.RESULT)


class ValidationResult(BaseModel):
    """结果验证结果"""
    confidence: int = Field(ge=0, le=100)
    explanation: str
    suggestion: str | None = None
    is_acceptable: bool


class QueryResult(BaseModel):
    """查询结果（成功响应）"""
    sql: str
    executed: bool
    result: list[dict[str, Any]] | None = None
    row_count: int | None = None
    confidence: int | None = None
    explanation: str | None = None
    warning: str | None = None


class QueryResponse(BaseModel):
    """查询响应（MCP Tool 返回）"""
    success: bool
    data: QueryResult | None = None
    error: "ErrorDetail | None" = None
    request_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Forward reference for ErrorDetail
from pg_mcp.models.errors import ErrorDetail
QueryResponse.model_rebuild()
```

```python
# src/pg_mcp/models/errors.py

from enum import Enum
from pydantic import BaseModel, Field


class ErrorCode(str, Enum):
    """错误码枚举"""
    SUCCESS = "SUCCESS"
    BAD_REQUEST = "BAD_REQUEST"
    SCHEMA_NOT_FOUND = "SCHEMA_NOT_FOUND"
    SECURITY_VIOLATION = "SECURITY_VIOLATION"
    SQL_PARSE_ERROR = "SQL_PARSE_ERROR"
    QUERY_TIMEOUT = "QUERY_TIMEOUT"
    LLM_ERROR = "LLM_ERROR"
    LLM_UNAVAILABLE = "LLM_UNAVAILABLE"
    DB_CONNECTION_ERROR = "DB_CONNECTION_ERROR"
    RATE_LIMITED = "RATE_LIMITED"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    INTERNAL_ERROR = "INTERNAL_ERROR"


class ErrorDetail(BaseModel):
    """错误详情"""
    code: ErrorCode
    message: str
    details: str | None = None
    suggestion: str | None = None


class PgMcpError(Exception):
    """pg-mcp 基础异常"""
    def __init__(self, code: ErrorCode, message: str, details: str | None = None, suggestion: str | None = None):
        self.code = code
        self.message = message
        self.details = details
        self.suggestion = suggestion
        super().__init__(message)

    def to_error_detail(self) -> ErrorDetail:
        return ErrorDetail(
            code=self.code,
            message=self.message,
            details=self.details,
            suggestion=self.suggestion,
        )


class SecurityViolationError(PgMcpError):
    """安全违规错误"""
    def __init__(self, message: str, details: str | None = None):
        super().__init__(
            code=ErrorCode.SECURITY_VIOLATION,
            message=message,
            details=details,
            suggestion="请使用 SELECT 语句进行数据查询",
        )


class SQLParseError(PgMcpError):
    """SQL 解析错误"""
    def __init__(self, message: str, details: str | None = None):
        super().__init__(
            code=ErrorCode.SQL_PARSE_ERROR,
            message=message,
            details=details,
            suggestion="请检查查询描述是否清晰",
        )


class LLMError(PgMcpError):
    """LLM 调用错误"""
    def __init__(self, message: str, details: str | None = None):
        super().__init__(
            code=ErrorCode.LLM_ERROR,
            message=message,
            details=details,
            suggestion="请稍后重试",
        )


class LLMUnavailableError(PgMcpError):
    """LLM 服务不可用（熔断）"""
    def __init__(self):
        super().__init__(
            code=ErrorCode.LLM_UNAVAILABLE,
            message="LLM 服务暂时不可用",
            details="服务熔断中，请稍后重试",
            suggestion="请等待服务恢复后重试",
        )
```

### 4.3 SQL 验证器 (SQLGlot)

```python
# src/pg_mcp/services/sql_validator.py

import sqlglot
from sqlglot import exp
from sqlglot.errors import ParseError

from pg_mcp.config.settings import SecurityConfig
from pg_mcp.models.errors import SecurityViolationError, SQLParseError


class SQLValidator:
    """SQL 安全验证器 - 使用 SQLGlot 解析和验证 SQL"""

    # 允许的语句类型
    ALLOWED_STATEMENT_TYPES = {
        exp.Select,
    }

    # 允许的顶层表达式（WITH 语句等）
    ALLOWED_TOP_LEVEL = {
        exp.Select,
        exp.With,  # CTE
        exp.Subquery,
    }

    # 禁止的语句类型
    FORBIDDEN_STATEMENT_TYPES = {
        exp.Insert,
        exp.Update,
        exp.Delete,
        exp.Drop,
        exp.Create,
        exp.Alter,
        exp.Truncate,
        exp.Grant,
        exp.Revoke,
        exp.Set,  # 除特殊情况外禁止
        exp.Command,  # VACUUM, ANALYZE 等
    }

    # 内置危险函数黑名单
    BUILTIN_DANGEROUS_FUNCTIONS = {
        "pg_sleep",
        "pg_terminate_backend",
        "pg_cancel_backend",
        "pg_reload_conf",
        "pg_rotate_logfile",
        "pg_read_file",
        "pg_read_binary_file",
        "pg_ls_dir",
        "pg_stat_file",
        "lo_import",
        "lo_export",
        "dblink",
        "dblink_exec",
    }

    def __init__(self, config: SecurityConfig):
        self.config = config
        self.blocked_functions = (
            self.BUILTIN_DANGEROUS_FUNCTIONS | set(f.lower() for f in config.blocked_functions)
        )
        self.blocked_tables = set(t.lower() for t in config.blocked_tables)
        self.blocked_columns = set(c.lower() for c in config.blocked_columns)

    def validate(self, sql: str) -> tuple[bool, str | None]:
        """
        验证 SQL 是否安全

        Returns:
            (is_valid, error_message)
        """
        try:
            # 解析 SQL（使用 PostgreSQL 方言）
            parsed = sqlglot.parse(sql, dialect="postgres")

            if not parsed:
                return False, "无法解析 SQL 语句"

            # 可能有多条语句
            if len(parsed) > 1:
                return False, "不允许执行多条 SQL 语句"

            statement = parsed[0]

            # 检查语句类型
            error = self._check_statement_type(statement)
            if error:
                return False, error

            # 检查危险函数
            error = self._check_dangerous_functions(statement)
            if error:
                return False, error

            # 检查敏感表
            error = self._check_blocked_tables(statement)
            if error:
                return False, error

            # 检查敏感列
            error = self._check_blocked_columns(statement)
            if error:
                return False, error

            # 检查子查询中的写操作
            error = self._check_subquery_safety(statement)
            if error:
                return False, error

            return True, None

        except ParseError as e:
            return False, f"SQL 语法错误: {str(e)}"
        except Exception as e:
            return False, f"SQL 验证失败: {str(e)}"

    def validate_or_raise(self, sql: str) -> None:
        """验证 SQL，失败时抛出异常"""
        is_valid, error = self.validate(sql)
        if not is_valid:
            raise SecurityViolationError(
                message="SQL 安全验证失败",
                details=error,
            )

    def _check_statement_type(self, statement: exp.Expression) -> str | None:
        """检查语句类型是否允许"""
        # 获取根语句类型
        if isinstance(statement, exp.With):
            # CTE - 检查最终的 SELECT
            final_expr = statement.this
            if not isinstance(final_expr, exp.Select):
                return f"CTE 必须以 SELECT 语句结束，发现: {type(final_expr).__name__}"
        elif isinstance(statement, exp.Select):
            pass  # 允许
        elif isinstance(statement, exp.Command):
            # 检查是否是 EXPLAIN
            if self.config.allow_explain and statement.this and statement.this.upper().startswith("EXPLAIN"):
                pass  # 如果配置允许 EXPLAIN
            else:
                return f"不允许执行命令: {statement.this}"
        else:
            # 检查是否是禁止的类型
            for forbidden_type in self.FORBIDDEN_STATEMENT_TYPES:
                if isinstance(statement, forbidden_type):
                    return f"不允许的语句类型: {type(statement).__name__}"

            return f"不支持的语句类型: {type(statement).__name__}"

        return None

    def _check_dangerous_functions(self, statement: exp.Expression) -> str | None:
        """检查是否使用了危险函数"""
        for func in statement.find_all(exp.Func):
            func_name = func.name.lower() if hasattr(func, 'name') else ""
            if not func_name and hasattr(func, 'this'):
                func_name = str(func.this).lower()

            if func_name in self.blocked_functions:
                return f"禁止使用函数: {func_name}"

        return None

    def _check_blocked_tables(self, statement: exp.Expression) -> str | None:
        """检查是否访问了敏感表"""
        for table in statement.find_all(exp.Table):
            table_name = table.name.lower()
            schema_name = table.db.lower() if table.db else "public"
            full_name = f"{schema_name}.{table_name}"

            if table_name in self.blocked_tables or full_name in self.blocked_tables:
                return f"禁止访问表: {full_name}"

        return None

    def _check_blocked_columns(self, statement: exp.Expression) -> str | None:
        """检查是否访问了敏感列"""
        for column in statement.find_all(exp.Column):
            col_name = column.name.lower()
            table_name = column.table.lower() if column.table else ""

            if table_name:
                full_name = f"{table_name}.{col_name}"
                if full_name in self.blocked_columns:
                    return f"禁止访问列: {full_name}"

            if col_name in self.blocked_columns:
                return f"禁止访问列: {col_name}"

        return None

    def _check_subquery_safety(self, statement: exp.Expression) -> str | None:
        """检查子查询中是否有写操作"""
        for subquery in statement.find_all(exp.Subquery):
            inner = subquery.this
            for forbidden_type in self.FORBIDDEN_STATEMENT_TYPES:
                if isinstance(inner, forbidden_type):
                    return f"子查询中不允许: {type(inner).__name__}"

        return None

    def normalize_sql(self, sql: str) -> str:
        """规范化 SQL（格式化）"""
        try:
            parsed = sqlglot.parse_one(sql, dialect="postgres")
            return parsed.sql(dialect="postgres", pretty=True)
        except Exception:
            return sql  # 如果解析失败，返回原始 SQL

    def extract_tables(self, sql: str) -> list[str]:
        """提取 SQL 中引用的所有表名"""
        tables = []
        try:
            parsed = sqlglot.parse_one(sql, dialect="postgres")
            for table in parsed.find_all(exp.Table):
                schema = table.db if table.db else "public"
                tables.append(f"{schema}.{table.name}")
        except Exception:
            pass
        return tables
```

### 4.4 SQL 生成器 (OpenAI)

```python
# src/pg_mcp/services/sql_generator.py

import json
from openai import AsyncOpenAI
from openai.types.chat import ChatCompletion

from pg_mcp.config.settings import OpenAIConfig
from pg_mcp.models.schema import DatabaseSchema
from pg_mcp.models.errors import LLMError
from pg_mcp.prompts.sql_generation import SQL_GENERATION_SYSTEM_PROMPT, build_user_prompt
from pg_mcp.observability.metrics import MetricsCollector


class SQLGenerator:
    """SQL 生成器 - 使用 OpenAI 将自然语言转换为 SQL"""

    def __init__(
        self,
        config: OpenAIConfig,
        metrics: MetricsCollector | None = None,
    ):
        self.config = config
        self.client = AsyncOpenAI(api_key=config.api_key.get_secret_value())
        self.metrics = metrics

    async def generate(
        self,
        question: str,
        schema: DatabaseSchema,
        context: str | None = None,
        previous_attempt: str | None = None,
        error_feedback: str | None = None,
    ) -> str:
        """
        生成 SQL 语句

        Args:
            question: 用户的自然语言问题
            schema: 数据库 schema 信息
            context: 额外上下文信息
            previous_attempt: 之前生成的 SQL（用于重试）
            error_feedback: 错误反馈（用于重试）

        Returns:
            生成的 SQL 语句
        """
        # 构建 prompt
        system_prompt = SQL_GENERATION_SYSTEM_PROMPT
        user_prompt = build_user_prompt(
            question=question,
            schema=schema,
            context=context,
            previous_attempt=previous_attempt,
            error_feedback=error_feedback,
        )

        try:
            if self.metrics:
                self.metrics.llm_calls_total.labels(operation="generate").inc()

            response: ChatCompletion = await self.client.chat.completions.create(
                model=self.config.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
                timeout=self.config.timeout,
            )

            # 记录 token 使用
            if self.metrics and response.usage:
                self.metrics.llm_tokens_used.labels(operation="generate").inc(
                    response.usage.total_tokens
                )

            # 提取 SQL
            content = response.choices[0].message.content
            sql = self._extract_sql(content)

            if not sql:
                raise LLMError(
                    message="LLM 未生成有效的 SQL",
                    details=f"响应内容: {content[:200]}...",
                )

            return sql

        except Exception as e:
            if isinstance(e, LLMError):
                raise
            raise LLMError(
                message="SQL 生成失败",
                details=str(e),
            )

    def _extract_sql(self, content: str) -> str | None:
        """从 LLM 响应中提取 SQL"""
        if not content:
            return None

        # 尝试提取 markdown 代码块中的 SQL
        import re

        # 匹配 ```sql ... ``` 或 ``` ... ```
        code_block_pattern = r"```(?:sql)?\s*\n?(.*?)\n?```"
        matches = re.findall(code_block_pattern, content, re.DOTALL | re.IGNORECASE)

        if matches:
            return matches[0].strip()

        # 如果没有代码块，尝试查找以 SELECT/WITH 开头的内容
        sql_pattern = r"((?:WITH|SELECT)\s+.*?)(?:;|$)"
        matches = re.findall(sql_pattern, content, re.DOTALL | re.IGNORECASE)

        if matches:
            return matches[0].strip().rstrip(";") + ";"

        # 最后尝试直接返回内容（如果看起来像 SQL）
        content = content.strip()
        if content.upper().startswith(("SELECT", "WITH")):
            return content

        return None
```

```python
# src/pg_mcp/prompts/sql_generation.py

SQL_GENERATION_SYSTEM_PROMPT = """You are a PostgreSQL SQL expert. Your task is to convert natural language questions into valid PostgreSQL SQL queries.

## Rules:
1. ONLY generate SELECT queries or CTE (WITH ... SELECT) queries
2. NEVER generate INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, or any DDL/DML statements
3. Use proper PostgreSQL syntax and functions
4. Always use explicit table aliases for clarity
5. Include appropriate LIMIT clauses for potentially large result sets
6. Use proper date/time functions (CURRENT_DATE, CURRENT_TIMESTAMP, INTERVAL, etc.)
7. Handle NULL values appropriately
8. Use appropriate aggregation functions (COUNT, SUM, AVG, etc.) when needed

## Output Format:
Return ONLY the SQL query wrapped in ```sql ... ``` code block.
Do not include any explanation before or after the SQL.

## Example:
User: 查询过去7天的订单数量
```sql
SELECT COUNT(*) AS order_count
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
```
"""


def build_user_prompt(
    question: str,
    schema: "DatabaseSchema",
    context: str | None = None,
    previous_attempt: str | None = None,
    error_feedback: str | None = None,
) -> str:
    """构建用户 prompt"""
    parts = []

    # Schema 上下文
    parts.append("## Database Schema:")
    parts.append(schema.to_prompt_context())
    parts.append("")

    # 额外上下文
    if context:
        parts.append("## Additional Context:")
        parts.append(context)
        parts.append("")

    # 如果是重试，包含之前的尝试和错误
    if previous_attempt and error_feedback:
        parts.append("## Previous Attempt (Failed):")
        parts.append(f"```sql\n{previous_attempt}\n```")
        parts.append(f"Error: {error_feedback}")
        parts.append("Please fix the issue and generate a correct query.")
        parts.append("")

    # 用户问题
    parts.append("## Question:")
    parts.append(question)

    return "\n".join(parts)
```

### 4.5 SQL 执行器 (asyncpg)

```python
# src/pg_mcp/services/sql_executor.py

import asyncio
from typing import Any
import asyncpg
from asyncpg import Pool, Connection

from pg_mcp.config.settings import SecurityConfig, DatabaseConfig
from pg_mcp.models.errors import PgMcpError, ErrorCode
from pg_mcp.observability.metrics import MetricsCollector


class SQLExecutor:
    """SQL 执行器 - 使用 asyncpg 执行查询"""

    def __init__(
        self,
        pool: Pool,
        config: SecurityConfig,
        db_config: DatabaseConfig,
        metrics: MetricsCollector | None = None,
    ):
        self.pool = pool
        self.config = config
        self.db_config = db_config
        self.metrics = metrics

    async def execute(
        self,
        sql: str,
        timeout: float | None = None,
        max_rows: int | None = None,
    ) -> tuple[list[dict[str, Any]], int]:
        """
        执行 SQL 查询

        Args:
            sql: SQL 语句
            timeout: 查询超时（秒）
            max_rows: 最大返回行数

        Returns:
            (results, total_row_count)
        """
        timeout = timeout or self.config.query_timeout_seconds
        max_rows = max_rows or self.config.max_result_rows

        async with self.pool.acquire() as conn:
            conn: Connection

            try:
                # 开始只读事务
                async with conn.transaction(readonly=True):
                    # 设置安全参数
                    await self._set_session_params(conn, timeout)

                    # 执行查询
                    if self.metrics:
                        with self.metrics.db_query_duration_seconds.time():
                            records = await asyncio.wait_for(
                                conn.fetch(sql),
                                timeout=timeout,
                            )
                    else:
                        records = await asyncio.wait_for(
                            conn.fetch(sql),
                            timeout=timeout,
                        )

                    total_count = len(records)

                    # 限制返回行数
                    if len(records) > max_rows:
                        records = records[:max_rows]

                    # 转换为字典列表
                    results = [dict(record) for record in records]

                    # 处理特殊类型
                    results = self._serialize_results(results)

                    return results, total_count

            except asyncio.TimeoutError:
                raise PgMcpError(
                    code=ErrorCode.QUERY_TIMEOUT,
                    message=f"查询超时（>{timeout}秒）",
                    suggestion="请简化查询或增加超时时间",
                )
            except asyncpg.PostgresError as e:
                raise PgMcpError(
                    code=ErrorCode.INTERNAL_ERROR,
                    message="数据库查询错误",
                    details=str(e),
                )

    async def _set_session_params(self, conn: Connection, timeout: float) -> None:
        """设置会话参数以确保安全"""
        # 设置语句超时
        await conn.execute(f"SET statement_timeout = '{int(timeout * 1000)}'")

        # 设置安全的 search_path
        await conn.execute(f"SET search_path = '{self.config.safe_search_path}'")

        # 如果配置了只读角色，切换到该角色
        if self.config.readonly_role:
            await conn.execute(f"SET ROLE {self.config.readonly_role}")

    def _serialize_results(self, results: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """序列化结果中的特殊类型"""
        import datetime
        import decimal
        import uuid

        def serialize_value(value: Any) -> Any:
            if value is None:
                return None
            if isinstance(value, (datetime.datetime, datetime.date, datetime.time)):
                return value.isoformat()
            if isinstance(value, datetime.timedelta):
                return str(value)
            if isinstance(value, decimal.Decimal):
                return float(value)
            if isinstance(value, uuid.UUID):
                return str(value)
            if isinstance(value, bytes):
                return value.hex()
            if isinstance(value, (list, tuple)):
                return [serialize_value(v) for v in value]
            if isinstance(value, dict):
                return {k: serialize_value(v) for k, v in value.items()}
            return value

        return [
            {k: serialize_value(v) for k, v in row.items()}
            for row in results
        ]
```

### 4.6 结果验证器 (OpenAI)

```python
# src/pg_mcp/services/result_validator.py

import json
from openai import AsyncOpenAI

from pg_mcp.config.settings import OpenAIConfig, ValidationConfig
from pg_mcp.models.query import ValidationResult
from pg_mcp.models.errors import LLMError
from pg_mcp.prompts.result_validation import RESULT_VALIDATION_SYSTEM_PROMPT, build_validation_prompt


class ResultValidator:
    """结果验证器 - 使用 LLM 验证查询结果是否符合用户意图"""

    def __init__(
        self,
        openai_config: OpenAIConfig,
        validation_config: ValidationConfig,
    ):
        self.openai_config = openai_config
        self.validation_config = validation_config
        self.client = AsyncOpenAI(api_key=openai_config.api_key.get_secret_value())

    async def validate(
        self,
        question: str,
        sql: str,
        results: list[dict],
        row_count: int,
    ) -> ValidationResult:
        """
        验证查询结果

        Args:
            question: 原始用户问题
            sql: 执行的 SQL
            results: 查询结果（样本）
            row_count: 总行数

        Returns:
            ValidationResult
        """
        if not self.validation_config.enabled:
            return ValidationResult(
                confidence=100,
                explanation="验证已禁用",
                is_acceptable=True,
            )

        # 只取前 N 行作为样本
        sample_results = results[:self.validation_config.sample_rows]

        prompt = build_validation_prompt(
            question=question,
            sql=sql,
            results=sample_results,
            row_count=row_count,
        )

        try:
            response = await self.client.chat.completions.create(
                model=self.openai_config.model,
                messages=[
                    {"role": "system", "content": RESULT_VALIDATION_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=500,
                temperature=0,
                timeout=self.validation_config.timeout_seconds,
                response_format={"type": "json_object"},
            )

            content = response.choices[0].message.content
            result_dict = json.loads(content)

            confidence = result_dict.get("confidence", 50)
            is_acceptable = confidence >= self.validation_config.confidence_threshold

            return ValidationResult(
                confidence=confidence,
                explanation=result_dict.get("explanation", ""),
                suggestion=result_dict.get("suggestion"),
                is_acceptable=is_acceptable,
            )

        except json.JSONDecodeError as e:
            # 如果 JSON 解析失败，返回中等置信度
            return ValidationResult(
                confidence=60,
                explanation="验证响应解析失败",
                is_acceptable=False,
            )
        except Exception as e:
            raise LLMError(
                message="结果验证失败",
                details=str(e),
            )
```

```python
# src/pg_mcp/prompts/result_validation.py

RESULT_VALIDATION_SYSTEM_PROMPT = """You are a SQL query result validator. Your task is to evaluate whether the query results match the user's original question.

Analyze:
1. Does the SQL query correctly interpret the user's intent?
2. Do the results make sense given the question?
3. Are there any obvious errors or mismatches?

Return a JSON object with:
{
  "confidence": <0-100 integer>,
  "explanation": "<brief explanation>",
  "suggestion": "<optional improvement suggestion or null>"
}

Confidence levels:
- 90-100: Results clearly match the question
- 70-89: Results likely match, minor uncertainties
- 50-69: Results may not fully match
- 0-49: Results likely don't match the question
"""


def build_validation_prompt(
    question: str,
    sql: str,
    results: list[dict],
    row_count: int,
) -> str:
    """构建验证 prompt"""
    import json

    results_preview = json.dumps(results, ensure_ascii=False, indent=2, default=str)

    return f"""## Original Question:
{question}

## Executed SQL:
```sql
{sql}
```

## Results (showing {len(results)} of {row_count} rows):
```json
{results_preview}
```

Please evaluate if the results match the user's question."""
```

### 4.7 查询协调器

```python
# src/pg_mcp/services/orchestrator.py

import uuid
from datetime import datetime

from pg_mcp.config.settings import Settings
from pg_mcp.models.query import QueryRequest, QueryResponse, QueryResult, ReturnType
from pg_mcp.models.errors import (
    ErrorCode, ErrorDetail, PgMcpError, SecurityViolationError,
    SQLParseError, LLMError, LLMUnavailableError
)
from pg_mcp.services.sql_generator import SQLGenerator
from pg_mcp.services.sql_validator import SQLValidator
from pg_mcp.services.sql_executor import SQLExecutor
from pg_mcp.services.result_validator import ResultValidator
from pg_mcp.cache.schema_cache import SchemaCache
from pg_mcp.resilience.circuit_breaker import CircuitBreaker
from pg_mcp.observability.metrics import MetricsCollector
from pg_mcp.observability.logging import get_logger


logger = get_logger(__name__)


class QueryOrchestrator:
    """查询协调器 - 协调整个查询流程"""

    def __init__(
        self,
        settings: Settings,
        schema_cache: SchemaCache,
        sql_generator: SQLGenerator,
        sql_validator: SQLValidator,
        executors: dict[str, SQLExecutor],  # database_name -> executor
        result_validator: ResultValidator,
        llm_circuit_breaker: CircuitBreaker,
        metrics: MetricsCollector | None = None,
    ):
        self.settings = settings
        self.schema_cache = schema_cache
        self.sql_generator = sql_generator
        self.sql_validator = sql_validator
        self.executors = executors
        self.result_validator = result_validator
        self.llm_circuit_breaker = llm_circuit_breaker
        self.metrics = metrics

    async def execute_query(self, request: QueryRequest) -> QueryResponse:
        """
        执行完整的查询流程

        1. 确定目标数据库
        2. 获取 Schema
        3. 生成 SQL（LLM）
        4. 验证 SQL（SQLGlot）
        5. 执行 SQL（可选）
        6. 验证结果（可选，LLM）
        7. 返回响应
        """
        request_id = f"req_{uuid.uuid4().hex[:12]}"
        start_time = datetime.utcnow()

        try:
            # 1. 确定目标数据库
            db_name = self._resolve_database(request.database)

            # 2. 获取 Schema
            schema = self.schema_cache.get(db_name)
            if not schema:
                raise PgMcpError(
                    code=ErrorCode.SCHEMA_NOT_FOUND,
                    message=f"数据库 '{db_name}' 的 Schema 未找到",
                    suggestion="请检查数据库名称或刷新缓存",
                )

            # 3. 生成 SQL（带重试）
            sql = await self._generate_sql_with_retry(
                question=request.question,
                schema=schema,
                max_retries=self.settings.validation.max_retries,
            )

            # 4. 如果只需要 SQL，直接返回
            if request.return_type == ReturnType.SQL:
                return QueryResponse(
                    success=True,
                    data=QueryResult(sql=sql, executed=False),
                    request_id=request_id,
                )

            # 5. 执行 SQL
            executor = self.executors.get(db_name)
            if not executor:
                raise PgMcpError(
                    code=ErrorCode.DB_CONNECTION_ERROR,
                    message=f"数据库 '{db_name}' 连接不可用",
                )

            results, total_count = await executor.execute(sql)

            # 6. 验证结果（可选）
            validation = None
            warning = None

            if self.settings.validation.enabled and results:
                validation = await self._validate_results_safely(
                    question=request.question,
                    sql=sql,
                    results=results,
                    row_count=total_count,
                )

                if validation and not validation.is_acceptable:
                    warning = f"置信度较低 ({validation.confidence}%): {validation.explanation}"
                    if validation.suggestion:
                        warning += f" 建议: {validation.suggestion}"

            # 7. 构建响应
            return QueryResponse(
                success=True,
                data=QueryResult(
                    sql=sql,
                    executed=True,
                    result=results,
                    row_count=total_count,
                    confidence=validation.confidence if validation else None,
                    explanation=validation.explanation if validation else None,
                    warning=warning,
                ),
                request_id=request_id,
            )

        except PgMcpError as e:
            logger.warning(f"Query failed: {e.code} - {e.message}", request_id=request_id)
            return QueryResponse(
                success=False,
                error=e.to_error_detail(),
                request_id=request_id,
            )
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", request_id=request_id, exc_info=True)
            return QueryResponse(
                success=False,
                error=ErrorDetail(
                    code=ErrorCode.INTERNAL_ERROR,
                    message="内部服务错误",
                    details=str(e) if self.settings.log_level == "DEBUG" else None,
                ),
                request_id=request_id,
            )
        finally:
            # 记录指标
            if self.metrics:
                duration = (datetime.utcnow() - start_time).total_seconds()
                self.metrics.query_duration_seconds.observe(duration)

    def _resolve_database(self, database: str | None) -> str:
        """解析目标数据库名称"""
        if database:
            # 检查是否存在
            if not any(db.name == database for db in self.settings.databases):
                raise PgMcpError(
                    code=ErrorCode.SCHEMA_NOT_FOUND,
                    message=f"数据库 '{database}' 未配置",
                )
            return database

        # 如果只有一个数据库，自动选择
        if len(self.settings.databases) == 1:
            return self.settings.databases[0].name

        raise PgMcpError(
            code=ErrorCode.BAD_REQUEST,
            message="请指定目标数据库",
            suggestion=f"可用数据库: {', '.join(db.name for db in self.settings.databases)}",
        )

    async def _generate_sql_with_retry(
        self,
        question: str,
        schema: "DatabaseSchema",
        max_retries: int,
    ) -> str:
        """生成 SQL，带验证和重试"""
        previous_sql = None
        error_feedback = None

        for attempt in range(max_retries + 1):
            # 检查熔断器
            if not self.llm_circuit_breaker.allow_request():
                raise LLMUnavailableError()

            try:
                # 生成 SQL
                sql = await self.sql_generator.generate(
                    question=question,
                    schema=schema,
                    previous_attempt=previous_sql,
                    error_feedback=error_feedback,
                )

                # 验证 SQL
                self.sql_validator.validate_or_raise(sql)

                # 记录成功
                self.llm_circuit_breaker.record_success()

                return sql

            except SecurityViolationError as e:
                # 安全违规，重试
                previous_sql = sql
                error_feedback = e.details or e.message
                logger.info(f"SQL validation failed, attempt {attempt + 1}/{max_retries + 1}")

            except LLMError as e:
                self.llm_circuit_breaker.record_failure()
                raise

        # 所有重试都失败
        raise SecurityViolationError(
            message="无法生成安全的 SQL 语句",
            details=f"尝试 {max_retries + 1} 次后仍无法通过安全验证",
        )

    async def _validate_results_safely(
        self,
        question: str,
        sql: str,
        results: list[dict],
        row_count: int,
    ) -> "ValidationResult | None":
        """安全地验证结果（失败不影响主流程）"""
        try:
            if not self.llm_circuit_breaker.allow_request():
                return None

            result = await self.result_validator.validate(
                question=question,
                sql=sql,
                results=results,
                row_count=row_count,
            )
            self.llm_circuit_breaker.record_success()
            return result

        except Exception as e:
            self.llm_circuit_breaker.record_failure()
            logger.warning(f"Result validation failed: {e}")
            return None
```

### 4.8 FastMCP 服务器

```python
# src/pg_mcp/server.py

from mcp.server.fastmcp import FastMCP

from pg_mcp.config.settings import Settings
from pg_mcp.models.query import QueryRequest, QueryResponse, ReturnType
from pg_mcp.services.orchestrator import QueryOrchestrator
from pg_mcp.observability.logging import get_logger

logger = get_logger(__name__)

# 创建 FastMCP 服务器实例
mcp = FastMCP("pg-mcp")


# 全局引用（在 lifespan 中初始化）
_orchestrator: QueryOrchestrator | None = None
_settings: Settings | None = None


def get_orchestrator() -> QueryOrchestrator:
    if _orchestrator is None:
        raise RuntimeError("Orchestrator not initialized")
    return _orchestrator


@mcp.tool()
async def query(
    question: str,
    database: str | None = None,
    return_type: str = "result",
) -> dict:
    """
    Execute a natural language query against PostgreSQL database.

    Args:
        question: Natural language description of the query
        database: Target database name (optional if only one database configured)
        return_type: "sql" to return only SQL, "result" to execute and return results

    Returns:
        Query result containing SQL and/or execution results
    """
    orchestrator = get_orchestrator()

    # 验证 return_type
    try:
        rt = ReturnType(return_type)
    except ValueError:
        rt = ReturnType.RESULT

    request = QueryRequest(
        question=question,
        database=database,
        return_type=rt,
    )

    response: QueryResponse = await orchestrator.execute_query(request)

    # 转换为字典返回
    return response.model_dump(mode="json", exclude_none=True)


# Lifespan 管理
@mcp.lifespan
async def lifespan():
    """服务器生命周期管理"""
    global _orchestrator, _settings

    logger.info("Starting pg-mcp server...")

    # 加载配置
    _settings = Settings()
    logger.info(f"Loaded configuration for {len(_settings.databases)} database(s)")

    # 初始化组件
    from pg_mcp.cache.schema_cache import SchemaCache
    from pg_mcp.db.pool import create_pools
    from pg_mcp.services.sql_generator import SQLGenerator
    from pg_mcp.services.sql_validator import SQLValidator
    from pg_mcp.services.sql_executor import SQLExecutor
    from pg_mcp.services.result_validator import ResultValidator
    from pg_mcp.resilience.circuit_breaker import CircuitBreaker
    from pg_mcp.observability.metrics import MetricsCollector

    # 创建连接池
    pools = await create_pools(_settings.databases)
    logger.info(f"Created connection pools for {len(pools)} database(s)")

    # 初始化 Schema 缓存
    schema_cache = SchemaCache()
    for db_name, pool in pools.items():
        db_config = next(db for db in _settings.databases if db.name == db_name)
        await schema_cache.load(db_name, pool, db_config)
    logger.info("Schema cache loaded")

    # 初始化服务
    metrics = MetricsCollector()

    sql_generator = SQLGenerator(_settings.openai, metrics)
    sql_validator = SQLValidator(_settings.security)
    result_validator = ResultValidator(_settings.openai, _settings.validation)

    executors = {
        db_name: SQLExecutor(pool, _settings.security, db_config, metrics)
        for db_name, pool in pools.items()
        for db_config in _settings.databases if db_config.name == db_name
    }

    llm_circuit_breaker = CircuitBreaker(
        failure_threshold=_settings.resilience.circuit_breaker_failure_threshold,
        recovery_timeout=_settings.resilience.circuit_breaker_recovery_timeout,
    )

    _orchestrator = QueryOrchestrator(
        settings=_settings,
        schema_cache=schema_cache,
        sql_generator=sql_generator,
        sql_validator=sql_validator,
        executors=executors,
        result_validator=result_validator,
        llm_circuit_breaker=llm_circuit_breaker,
        metrics=metrics,
    )

    logger.info("pg-mcp server started successfully")

    yield  # 服务器运行

    # 清理
    logger.info("Shutting down pg-mcp server...")
    for pool in pools.values():
        await pool.close()
    logger.info("Connection pools closed")
```

---

## 5. 数据流设计

### 5.1 查询执行流程

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              Query Flow                                       │
└──────────────────────────────────────────────────────────────────────────────┘

User Request                                                           Response
    │                                                                      ▲
    ▼                                                                      │
┌─────────────────┐                                              ┌─────────────────┐
│  1. Validate    │                                              │  8. Format      │
│    Request      │                                              │    Response     │
│  (Pydantic)     │                                              │                 │
└────────┬────────┘                                              └────────┬────────┘
         │                                                                │
         ▼                                                                │
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐      │
│  2. Resolve     │────▶│  3. Get Schema  │────▶│  4. Generate    │      │
│    Database     │     │  (from cache)   │     │    SQL (LLM)    │      │
└─────────────────┘     └─────────────────┘     └────────┬────────┘      │
                                                         │               │
                                                         ▼               │
                                                ┌─────────────────┐      │
                                                │  5. Validate    │      │
                                                │  SQL (SQLGlot)  │      │
                                                └────────┬────────┘      │
                                                         │               │
                              ┌───────────────────┬──────┴───────┐       │
                              ▼                   ▼              │       │
                      [return_type=sql]   [return_type=result]   │       │
                              │                   │              │       │
                              │                   ▼              │       │
                              │           ┌─────────────────┐    │       │
                              │           │  6. Execute     │    │       │
                              │           │  SQL (asyncpg)  │    │       │
                              │           └────────┬────────┘    │       │
                              │                    │             │       │
                              │                    ▼             │       │
                              │           ┌─────────────────┐    │       │
                              │           │  7. Validate    │    │       │
                              │           │ Result (LLM)    │    │       │
                              │           └────────┬────────┘    │       │
                              │                    │             │       │
                              └────────────────────┴─────────────┴───────┘

Retry Loop (on validation failure):
    Step 4 ──[validation fails]──▶ Step 4 (with error feedback)
                                   (max 2 retries)
```

### 5.2 Schema 缓存流程

```
                        ┌─────────────────────────────────────┐
                        │         Server Startup              │
                        └──────────────┬──────────────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────────────┐
                        │   For each configured database:     │
                        │   1. Create connection pool         │
                        │   2. Query information_schema       │
                        │   3. Build DatabaseSchema model     │
                        │   4. Store in SchemaCache           │
                        └──────────────┬──────────────────────┘
                                       │
                                       ▼
              ┌────────────────────────┴────────────────────────┐
              │                                                  │
              ▼                                                  ▼
┌─────────────────────────┐                      ┌─────────────────────────┐
│   Runtime Query:        │                      │   Background Refresh:   │
│   schema_cache.get(db)  │                      │   (if auto_refresh=true)│
│         │               │                      │         │               │
│         ▼               │                      │         ▼               │
│   Return cached schema  │                      │   Every N minutes:      │
│                         │                      │   - Re-query metadata   │
└─────────────────────────┘                      │   - Update cache        │
                                                 │   - Update cached_at    │
                                                 └─────────────────────────┘
```

---

## 6. Schema 缓存实现

```python
# src/pg_mcp/cache/schema_cache.py

import asyncio
from datetime import datetime
from typing import Dict
import asyncpg

from pg_mcp.models.schema import (
    DatabaseSchema, TableInfo, ColumnInfo,
    ForeignKeyInfo, IndexInfo, EnumTypeInfo
)
from pg_mcp.config.settings import DatabaseConfig
from pg_mcp.observability.logging import get_logger

logger = get_logger(__name__)


class SchemaCache:
    """Schema 缓存管理器"""

    def __init__(self):
        self._cache: Dict[str, DatabaseSchema] = {}
        self._lock = asyncio.Lock()

    def get(self, database_name: str) -> DatabaseSchema | None:
        """获取缓存的 Schema"""
        return self._cache.get(database_name)

    async def load(
        self,
        database_name: str,
        pool: asyncpg.Pool,
        config: DatabaseConfig,
    ) -> DatabaseSchema:
        """加载数据库 Schema"""
        async with self._lock:
            logger.info(f"Loading schema for database: {database_name}")

            async with pool.acquire() as conn:
                # 获取表信息
                tables = await self._load_tables(conn)

                # 获取视图信息
                views = await self._load_views(conn)

                # 获取枚举类型
                enum_types = await self._load_enum_types(conn)

            schema = DatabaseSchema(
                database_name=database_name,
                tables=tables,
                views=views,
                enum_types=enum_types,
                cached_at=datetime.utcnow(),
            )

            self._cache[database_name] = schema
            logger.info(
                f"Schema loaded: {len(tables)} tables, "
                f"{len(views)} views, {len(enum_types)} enum types"
            )

            return schema

    async def refresh(self, database_name: str, pool: asyncpg.Pool, config: DatabaseConfig) -> None:
        """刷新 Schema 缓存"""
        await self.load(database_name, pool, config)

    async def _load_tables(self, conn: asyncpg.Connection) -> list[TableInfo]:
        """加载所有表信息"""
        # 查询表列表
        tables_query = """
            SELECT
                t.table_schema,
                t.table_name,
                t.table_type,
                obj_description((t.table_schema || '.' || t.table_name)::regclass) as comment,
                c.reltuples::bigint as row_estimate
            FROM information_schema.tables t
            LEFT JOIN pg_class c ON c.relname = t.table_name
            LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.table_schema
            WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema')
                AND t.table_type = 'BASE TABLE'
            ORDER BY t.table_schema, t.table_name
        """
        table_rows = await conn.fetch(tables_query)

        tables = []
        for row in table_rows:
            schema_name = row['table_schema']
            table_name = row['table_name']

            # 获取列信息
            columns = await self._load_columns(conn, schema_name, table_name)

            # 获取主键
            primary_key = await self._load_primary_key(conn, schema_name, table_name)

            # 标记主键列
            for col in columns:
                if col.name in primary_key:
                    col.is_primary_key = True

            # 获取外键
            foreign_keys = await self._load_foreign_keys(conn, schema_name, table_name)

            # 获取索引
            indexes = await self._load_indexes(conn, schema_name, table_name)

            tables.append(TableInfo(
                schema_name=schema_name,
                table_name=table_name,
                table_type=row['table_type'],
                columns=columns,
                primary_key=primary_key,
                foreign_keys=foreign_keys,
                indexes=indexes,
                comment=row['comment'],
                row_count_estimate=row['row_estimate'],
            ))

        return tables

    async def _load_columns(
        self,
        conn: asyncpg.Connection,
        schema_name: str,
        table_name: str,
    ) -> list[ColumnInfo]:
        """加载表的列信息"""
        query = """
            SELECT
                c.column_name,
                c.data_type,
                c.is_nullable = 'YES' as is_nullable,
                c.column_default,
                col_description((c.table_schema || '.' || c.table_name)::regclass, c.ordinal_position) as comment
            FROM information_schema.columns c
            WHERE c.table_schema = $1 AND c.table_name = $2
            ORDER BY c.ordinal_position
        """
        rows = await conn.fetch(query, schema_name, table_name)

        return [
            ColumnInfo(
                name=row['column_name'],
                data_type=row['data_type'],
                is_nullable=row['is_nullable'],
                default_value=row['column_default'],
                comment=row['comment'],
            )
            for row in rows
        ]

    async def _load_primary_key(
        self,
        conn: asyncpg.Connection,
        schema_name: str,
        table_name: str,
    ) -> list[str]:
        """加载主键列"""
        query = """
            SELECT a.attname
            FROM pg_index i
            JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
            JOIN pg_class c ON c.oid = i.indrelid
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE i.indisprimary
                AND n.nspname = $1
                AND c.relname = $2
        """
        rows = await conn.fetch(query, schema_name, table_name)
        return [row['attname'] for row in rows]

    async def _load_foreign_keys(
        self,
        conn: asyncpg.Connection,
        schema_name: str,
        table_name: str,
    ) -> list[ForeignKeyInfo]:
        """加载外键信息"""
        query = """
            SELECT
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name,
                tc.constraint_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = $1
                AND tc.table_name = $2
        """
        rows = await conn.fetch(query, schema_name, table_name)

        return [
            ForeignKeyInfo(
                column=row['column_name'],
                references_table=row['foreign_table_name'],
                references_column=row['foreign_column_name'],
                constraint_name=row['constraint_name'],
            )
            for row in rows
        ]

    async def _load_indexes(
        self,
        conn: asyncpg.Connection,
        schema_name: str,
        table_name: str,
    ) -> list[IndexInfo]:
        """加载索引信息"""
        query = """
            SELECT
                i.relname as index_name,
                array_agg(a.attname ORDER BY array_position(ix.indkey, a.attnum)) as columns,
                ix.indisunique as is_unique,
                ix.indisprimary as is_primary,
                am.amname as index_type
            FROM pg_class t
            JOIN pg_namespace n ON n.oid = t.relnamespace
            JOIN pg_index ix ON ix.indrelid = t.oid
            JOIN pg_class i ON i.oid = ix.indexrelid
            JOIN pg_am am ON am.oid = i.relam
            JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
            WHERE n.nspname = $1 AND t.relname = $2
            GROUP BY i.relname, ix.indisunique, ix.indisprimary, am.amname
        """
        rows = await conn.fetch(query, schema_name, table_name)

        return [
            IndexInfo(
                name=row['index_name'],
                columns=row['columns'],
                is_unique=row['is_unique'],
                is_primary=row['is_primary'],
                index_type=row['index_type'],
            )
            for row in rows
        ]

    async def _load_views(self, conn: asyncpg.Connection) -> list[TableInfo]:
        """加载视图信息（简化版，类似表）"""
        query = """
            SELECT
                table_schema,
                table_name,
                obj_description((table_schema || '.' || table_name)::regclass) as comment
            FROM information_schema.views
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        """
        rows = await conn.fetch(query)

        views = []
        for row in rows:
            columns = await self._load_columns(conn, row['table_schema'], row['table_name'])
            views.append(TableInfo(
                schema_name=row['table_schema'],
                table_name=row['table_name'],
                table_type='VIEW',
                columns=columns,
                comment=row['comment'],
            ))

        return views

    async def _load_enum_types(self, conn: asyncpg.Connection) -> list[EnumTypeInfo]:
        """加载枚举类型"""
        query = """
            SELECT
                n.nspname as schema_name,
                t.typname as type_name,
                array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            JOIN pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
            GROUP BY n.nspname, t.typname
        """
        rows = await conn.fetch(query)

        return [
            EnumTypeInfo(
                schema_name=row['schema_name'],
                type_name=row['type_name'],
                values=row['values'],
            )
            for row in rows
        ]
```

---

## 7. 弹性组件

### 7.1 熔断器

```python
# src/pg_mcp/resilience/circuit_breaker.py

import asyncio
import time
from enum import Enum
from dataclasses import dataclass


class CircuitState(Enum):
    CLOSED = "closed"      # 正常状态
    OPEN = "open"          # 熔断状态
    HALF_OPEN = "half_open"  # 半开状态（尝试恢复）


@dataclass
class CircuitBreaker:
    """熔断器实现"""
    failure_threshold: int = 5
    recovery_timeout: int = 30

    def __post_init__(self):
        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._last_failure_time: float | None = None
        self._lock = asyncio.Lock()

    @property
    def state(self) -> CircuitState:
        return self._state

    def allow_request(self) -> bool:
        """检查是否允许请求"""
        if self._state == CircuitState.CLOSED:
            return True

        if self._state == CircuitState.OPEN:
            # 检查是否应该进入半开状态
            if self._last_failure_time and \
               time.time() - self._last_failure_time >= self.recovery_timeout:
                self._state = CircuitState.HALF_OPEN
                return True
            return False

        # HALF_OPEN 状态允许一个请求
        return True

    def record_success(self) -> None:
        """记录成功请求"""
        if self._state == CircuitState.HALF_OPEN:
            self._state = CircuitState.CLOSED
        self._failure_count = 0

    def record_failure(self) -> None:
        """记录失败请求"""
        self._failure_count += 1
        self._last_failure_time = time.time()

        if self._state == CircuitState.HALF_OPEN:
            self._state = CircuitState.OPEN
        elif self._failure_count >= self.failure_threshold:
            self._state = CircuitState.OPEN
```

### 7.2 限流器

```python
# src/pg_mcp/resilience/rate_limiter.py

import asyncio
from collections import deque


class SemaphoreRateLimiter:
    """基于信号量的并发限流器"""

    def __init__(self, max_concurrent: int):
        self._semaphore = asyncio.Semaphore(max_concurrent)
        self._max = max_concurrent

    @property
    def available(self) -> int:
        return self._semaphore._value

    async def acquire(self) -> bool:
        """获取许可"""
        try:
            await asyncio.wait_for(
                self._semaphore.acquire(),
                timeout=0.1  # 快速失败
            )
            return True
        except asyncio.TimeoutError:
            return False

    def release(self) -> None:
        """释放许可"""
        self._semaphore.release()

    async def __aenter__(self):
        await self._semaphore.acquire()
        return self

    async def __aexit__(self, *args):
        self._semaphore.release()
```

---

## 8. 可观测性

### 8.1 指标收集

```python
# src/pg_mcp/observability/metrics.py

from prometheus_client import Counter, Histogram, Gauge


class MetricsCollector:
    """Prometheus 指标收集器"""

    def __init__(self, prefix: str = "pg_mcp"):
        # 请求指标
        self.query_requests_total = Counter(
            f"{prefix}_query_requests_total",
            "Total query requests",
            ["status", "database"],
        )

        self.query_duration_seconds = Histogram(
            f"{prefix}_query_duration_seconds",
            "Query duration in seconds",
            buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0],
        )

        # LLM 指标
        self.llm_calls_total = Counter(
            f"{prefix}_llm_calls_total",
            "Total LLM API calls",
            ["operation"],  # generate, validate
        )

        self.llm_latency_seconds = Histogram(
            f"{prefix}_llm_latency_seconds",
            "LLM call latency in seconds",
            ["operation"],
        )

        self.llm_tokens_used = Counter(
            f"{prefix}_llm_tokens_used",
            "Total LLM tokens used",
            ["operation"],
        )

        # 安全指标
        self.sql_rejected_total = Counter(
            f"{prefix}_sql_rejected_total",
            "Total rejected SQL statements",
            ["reason"],
        )

        # 数据库指标
        self.db_connections_active = Gauge(
            f"{prefix}_db_connections_active",
            "Active database connections",
            ["database"],
        )

        self.db_query_duration_seconds = Histogram(
            f"{prefix}_db_query_duration_seconds",
            "Database query duration in seconds",
        )

        # 缓存指标
        self.schema_cache_age_seconds = Gauge(
            f"{prefix}_schema_cache_age_seconds",
            "Schema cache age in seconds",
            ["database"],
        )
```

### 8.2 结构化日志

```python
# src/pg_mcp/observability/logging.py

import logging
import sys
import json
from datetime import datetime
from typing import Any


class StructuredFormatter(logging.Formatter):
    """JSON 结构化日志格式器"""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # 添加额外字段
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data, ensure_ascii=False)


class LoggerAdapter(logging.LoggerAdapter):
    """支持额外上下文的日志适配器"""

    def process(self, msg: str, kwargs: dict) -> tuple[str, dict]:
        extra = kwargs.get("extra", {})
        extra.update(self.extra)
        kwargs["extra"] = extra
        return msg, kwargs


def get_logger(name: str, **context: Any) -> LoggerAdapter:
    """获取结构化日志记录器"""
    logger = logging.getLogger(name)
    return LoggerAdapter(logger, context)


def configure_logging(level: str = "INFO", format: str = "json") -> None:
    """配置日志系统"""
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper()))

    handler = logging.StreamHandler(sys.stderr)

    if format == "json":
        handler.setFormatter(StructuredFormatter())
    else:
        handler.setFormatter(logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        ))

    root_logger.addHandler(handler)
```

---

## 9. 安全设计

### 9.1 多层防御架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Security Layers                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Layer 1: Input Validation (Pydantic)                                       │
│  ├─ Request parameter validation                                            │
│  ├─ String length limits                                                    │
│  └─ Type checking                                                           │
│                                                                              │
│  Layer 2: LLM Prompt Engineering                                            │
│  ├─ System prompt hardening                                                 │
│  ├─ User input isolation                                                    │
│  └─ Output format constraints                                               │
│                                                                              │
│  Layer 3: SQL Validation (SQLGlot)                                          │
│  ├─ Statement type whitelist (SELECT only)                                  │
│  ├─ Dangerous function blacklist                                            │
│  ├─ Sensitive table/column blocking                                         │
│  └─ Subquery safety check                                                   │
│                                                                              │
│  Layer 4: Database Execution (asyncpg)                                      │
│  ├─ Read-only transaction                                                   │
│  ├─ Statement timeout                                                       │
│  ├─ Row limit                                                               │
│  ├─ Forced search_path                                                      │
│  └─ Role switching (readonly_role)                                          │
│                                                                              │
│  Layer 5: Result Sanitization                                               │
│  ├─ Type serialization                                                      │
│  └─ PII detection (optional)                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 SQL 验证规则表

| 规则类型     | 验证内容                    | 处理方式       |
|--------------|----------------------------|----------------|
| 语句类型     | 只允许 SELECT/WITH...SELECT | 拒绝并报错     |
| 危险函数     | pg_sleep, lo_import 等     | 拒绝并报错     |
| 敏感表       | 配置的 blocked_tables      | 拒绝并报错     |
| 敏感列       | 配置的 blocked_columns     | 拒绝并报错     |
| 多语句       | 多个 SQL 语句              | 拒绝并报错     |
| 子查询写操作 | 子查询中的 DML             | 拒绝并报错     |

---

## 10. 部署配置

### 10.1 环境变量

```bash
# .env.example

# 服务配置
PG_MCP_SERVICE_NAME=pg-mcp
PG_MCP_LOG_LEVEL=INFO
PG_MCP_LOG_FORMAT=json

# 数据库配置（支持多个，用逗号分隔）
PG_MCP_DATABASES__0__NAME=production
PG_MCP_DATABASES__0__HOST=localhost
PG_MCP_DATABASES__0__PORT=5432
PG_MCP_DATABASES__0__USER=readonly_user
PG_MCP_DATABASES__0__PASSWORD=secret
PG_MCP_DATABASES__0__DATABASE=mydb
PG_MCP_DATABASES__0__SSL_MODE=require

# OpenAI 配置
PG_MCP_OPENAI__API_KEY=sk-xxx
PG_MCP_OPENAI__MODEL=gpt-5.2-mini
PG_MCP_OPENAI__MAX_TOKENS=4096
PG_MCP_OPENAI__TEMPERATURE=0

# 安全配置
PG_MCP_SECURITY__QUERY_TIMEOUT_SECONDS=30
PG_MCP_SECURITY__MAX_RESULT_ROWS=10000
PG_MCP_SECURITY__BLOCKED_TABLES=["users.password_hash","payment.card_numbers"]
PG_MCP_SECURITY__READONLY_ROLE=readonly

# 验证配置
PG_MCP_VALIDATION__ENABLED=true
PG_MCP_VALIDATION__CONFIDENCE_THRESHOLD=70
PG_MCP_VALIDATION__MAX_RETRIES=2

# 弹性配置
PG_MCP_RESILIENCE__MAX_CONCURRENT_QUERIES=10
PG_MCP_RESILIENCE__MAX_CONCURRENT_LLM_CALLS=5
```

### 10.2 pyproject.toml

```toml
[project]
name = "pg-mcp"
version = "0.1.0"
description = "PostgreSQL MCP Server - Natural Language to SQL"
requires-python = ">=3.11"
dependencies = [
    "mcp[cli]>=2.0.0",
    "asyncpg>=0.29.0",
    "sqlglot>=26.0.0",
    "pydantic>=2.0.0",
    "pydantic-settings>=2.0.0",
    "openai>=1.50.0",
    "prometheus-client>=0.20.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.24.0",
    "pytest-cov>=5.0.0",
    "ruff>=0.5.0",
    "mypy>=1.10.0",
]

[project.scripts]
pg-mcp = "pg_mcp.__main__:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.mypy]
python_version = "3.11"
strict = true

[tool.pytest.ini_options]
asyncio_mode = "auto"
```

---

## 11. 测试策略

### 11.1 测试金字塔

```
                    ┌───────────────┐
                    │    E2E Tests  │  (少量)
                    │  - MCP 协议   │
                    │  - 完整流程   │
                    └───────┬───────┘
                            │
               ┌────────────┴────────────┐
               │    Integration Tests    │  (中等)
               │  - Schema 缓存加载      │
               │  - SQL 执行（真实 DB）   │
               │  - LLM 调用（mock）      │
               └────────────┬────────────┘
                            │
       ┌────────────────────┴────────────────────┐
       │              Unit Tests                  │  (大量)
       │  - SQLValidator                          │
       │  - SQL 解析和提取                        │
       │  - Pydantic 模型验证                     │
       │  - 熔断器逻辑                            │
       └──────────────────────────────────────────┘
```

### 11.2 关键测试用例

```python
# tests/unit/test_sql_validator.py

import pytest
from pg_mcp.services.sql_validator import SQLValidator
from pg_mcp.config.settings import SecurityConfig


@pytest.fixture
def validator():
    config = SecurityConfig(
        blocked_tables=["secret_data"],
        blocked_functions=["pg_sleep"],
    )
    return SQLValidator(config)


class TestSQLValidator:
    """SQL 验证器单元测试"""

    def test_valid_select(self, validator):
        sql = "SELECT id, name FROM users WHERE active = true"
        is_valid, error = validator.validate(sql)
        assert is_valid
        assert error is None

    def test_valid_cte(self, validator):
        sql = """
        WITH active_users AS (
            SELECT id, name FROM users WHERE active = true
        )
        SELECT * FROM active_users
        """
        is_valid, error = validator.validate(sql)
        assert is_valid

    def test_reject_insert(self, validator):
        sql = "INSERT INTO users (name) VALUES ('test')"
        is_valid, error = validator.validate(sql)
        assert not is_valid
        assert "INSERT" in error or "不允许" in error

    def test_reject_delete(self, validator):
        sql = "DELETE FROM users WHERE id = 1"
        is_valid, error = validator.validate(sql)
        assert not is_valid

    def test_reject_drop(self, validator):
        sql = "DROP TABLE users"
        is_valid, error = validator.validate(sql)
        assert not is_valid

    def test_reject_blocked_table(self, validator):
        sql = "SELECT * FROM secret_data"
        is_valid, error = validator.validate(sql)
        assert not is_valid
        assert "secret_data" in error

    def test_reject_blocked_function(self, validator):
        sql = "SELECT pg_sleep(10)"
        is_valid, error = validator.validate(sql)
        assert not is_valid
        assert "pg_sleep" in error

    def test_reject_multiple_statements(self, validator):
        sql = "SELECT 1; DROP TABLE users;"
        is_valid, error = validator.validate(sql)
        assert not is_valid
        assert "多条" in error

    def test_complex_query(self, validator):
        sql = """
        SELECT
            u.id,
            u.name,
            COUNT(o.id) as order_count,
            SUM(o.amount) as total_amount
        FROM users u
        LEFT JOIN orders o ON o.user_id = u.id
        WHERE u.created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY u.id, u.name
        HAVING COUNT(o.id) > 0
        ORDER BY total_amount DESC
        LIMIT 100
        """
        is_valid, error = validator.validate(sql)
        assert is_valid
```

---

## 12. 开放设计决策

以下是在实现阶段需要确定的设计决策：

| 决策点               | 选项                                | 建议                     |
|----------------------|-------------------------------------|--------------------------|
| 多数据库查询         | 1. 不支持 2. 支持单库 3. 支持跨库  | 初版只支持单库查询       |
| 查询历史存储         | 1. 不存储 2. 内存 3. 持久化        | 初版不存储               |
| LLM 降级方案         | 1. 无 2. 缓存模板 3. 备用模型      | 初版无降级，返回错误     |
| 结果格式             | 1. JSON 2. 支持 CSV 导出           | 初版只支持 JSON          |
| Schema 变更检测      | 1. 手动刷新 2. 定时刷新 3. 事件通知 | 定时刷新 + 手动刷新     |

---

## 修订历史

| 版本 | 日期       | 作者 | 修改内容 |
|------|------------|------|----------|
| v1.0 | 2025-12-20 | -    | 初始版本 |
