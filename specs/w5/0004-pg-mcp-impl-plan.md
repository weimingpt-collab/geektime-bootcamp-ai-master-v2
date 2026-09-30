# PostgreSQL MCP Server - 实现计划

## 文档信息

| 项目       | 内容                        |
|------------|----------------------------|
| 文档版本   | v1.0                       |
| 创建日期   | 2025-12-20                 |
| 状态       | 草稿                       |
| 关联设计   | 0002-pg-mcp-design.md      |
| 项目代号   | pg-mcp                     |

---

## 1. 实现概述

### 1.1 目标

基于技术设计文档，分阶段实现 PostgreSQL MCP Server，确保每个阶段产出可测试、可验证的增量功能。

### 1.2 实现原则

1. **增量交付**：每个阶段产出可独立运行和测试的代码
2. **测试先行**：关键组件必须有单元测试覆盖
3. **安全优先**：SQL 验证器是第一优先级
4. **最小可行产品**：Phase 1-3 完成后即可演示核心功能
5. **持续重构**：在添加新功能时持续优化代码质量

### 1.3 技术依赖

```
Python >= 3.11
├── mcp[cli] >= 2.0.0        # FastMCP 框架
├── asyncpg >= 0.29.0        # PostgreSQL 异步驱动
├── sqlglot >= 26.0.0        # SQL 解析验证
├── pydantic >= 2.0.0        # 数据验证
├── pydantic-settings >= 2.0.0  # 配置管理
├── openai >= 1.50.0         # LLM 集成
└── prometheus-client >= 0.20.0  # 指标收集
```

---

## 2. 阶段划分

### 2.1 阶段总览

```
Phase 0: 项目初始化 (基础设施)
    │
    ▼
Phase 1: 核心模型与配置 (数据基础)
    │
    ▼
Phase 2: SQL 安全验证器 (安全核心)
    │
    ▼
Phase 3: 数据库连接与 Schema 缓存 (数据层)
    │
    ▼
Phase 4: LLM 集成 - SQL 生成器 (智能核心)
    │
    ▼
Phase 5: 查询执行器 (执行层)
    │
    ▼
Phase 6: 查询协调器 (业务编排)
    │
    ▼
Phase 7: FastMCP 服务器集成 (对外接口)
    │
    ▼
Phase 8: 结果验证器与弹性组件 (增强功能)
    │
    ▼
Phase 9: 可观测性与生产就绪 (生产化)
    │
    ▼
Phase 10: 集成测试与文档 (质量保证)
```

---

## 3. 详细实现计划

### Phase 0: 项目初始化

**目标**：建立项目基础结构和开发环境

#### 任务列表

| ID    | 任务                      | 产出物                     | 验收标准                           |
|-------|---------------------------|----------------------------|-----------------------------------|
| P0.1  | 创建项目目录结构          | `pg-mcp/` 目录树           | 符合设计文档第 3 节结构            |
| P0.2  | 编写 pyproject.toml       | `pyproject.toml`           | 可通过 `pip install -e .` 安装     |
| P0.3  | 配置开发工具              | `ruff.toml`, `.mypy.ini`   | lint 和类型检查可运行              |
| P0.4  | 创建基础 __init__.py      | 各模块 `__init__.py`       | 模块可正确导入                     |
| P0.5  | 编写 .env.example         | `.env.example`             | 包含所有配置项说明                 |
| P0.6  | 配置 pytest               | `conftest.py`              | `pytest` 命令可运行                |

#### 目录结构

```
pg-mcp/
├── pyproject.toml
├── README.md
├── .env.example
├── .gitignore
├── src/
│   └── pg_mcp/
│       ├── __init__.py
│       ├── __main__.py
│       ├── config/
│       │   └── __init__.py
│       ├── models/
│       │   └── __init__.py
│       ├── services/
│       │   └── __init__.py
│       ├── cache/
│       │   └── __init__.py
│       ├── db/
│       │   └── __init__.py
│       ├── resilience/
│       │   └── __init__.py
│       ├── observability/
│       │   └── __init__.py
│       └── prompts/
│           └── __init__.py
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── unit/
    │   └── __init__.py
    ├── integration/
    │   └── __init__.py
    └── e2e/
        └── __init__.py
```

#### 关键文件

**pyproject.toml**
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
testpaths = ["tests"]
```

---

### Phase 1: 核心模型与配置

**目标**：实现 Pydantic 配置和数据模型

#### 任务列表

| ID    | 任务                      | 产出物                        | 验收标准                           |
|-------|---------------------------|-------------------------------|-----------------------------------|
| P1.1  | 实现配置管理类            | `config/settings.py`          | 可从环境变量加载配置               |
| P1.2  | 实现 Schema 数据模型      | `models/schema.py`            | 模型验证通过                       |
| P1.3  | 实现查询数据模型          | `models/query.py`             | 请求/响应模型完整                  |
| P1.4  | 实现错误模型和异常类      | `models/errors.py`            | 错误码体系完整                     |
| P1.5  | 编写模型单元测试          | `tests/unit/test_models.py`   | 测试覆盖率 > 90%                   |
| P1.6  | 编写配置单元测试          | `tests/unit/test_config.py`   | 环境变量加载测试通过               |

#### 配置层次结构

```
Settings
├── service_name: str
├── log_level: str
├── log_format: str
├── databases: list[DatabaseConfig]
│   ├── name: str
│   ├── host: str
│   ├── port: int
│   ├── user: str
│   ├── password: SecretStr
│   ├── database: str
│   ├── ssl_mode: str
│   ├── min_connections: int
│   └── max_connections: int
├── openai: OpenAIConfig
│   ├── api_key: SecretStr
│   ├── model: str
│   ├── max_tokens: int
│   ├── temperature: float
│   └── timeout: float
├── security: SecurityConfig
│   ├── query_timeout_seconds: int
│   ├── max_result_rows: int
│   ├── blocked_tables: list[str]
│   ├── blocked_columns: list[str]
│   ├── blocked_functions: list[str]
│   ├── allow_explain: bool
│   ├── readonly_role: str | None
│   └── safe_search_path: str
├── validation: ValidationConfig
│   ├── enabled: bool
│   ├── confidence_threshold: int
│   ├── max_retries: int
│   ├── timeout_seconds: float
│   └── sample_rows: int
├── cache: CacheConfig
│   ├── auto_refresh: bool
│   ├── refresh_interval_minutes: int
│   └── startup_timeout_seconds: float
└── resilience: ResilienceConfig
    ├── circuit_breaker_failure_threshold: int
    ├── circuit_breaker_recovery_timeout: int
    ├── max_concurrent_queries: int
    ├── max_concurrent_llm_calls: int
    ├── request_queue_size: int
    ├── db_retry_attempts: int
    └── db_retry_delay: float
```

#### 关键测试用例

```python
# tests/unit/test_config.py

def test_settings_from_env():
    """验证从环境变量加载配置"""

def test_database_config_validation():
    """验证数据库配置验证规则"""

def test_security_config_defaults():
    """验证安全配置默认值"""

def test_settings_unique_database_names():
    """验证数据库名称唯一性约束"""
```

---

### Phase 2: SQL 安全验证器

**目标**：实现基于 SQLGlot 的 SQL 安全验证，这是整个系统的安全核心

#### 任务列表

| ID    | 任务                      | 产出物                            | 验收标准                           |
|-------|---------------------------|-----------------------------------|-----------------------------------|
| P2.1  | 实现 SQLValidator 核心类  | `services/sql_validator.py`       | 基础验证逻辑完成                   |
| P2.2  | 实现语句类型检查          | 同上                              | SELECT/CTE 白名单验证              |
| P2.3  | 实现危险函数黑名单检查    | 同上                              | 内置 + 配置危险函数检测            |
| P2.4  | 实现敏感表/列访问检查     | 同上                              | 配置化敏感资源保护                 |
| P2.5  | 实现子查询安全检查        | 同上                              | 检测子查询中的写操作               |
| P2.6  | 实现 SQL 规范化功能       | 同上                              | SQL 格式化输出                     |
| P2.7  | 实现表名提取功能          | 同上                              | 提取 SQL 引用的表                  |
| P2.8  | 编写全面的安全测试        | `tests/unit/test_sql_validator.py`| 覆盖所有安全场景                   |

#### 验证规则矩阵

| 检查类型     | 通过条件                              | 拒绝条件                          |
|--------------|--------------------------------------|----------------------------------|
| 语句类型     | SELECT, WITH...SELECT                | INSERT, UPDATE, DELETE, DROP等   |
| 语句数量     | 单条语句                             | 多条语句（含分号分隔）            |
| 危险函数     | 非黑名单函数                         | pg_sleep, lo_import 等           |
| 敏感表       | 非 blocked_tables                    | blocked_tables 中的表            |
| 敏感列       | 非 blocked_columns                   | blocked_columns 中的列           |
| 子查询       | 子查询中只有 SELECT                  | 子查询中有 DML                   |
| EXPLAIN      | allow_explain=true                   | allow_explain=false              |

#### 安全测试用例清单

```python
# tests/unit/test_sql_validator.py

class TestValidStatements:
    def test_simple_select(self): ...
    def test_select_with_where(self): ...
    def test_select_with_join(self): ...
    def test_select_with_subquery(self): ...
    def test_cte_query(self): ...
    def test_complex_aggregation(self): ...
    def test_window_functions(self): ...

class TestRejectedStatements:
    def test_insert_rejected(self): ...
    def test_update_rejected(self): ...
    def test_delete_rejected(self): ...
    def test_drop_rejected(self): ...
    def test_create_rejected(self): ...
    def test_alter_rejected(self): ...
    def test_truncate_rejected(self): ...
    def test_grant_rejected(self): ...

class TestDangerousFunctions:
    def test_pg_sleep_blocked(self): ...
    def test_pg_read_file_blocked(self): ...
    def test_lo_import_blocked(self): ...
    def test_dblink_blocked(self): ...
    def test_custom_blocked_function(self): ...

class TestSensitiveResources:
    def test_blocked_table_rejected(self): ...
    def test_blocked_column_rejected(self): ...
    def test_partial_column_match(self): ...

class TestMultiStatement:
    def test_multiple_statements_rejected(self): ...
    def test_sql_injection_attempt(self): ...

class TestEdgeCases:
    def test_malformed_sql(self): ...
    def test_empty_sql(self): ...
    def test_comment_only_sql(self): ...
```

---

### Phase 3: 数据库连接与 Schema 缓存

**目标**：实现数据库连接池管理和 Schema 元数据缓存

#### 任务列表

| ID    | 任务                      | 产出物                         | 验收标准                           |
|-------|---------------------------|--------------------------------|-----------------------------------|
| P3.1  | 实现连接池管理            | `db/pool.py`                   | 可创建和管理多数据库连接池         |
| P3.2  | 实现 Schema 内省查询      | `db/introspection.py`          | 提取表/列/索引/外键信息            |
| P3.3  | 实现 SchemaCache 类       | `cache/schema_cache.py`        | 缓存管理和自动刷新                 |
| P3.4  | 实现 Schema 上下文生成    | `models/schema.py` 扩展        | 生成 LLM prompt 上下文             |
| P3.5  | 编写集成测试              | `tests/integration/test_db.py` | 真实数据库连接测试                 |

#### 连接池管理接口

```python
# db/pool.py

async def create_pools(
    configs: list[DatabaseConfig]
) -> dict[str, asyncpg.Pool]:
    """创建所有数据库的连接池"""

async def close_pools(pools: dict[str, asyncpg.Pool]) -> None:
    """关闭所有连接池"""
```

#### Schema 缓存接口

```python
# cache/schema_cache.py

class SchemaCache:
    def get(self, database_name: str) -> DatabaseSchema | None:
        """获取缓存的 Schema"""

    async def load(
        self,
        database_name: str,
        pool: asyncpg.Pool,
        config: DatabaseConfig,
    ) -> DatabaseSchema:
        """加载数据库 Schema"""

    async def refresh(
        self,
        database_name: str,
        pool: asyncpg.Pool,
        config: DatabaseConfig,
    ) -> None:
        """刷新 Schema 缓存"""

    async def start_auto_refresh(
        self,
        interval_minutes: int,
        pools: dict[str, asyncpg.Pool],
        configs: list[DatabaseConfig],
    ) -> None:
        """启动自动刷新任务"""
```

#### Schema 内省查询

需要实现以下 PostgreSQL 元数据查询：

1. **表信息查询** - `information_schema.tables` + `pg_class`
2. **列信息查询** - `information_schema.columns`
3. **主键查询** - `pg_index` + `pg_attribute`
4. **外键查询** - `information_schema.table_constraints` + `key_column_usage`
5. **索引查询** - `pg_index` + `pg_class` + `pg_am`
6. **视图查询** - `information_schema.views`
7. **枚举类型查询** - `pg_type` + `pg_enum`

---

### Phase 4: LLM 集成 - SQL 生成器

**目标**：实现基于 OpenAI 的自然语言转 SQL 功能

#### 任务列表

| ID    | 任务                      | 产出物                            | 验收标准                           |
|-------|---------------------------|-----------------------------------|-----------------------------------|
| P4.1  | 实现 SQL 生成 Prompt      | `prompts/sql_generation.py`       | Prompt 模板完整                    |
| P4.2  | 实现 SQLGenerator 类      | `services/sql_generator.py`       | 可调用 OpenAI 生成 SQL             |
| P4.3  | 实现 SQL 提取逻辑         | 同上                              | 从 LLM 响应提取 SQL                |
| P4.4  | 实现重试机制              | 同上                              | 错误反馈重试                       |
| P4.5  | 编写单元测试 (Mock LLM)   | `tests/unit/test_sql_generator.py`| SQL 提取逻辑测试                   |

#### Prompt 工程

**系统 Prompt 关键点**：
- 明确限制只生成 SELECT/CTE
- 强调 PostgreSQL 语法
- 要求使用表别名
- 建议适当的 LIMIT
- 输出格式约束（markdown code block）

**用户 Prompt 结构**：
```
## Database Schema:
{schema_context}

## Additional Context: (optional)
{context}

## Previous Attempt (Failed): (optional)
{previous_sql}
Error: {error_feedback}

## Question:
{user_question}
```

#### SQL 提取逻辑

```python
def _extract_sql(self, content: str) -> str | None:
    """
    提取顺序：
    1. 尝试匹配 ```sql ... ``` 代码块
    2. 尝试匹配 ``` ... ``` 代码块
    3. 尝试匹配 SELECT/WITH 开头的内容
    4. 检查整个内容是否看起来像 SQL
    """
```

---

### Phase 5: 查询执行器

**目标**：实现安全的 SQL 执行层

#### 任务列表

| ID    | 任务                      | 产出物                         | 验收标准                           |
|-------|---------------------------|--------------------------------|-----------------------------------|
| P5.1  | 实现 SQLExecutor 类       | `services/sql_executor.py`     | 可执行 SQL 并返回结果              |
| P5.2  | 实现会话参数设置          | 同上                           | 超时、search_path、角色切换        |
| P5.3  | 实现结果序列化            | 同上                           | 处理 datetime、Decimal 等类型      |
| P5.4  | 实现行数限制              | 同上                           | 限制返回行数                       |
| P5.5  | 编写集成测试              | `tests/integration/test_executor.py` | 真实执行测试             |

#### 执行安全措施

```python
async def _set_session_params(self, conn: Connection, timeout: float) -> None:
    """
    设置会话参数以确保安全：
    1. SET statement_timeout = '...'
    2. SET search_path = '...'
    3. SET ROLE ... (如果配置了 readonly_role)
    """
```

#### 类型序列化映射

| Python 类型          | 序列化方式           |
|---------------------|---------------------|
| datetime.datetime   | .isoformat()        |
| datetime.date       | .isoformat()        |
| datetime.time       | .isoformat()        |
| datetime.timedelta  | str()               |
| decimal.Decimal     | float()             |
| uuid.UUID           | str()               |
| bytes               | .hex()              |
| list/tuple          | 递归序列化          |
| dict                | 递归序列化          |

---

### Phase 6: 查询协调器

**目标**：实现核心业务逻辑编排

#### 任务列表

| ID    | 任务                      | 产出物                            | 验收标准                           |
|-------|---------------------------|-----------------------------------|-----------------------------------|
| P6.1  | 实现 QueryOrchestrator    | `services/orchestrator.py`        | 完整查询流程编排                   |
| P6.2  | 实现数据库解析逻辑        | 同上                              | 自动选择或验证数据库               |
| P6.3  | 实现带重试的 SQL 生成     | 同上                              | 验证失败自动重试                   |
| P6.4  | 实现错误处理              | 同上                              | 统一错误响应格式                   |
| P6.5  | 编写单元测试              | `tests/unit/test_orchestrator.py` | Mock 依赖测试流程                  |

#### 执行流程

```
execute_query(request: QueryRequest) -> QueryResponse
    │
    ├─1. 生成 request_id
    │
    ├─2. _resolve_database(request.database)
    │   ├─ 如果指定，验证存在性
    │   └─ 如果未指定且只有一个数据库，自动选择
    │
    ├─3. schema_cache.get(db_name)
    │   └─ 未找到则返回 SCHEMA_NOT_FOUND 错误
    │
    ├─4. _generate_sql_with_retry(question, schema, max_retries)
    │   ├─ 检查熔断器
    │   ├─ 调用 sql_generator.generate()
    │   ├─ 调用 sql_validator.validate_or_raise()
    │   ├─ 验证失败：记录错误反馈，重试
    │   └─ 成功：记录熔断器成功
    │
    ├─5. 如果 return_type == SQL，直接返回
    │
    ├─6. executor.execute(sql)
    │
    ├─7. _validate_results_safely(question, sql, results)
    │   └─ 失败不影响主流程
    │
    └─8. 构建 QueryResponse
```

---

### Phase 7: FastMCP 服务器集成

**目标**：将查询功能暴露为 MCP Tool

#### 任务列表

| ID    | 任务                      | 产出物                         | 验收标准                           |
|-------|---------------------------|--------------------------------|-----------------------------------|
| P7.1  | 实现 FastMCP 服务器       | `server.py`                    | 服务器可启动                       |
| P7.2  | 实现 query tool           | 同上                           | Tool 定义正确                      |
| P7.3  | 实现 lifespan 管理        | 同上                           | 组件正确初始化和清理               |
| P7.4  | 实现 __main__.py 入口     | `__main__.py`                  | `python -m pg_mcp` 可运行          |
| P7.5  | 编写 E2E 测试             | `tests/e2e/test_mcp.py`        | MCP 协议测试                       |

#### Tool 定义

```python
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
```

#### Lifespan 管理

```
lifespan()
    │
    ├─ Startup:
    │   ├─ 加载配置 (Settings)
    │   ├─ 创建连接池 (create_pools)
    │   ├─ 加载 Schema 缓存 (SchemaCache.load)
    │   ├─ 初始化服务组件
    │   │   ├─ MetricsCollector
    │   │   ├─ SQLGenerator
    │   │   ├─ SQLValidator
    │   │   ├─ ResultValidator
    │   │   ├─ SQLExecutor (per database)
    │   │   └─ CircuitBreaker
    │   └─ 创建 QueryOrchestrator
    │
    ├─ yield (服务运行中)
    │
    └─ Shutdown:
        └─ 关闭所有连接池
```

---

### Phase 8: 结果验证器与弹性组件

**目标**：实现结果验证和系统弹性

#### 任务列表

| ID    | 任务                      | 产出物                            | 验收标准                           |
|-------|---------------------------|-----------------------------------|-----------------------------------|
| P8.1  | 实现结果验证 Prompt       | `prompts/result_validation.py`    | 验证 prompt 完整                   |
| P8.2  | 实现 ResultValidator      | `services/result_validator.py`    | 可验证结果相关性                   |
| P8.3  | 实现熔断器                | `resilience/circuit_breaker.py`   | 状态机正确                         |
| P8.4  | 实现限流器                | `resilience/rate_limiter.py`      | 并发控制正确                       |
| P8.5  | 编写弹性组件测试          | `tests/unit/test_resilience.py`   | 状态转换测试                       |

#### 熔断器状态机

```
         ┌────────────────────────────────────┐
         │                                    │
         ▼                                    │
    ┌─────────┐     failure_count >=      ┌───────┐
    │ CLOSED  │ ─────threshold──────────▶ │ OPEN  │
    └─────────┘                           └───────┘
         ▲                                    │
         │                                    │
         │ success                   recovery_timeout
         │                                    │
    ┌─────────────┐                           │
    │  HALF_OPEN  │ ◀─────────────────────────┘
    └─────────────┘
         │
         │ failure
         │
         ▼
    ┌─────────┐
    │  OPEN   │
    └─────────┘
```

---

### Phase 9: 可观测性与生产就绪

**目标**：实现指标、日志和生产配置

#### 任务列表

| ID    | 任务                      | 产出物                           | 验收标准                           |
|-------|---------------------------|----------------------------------|-----------------------------------|
| P9.1  | 实现 MetricsCollector     | `observability/metrics.py`       | Prometheus 指标暴露                |
| P9.2  | 实现结构化日志            | `observability/logging.py`       | JSON 格式日志输出                  |
| P9.3  | 配置日志系统              | 同上                             | 可配置日志级别和格式               |
| P9.4  | 添加请求追踪              | `observability/tracing.py`       | request_id 贯穿全链路              |
| P9.5  | 编写健康检查端点          | `server.py` 扩展                 | 健康检查可用                       |

#### 指标清单

| 指标名                           | 类型      | 标签                 | 用途               |
|---------------------------------|-----------|---------------------|-------------------|
| pg_mcp_query_requests_total     | Counter   | status, database    | 请求计数           |
| pg_mcp_query_duration_seconds   | Histogram | -                   | 请求延迟           |
| pg_mcp_llm_calls_total          | Counter   | operation           | LLM 调用计数       |
| pg_mcp_llm_latency_seconds      | Histogram | operation           | LLM 延迟           |
| pg_mcp_llm_tokens_used          | Counter   | operation           | Token 使用量       |
| pg_mcp_sql_rejected_total       | Counter   | reason              | SQL 拒绝计数       |
| pg_mcp_db_connections_active    | Gauge     | database            | 活跃连接数         |
| pg_mcp_db_query_duration_seconds| Histogram | -                   | 数据库查询延迟     |
| pg_mcp_schema_cache_age_seconds | Gauge     | database            | 缓存年龄           |

---

### Phase 10: 集成测试与文档

**目标**：确保系统整体质量和可用性

#### 任务列表

| ID     | 任务                      | 产出物                          | 验收标准                           |
|--------|---------------------------|--------------------------------|-----------------------------------|
| P10.1  | 编写集成测试              | `tests/integration/*.py`       | 覆盖主要流程                       |
| P10.2  | 编写 E2E 测试             | `tests/e2e/*.py`               | MCP 协议完整测试                   |
| P10.3  | 编写 README.md            | `README.md`                    | 使用说明完整                       |
| P10.4  | 编写配置文档              | `.env.example` 完善            | 所有配置项有说明                   |
| P10.5  | 创建 Docker 配置          | `Dockerfile`, `docker-compose.yml` | 可容器化部署                  |
| P10.6  | 编写 Claude Desktop 配置  | 配置示例                        | 可在 Claude Desktop 使用           |

#### 集成测试场景

```python
# tests/integration/test_full_flow.py

class TestFullQueryFlow:
    async def test_simple_query_execution(self):
        """完整查询流程测试"""

    async def test_query_with_validation(self):
        """带结果验证的查询测试"""

    async def test_sql_only_mode(self):
        """仅返回 SQL 模式测试"""

    async def test_multi_database_selection(self):
        """多数据库选择测试"""

    async def test_security_rejection(self):
        """安全拒绝测试"""

    async def test_llm_retry_on_invalid_sql(self):
        """LLM 重试测试"""
```

---

## 4. 依赖关系图

```
Phase 0: 项目初始化
    │
    ▼
Phase 1: 核心模型与配置 ─────────────────────────────────────┐
    │                                                         │
    ├───────────────────────┐                                 │
    ▼                       ▼                                 │
Phase 2: SQL 验证器    Phase 3: 数据库连接                    │
    │                       │                                 │
    │                       │                                 │
    │   ┌───────────────────┘                                 │
    │   │                                                     │
    │   ▼                                                     │
    │ Phase 4: LLM 集成                                       │
    │   │                                                     │
    │   │                                                     │
    │   │   ┌─────────────────────────────────────────────────┘
    │   │   │
    │   ▼   ▼
    └─▶ Phase 5: 查询执行器
            │
            ▼
        Phase 6: 查询协调器
            │
            ▼
        Phase 7: FastMCP 服务器
            │
            ▼
        Phase 8: 弹性组件 ◀───── (可并行)
            │
            ▼
        Phase 9: 可观测性 ◀───── (可并行)
            │
            ▼
        Phase 10: 测试与文档
```

---

## 5. 风险与缓解

### 5.1 技术风险

| 风险                           | 影响 | 可能性 | 缓解措施                          |
|--------------------------------|------|--------|----------------------------------|
| SQLGlot 无法解析复杂 SQL       | 中   | 中     | 提前测试边界情况，准备降级方案    |
| LLM 生成不安全 SQL             | 高   | 中     | 多层验证 + 重试机制               |
| asyncpg 连接池耗尽             | 中   | 低     | 合理配置 + 限流器保护             |
| OpenAI API 不稳定              | 中   | 中     | 熔断器 + 超时配置                 |
| Schema 变更导致缓存过期        | 低   | 中     | 定时刷新 + 手动刷新接口           |

### 5.2 实施风险

| 风险                           | 影响 | 可能性 | 缓解措施                          |
|--------------------------------|------|--------|----------------------------------|
| 集成测试环境准备困难           | 中   | 中     | 使用 Docker Compose 标准化环境    |
| LLM 测试成本高                 | 低   | 高     | 使用 Mock，仅关键路径用真实 API   |
| 配置复杂度高                   | 低   | 中     | 提供合理默认值 + 详细文档         |

---

## 6. 验收标准汇总

### 6.1 功能验收

- [ ] 可通过自然语言查询 PostgreSQL 数据库
- [ ] 支持 SELECT 和 CTE 查询
- [ ] 正确拒绝所有 DML/DDL 语句
- [ ] 正确拒绝危险函数调用
- [ ] 正确拒绝敏感表/列访问
- [ ] 支持多数据库配置
- [ ] 支持 SQL-only 和执行两种模式
- [ ] 查询超时保护正常工作

### 6.2 安全验收

- [ ] 所有 SQL 语句经过 SQLGlot 验证
- [ ] 只读事务模式正常工作
- [ ] 敏感信息（API Key、密码）不会泄露到日志
- [ ] statement_timeout 正确设置
- [ ] search_path 正确设置

### 6.3 质量验收

- [ ] 单元测试覆盖率 > 80%
- [ ] 所有关键路径有集成测试
- [ ] 代码通过 ruff 检查
- [ ] 代码通过 mypy 类型检查
- [ ] 有完整的使用文档

### 6.4 性能验收

- [ ] 简单查询端到端延迟 < 5s
- [ ] 连接池正常工作
- [ ] 无明显内存泄漏

---

## 7. 里程碑

| 里程碑     | 完成阶段      | 标志性产出                        |
|------------|--------------|-----------------------------------|
| M1: 基础   | Phase 0-2    | 项目结构 + 安全验证器完成         |
| M2: 数据层 | Phase 3-5    | 可连接数据库并执行查询            |
| M3: 智能化 | Phase 4-6    | 自然语言可转换为 SQL 并执行       |
| M4: MVP    | Phase 7      | MCP 服务器可用，可集成 Claude     |
| M5: 生产化 | Phase 8-9    | 弹性组件 + 可观测性完成           |
| M6: 发布   | Phase 10     | 测试完成 + 文档完成               |

---

## 8. 附录

### 8.1 开发环境要求

- Python 3.11+
- PostgreSQL 14+ (测试用)
- OpenAI API Key
- Docker & Docker Compose (可选)

### 8.2 推荐开发工具

- IDE: VS Code / PyCharm
- 虚拟环境: uv / poetry
- 数据库客户端: pgcli / DBeaver

### 8.3 参考资源

- [FastMCP 文档](https://github.com/modelcontextprotocol/python-sdk)
- [asyncpg 文档](https://magicstack.github.io/asyncpg/)
- [SQLGlot 文档](https://sqlglot.com/)
- [Pydantic 文档](https://docs.pydantic.dev/)

---

## 修订历史

| 版本 | 日期       | 作者 | 修改内容     |
|------|------------|------|-------------|
| v1.0 | 2025-12-20 | -    | 初始版本     |
