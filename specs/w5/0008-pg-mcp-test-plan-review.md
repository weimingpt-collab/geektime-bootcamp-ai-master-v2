# PostgreSQL MCP Server - 测试计划审查报告

## 文档信息

| 项目       | 内容                          |
|------------|------------------------------|
| 文档版本   | v1.0                         |
| 创建日期   | 2025-12-20                   |
| 审查工具   | OpenAI Codex CLI             |
| 审查对象   | 0007-pg-mcp-test-plan.md     |
| 关联设计   | 0002-pg-mcp-design.md        |
| 关联实现   | 0004-pg-mcp-impl-plan.md     |

---

## 1. 审查摘要

### 1.1 总体评估

测试计划提供了良好的基础框架，特别是 SQL 验证器的单元测试覆盖相对完善。但在端到端测试、安全测试和性能测试方面存在明显的实现空白。部分测试用例仅为占位符，无法实际执行。

### 1.2 发现统计

| 严重程度 | 数量 | 描述 |
|----------|------|------|
| Critical | 1 | 多个测试套件为不可执行的占位符 |
| High | 2 | Fixtures 缺失、关键组件测试覆盖缺失 |
| Medium | 2 | 策略不一致、安全测试深度不足 |
| Low | 1 | 运维细节缺失 |

---

## 2. 详细发现

### 2.1 Critical - 不可执行的测试占位符

**位置**: `specs/w5/0007-pg-mcp-test-plan.md:1963-2059, 2235-2305`

**问题描述**:
多个测试套件仅包含 `pass` 语句，无实际测试逻辑：
- 所有 E2E MCP 协议测试 (`test_mcp_protocol.py`)
- 所有真实场景测试 (`test_scenarios.py`)
- 安全渗透测试和输入验证测试

**影响**:
- 这些套件提供零测试覆盖
- 将导致 CI linting 失败
- 给团队造成虚假的安全感

**建议**:
1. 实现完整的测试流程，或
2. 使用 `pytest.skip()` 标记为跳过，并添加具体的 TODO 和责任人/日期
3. 在 CI 中添加检查，防止纯 `pass` 测试通过

**修复示例**:
```python
# 替换当前的占位符
@pytest.mark.asyncio
async def test_server_initialization(self):
    """服务器初始化"""
    pass  # 当前状态

# 改为
@pytest.mark.asyncio
@pytest.mark.skip(reason="TODO: Implement by 2025-01-15, owner: @developer")
async def test_server_initialization(self):
    """服务器初始化"""
    # 或者实现完整测试
    async with stdio_client() as client:
        await client.initialize()
        assert client.is_connected
```

---

### 2.2 High - Fixtures 和设置缺失

**位置**: `specs/w5/0007-pg-mcp-test-plan.md:2080-2221, 2235-2352`

**问题描述**:
性能测试和安全测试引用了 `orchestrator`、`QueryRequest`、`SchemaCache` 等 fixtures，但这些在共享 fixtures 部分未定义。

**缺失的 Fixtures**:
- 性能测试用 orchestrator（带真实/Mock DB）
- 安全测试用 orchestrator
- MetricsCollector fixture
- Mock OpenAI 客户端（用于性能测试）
- 数据库生命周期钩子

**建议**:
在 `tests/conftest.py` 中添加以下 fixtures：

```python
# tests/conftest.py 补充

@pytest_asyncio.fixture
async def performance_orchestrator(
    settings,
    real_pg_pool,
    database_config,
    security_config,
    setup_test_db,
):
    """性能测试用 Orchestrator（使用 Mock LLM）"""
    schema_cache = SchemaCache()
    await schema_cache.load(database_config.name, real_pg_pool, database_config)

    # 使用快速响应的 Mock LLM
    mock_openai = AsyncMock()
    mock_openai.chat.completions.create = AsyncMock(return_value=MagicMock(
        choices=[MagicMock(message=MagicMock(
            content="```sql\nSELECT 1;\n```"
        ))],
        usage=MagicMock(total_tokens=50),
    ))

    sql_generator = SQLGenerator(openai_config)
    sql_generator.client = mock_openai

    # ... 构建完整 orchestrator
    return orchestrator


@pytest.fixture
def metrics_collector():
    """MetricsCollector fixture"""
    return MetricsCollector(prefix="test_pg_mcp")
```

---

### 2.3 High - 关键设计组件测试覆盖缺失

**问题描述**:
以下在设计文档 (`0002-pg-mcp-design.md`) 和实现计划 (`0004-pg-mcp-impl-plan.md`) 中定义的一等公民组件，在测试计划中完全缺失或覆盖不足：

| 组件 | 测试状态 | 影响 |
|------|----------|------|
| FastMCP Server 启动/工具 Schema | 缺失 | MCP 协议合规性未验证 |
| ResultValidator 行为 | 缺失 | 结果验证逻辑未测试 |
| Retry Policy (重试策略) | 缺失 | 重试机制可能有 bug |
| Rate Limiter 错误路径 | 缺失 | 限流行为未验证 |
| Metrics/Logging/Tracing | 缺失 | 可观测性无保障 |
| Prompts 模块 | 缺失 | Prompt 工程变更无回归保护 |
| DB Introspection 查询 | 缺失 | Schema 加载正确性未验证 |
| 多数据库选择逻辑 | 缺失 | 多 DB 场景未测试 |

**建议**:
添加以下测试模块：

```python
# tests/unit/test_result_validator.py
class TestResultValidator:
    async def test_validation_success(self): ...
    async def test_validation_low_confidence(self): ...
    async def test_validation_disabled(self): ...
    async def test_validation_timeout(self): ...

# tests/unit/test_fastmcp_server.py
class TestFastMCPServer:
    async def test_server_lifespan_startup(self): ...
    async def test_server_lifespan_shutdown(self): ...
    async def test_query_tool_schema(self): ...
    async def test_query_tool_execution(self): ...

# tests/unit/test_metrics.py
class TestMetricsCollector:
    def test_query_requests_counter(self): ...
    def test_query_duration_histogram(self): ...
    def test_llm_tokens_counter(self): ...

# tests/unit/test_prompts.py
class TestSQLGenerationPrompt:
    def test_build_user_prompt_basic(self): ...
    def test_build_user_prompt_with_retry(self): ...
    def test_build_user_prompt_with_context(self): ...
```

---

### 2.4 Medium - 测试策略不一致

**问题描述**:
1. 测试金字塔/覆盖率目标忽略了安全/性能测试套件
2. 整体 80% 覆盖率目标与验证器 95% 目标的度量范围不明确（行覆盖 vs 分支覆盖）
3. 性能 SLA（如 100 次验证 < 1s，50 个并发编排）在没有 Mock 的 CI 中过于乐观，可能导致 flaky 测试

**建议**:
1. 明确覆盖率度量标准：
```yaml
# 建议的覆盖率配置 (.coveragerc)
[run]
branch = true
source = src/pg_mcp

[report]
exclude_lines =
    pragma: no cover
    if TYPE_CHECKING:
    raise NotImplementedError
fail_under = 80
```

2. 为性能测试添加 Mock 快速路径：
```python
@pytest.mark.performance
class TestPerformanceBenchmarks:
    @pytest.fixture
    def mock_llm_orchestrator(self):
        """使用 Mock LLM 的 orchestrator，避免网络延迟"""
        # 返回预配置的快速响应 Mock
        ...

    @pytest.mark.asyncio
    async def test_sql_validation_performance(self, sql_validator):
        """这个测试可以保持原样，因为不涉及外部依赖"""
        ...

    @pytest.mark.asyncio
    @pytest.mark.slow  # 标记为慢测试
    async def test_concurrent_query_throughput_real(self, orchestrator):
        """使用真实 LLM 的测试，仅在特定环境运行"""
        ...
```

---

### 2.5 Medium - 安全测试深度不足

**位置**: `specs/w5/0007-pg-mcp-test-plan.md:2235-2352`

**问题描述**:
- 注入测试用例无断言，仅有 `pass`
- 缺少以下安全场景的覆盖：
  - `search_path` 注入
  - 角色提权攻击
  - 跨数据库访问
  - 视图/函数白名单
  - 错误消息信息泄露（仅有一个简单用例）
- 限流测试仅计数，未验证时序/退避行为

**建议添加的安全测试**:

```python
# tests/security/test_advanced_security.py

class TestSearchPathInjection:
    """测试 search_path 注入防护"""

    @pytest.mark.parametrize("malicious_sql", [
        "SET search_path TO malicious_schema; SELECT * FROM users",
        "SELECT * FROM users; SET search_path = 'evil'",
    ])
    def test_search_path_manipulation_blocked(self, sql_validator, malicious_sql):
        is_valid, error = sql_validator.validate(malicious_sql)
        assert is_valid is False
        assert "不允许" in error or "SET" in error


class TestRoleEscalation:
    """测试角色提权防护"""

    @pytest.mark.asyncio
    async def test_cannot_escalate_to_superuser(self, executor, setup_test_db):
        """验证无法切换到超级用户角色"""
        with pytest.raises(Exception):
            await executor.execute("SET ROLE postgres")


class TestCrossDatabaseAccess:
    """测试跨数据库访问防护"""

    @pytest.mark.asyncio
    async def test_cannot_access_other_database(self, sql_validator):
        sql = "SELECT * FROM other_database.public.secrets"
        is_valid, _ = sql_validator.validate(sql)
        assert is_valid is False


class TestPartialFieldMasking:
    """测试敏感字段部分屏蔽"""

    @pytest.mark.asyncio
    async def test_returns_users_without_password(self, orchestrator, database_config):
        """验证返回用户数据时不包含密码字段"""
        request = QueryRequest(
            question="查询所有用户信息",
            database=database_config.name,
        )
        response = await orchestrator.execute_query(request)

        if response.success and response.data.result:
            for row in response.data.result:
                assert "password_hash" not in row
                assert "password" not in row


class TestRateLimitingBehavior:
    """测试限流行为"""

    @pytest.mark.asyncio
    async def test_rate_limit_with_backoff(self, orchestrator, database_config):
        """验证限流时的退避行为"""
        import time

        results = []
        timestamps = []

        for _ in range(20):
            start = time.time()
            request = QueryRequest(question="test", database=database_config.name)
            response = await orchestrator.execute_query(request)
            results.append(response)
            timestamps.append(time.time() - start)

        # 验证被限流的请求
        rate_limited = [r for r in results if not r.success and
                       r.error and r.error.code.name == "RATE_LIMITED"]

        assert len(rate_limited) > 0, "应该有请求被限流"

        # 验证限流错误包含重试建议
        for r in rate_limited:
            assert r.error.suggestion is not None
```

---

### 2.6 Low - 运维细节缺失

**问题描述**:
1. E2E/性能/安全测试需要真实 PostgreSQL，但未提供容器/DSN 设置
2. 测试清理仅删除部分对象（未包含视图/类型），可能在多次运行间留下残留
3. 性能测试中的长时间循环（1 分钟持续负载，50 并发突发）使用真实 DB/LLM 会导致 CI 不稳定

**建议**:

1. 添加 Docker Compose 测试环境：
```yaml
# tests/docker-compose.test.yml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: test_pg_mcp
    ports:
      - "5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test"]
      interval: 5s
      timeout: 5s
      retries: 5
```

2. 完善清理逻辑：
```python
@pytest_asyncio.fixture
async def setup_test_db(real_pg_pool) -> AsyncGenerator[None, None]:
    """初始化测试数据库"""
    async with real_pg_pool.acquire() as conn:
        # 读取并执行测试 schema
        schema_file = os.path.join(os.path.dirname(__file__), "fixtures", "test_schema.sql")
        with open(schema_file) as f:
            await conn.execute(f.read())

    yield

    # 完整清理
    async with real_pg_pool.acquire() as conn:
        await conn.execute("""
            DROP VIEW IF EXISTS order_summary CASCADE;
            DROP TABLE IF EXISTS order_items, orders, products, users, secret_data CASCADE;
            DROP TYPE IF EXISTS order_status CASCADE;
        """)
```

3. 为长时间测试添加标记和 Mock 快速路径：
```python
@pytest.mark.performance
@pytest.mark.slow
@pytest.mark.skipif(
    os.getenv("RUN_SLOW_TESTS") != "true",
    reason="Slow test, set RUN_SLOW_TESTS=true to run"
)
async def test_sustained_load(self, performance_orchestrator, database_config):
    """持续负载测试 - 仅在明确启用时运行"""
    ...
```

---

## 3. 缺失的测试场景

### 3.1 必须添加的测试场景

| 组件 | 缺失场景 | 优先级 |
|------|----------|--------|
| **FastMCP Server** | 启动/健康检查、工具注册/Schema 验证、错误响应格式 | P0 |
| **QueryOrchestrator** | 多 DB 选择/回退、Schema 缓存未命中/刷新、LLM 失败→重试/退避、熔断器开/半开行为、结果验证失败、请求级超时 | P0 |
| **SQLExecutor** | 只读事务强制执行、语句超时映射、大结果分页、二进制/JSONB/数组类型、游标取消 | P1 |
| **Schema Cache** | 处理新增/删除的表、权限拒绝的内省、枚举/视图/扩展覆盖 | P1 |
| **Security** | search_path 注入、角色提权、SSRF/dblink/copy to file、EXPLAIN/ANALYZE 门控、部分字段屏蔽 | P0 |
| **Observability** | 指标/日志/追踪发出预期的计数器/直方图/ID、限流器耗尽时的指标 | P2 |
| **Performance** | 冷启动 vs 热缓存延迟、连接池抖动、LLM 客户端超时路径（使用 Mock） | P2 |

### 3.2 建议的测试用例模板

```python
# tests/integration/test_orchestrator_advanced.py

class TestMultiDatabaseSelection:
    """多数据库选择测试"""

    @pytest.mark.asyncio
    async def test_auto_select_single_db(self, orchestrator_single_db):
        """单数据库时自动选择"""
        request = QueryRequest(question="查询用户")
        response = await orchestrator_single_db.execute_query(request)
        assert response.success is True

    @pytest.mark.asyncio
    async def test_require_db_when_multiple(self, orchestrator_multi_db):
        """多数据库时必须指定"""
        request = QueryRequest(question="查询用户")
        response = await orchestrator_multi_db.execute_query(request)
        assert response.success is False
        assert response.error.code == ErrorCode.BAD_REQUEST

    @pytest.mark.asyncio
    async def test_fallback_on_db_failure(self, orchestrator_with_fallback):
        """数据库故障时的回退"""
        ...


class TestSchemaCacheBehavior:
    """Schema 缓存行为测试"""

    @pytest.mark.asyncio
    async def test_cache_miss_triggers_load(self, schema_cache, real_pg_pool):
        """缓存未命中触发加载"""
        ...

    @pytest.mark.asyncio
    async def test_refresh_updates_cache(self, schema_cache, real_pg_pool):
        """刷新更新缓存"""
        ...

    @pytest.mark.asyncio
    async def test_handles_new_table(self, schema_cache, real_pg_pool):
        """处理新增表"""
        # 1. 加载 schema
        # 2. 创建新表
        # 3. 刷新 schema
        # 4. 验证新表出现
        ...


class TestCircuitBreakerBehavior:
    """熔断器行为测试"""

    @pytest.mark.asyncio
    async def test_opens_after_failures(self, orchestrator_with_failing_llm):
        """连续失败后打开"""
        ...

    @pytest.mark.asyncio
    async def test_half_open_allows_one_request(self, orchestrator_with_circuit_breaker):
        """半开状态允许一个请求"""
        ...

    @pytest.mark.asyncio
    async def test_success_in_half_open_closes(self, orchestrator_with_circuit_breaker):
        """半开状态成功关闭熔断器"""
        ...
```

---

## 4. 可维护性建议

### 4.1 统一 Fixtures 管理

**问题**: Fixtures 分散在各测试文件中，orchestrator 构造在多个套件间重复

**建议**:
- 在 `tests/conftest.py` 中使用工厂 fixture 模式
- 提供覆盖钩子

```python
# tests/conftest.py

@pytest.fixture
def orchestrator_factory(
    settings,
    schema_cache,
    sql_generator,
    sql_validator,
    executors,
    result_validator,
    circuit_breaker,
    metrics,
):
    """Orchestrator 工厂 - 支持自定义组件覆盖"""
    def create_orchestrator(**overrides):
        return QueryOrchestrator(
            settings=overrides.get("settings", settings),
            schema_cache=overrides.get("schema_cache", schema_cache),
            sql_generator=overrides.get("sql_generator", sql_generator),
            sql_validator=overrides.get("sql_validator", sql_validator),
            executors=overrides.get("executors", executors),
            result_validator=overrides.get("result_validator", result_validator),
            llm_circuit_breaker=overrides.get("circuit_breaker", circuit_breaker),
            metrics=overrides.get("metrics", metrics),
        )
    return create_orchestrator


# 使用示例
@pytest.fixture
def orchestrator(orchestrator_factory):
    """标准 orchestrator"""
    return orchestrator_factory()


@pytest.fixture
def orchestrator_with_failing_llm(orchestrator_factory, failing_llm_generator):
    """LLM 总是失败的 orchestrator"""
    return orchestrator_factory(sql_generator=failing_llm_generator)
```

### 4.2 Mock 策略文档化

**问题**: 混合使用真实 DB + Mock OpenAI 的策略未文档化

**建议**: 在测试计划中添加明确的 Mock 策略说明：

```markdown
## Mock 策略

| 组件 | 单元测试 | 集成测试 | E2E 测试 | 性能测试 |
|------|----------|----------|----------|----------|
| PostgreSQL | Mock | Real | Real | Real |
| OpenAI API | Mock | Mock | Mock* | Mock |
| Schema Cache | Real | Real | Real | Real |
| Circuit Breaker | Real | Real | Real | Real |

*注: E2E 测试可选使用真实 OpenAI API，通过环境变量控制
```

### 4.3 确定性种子

**建议**: 为所有涉及随机性的测试添加确定性种子：

```python
@pytest.fixture(autouse=True)
def set_random_seed():
    """确保测试可重复"""
    import random
    import numpy as np

    random.seed(42)
    np.random.seed(42)
```

---

## 5. 行动项总结

### P0 - 必须在 v1.0 前完成

| 行动项 | 责任人 | 截止日期 |
|--------|--------|----------|
| 实现 E2E MCP 协议测试 | TBD | TBD |
| 实现安全渗透测试断言 | TBD | TBD |
| 添加缺失的 fixtures | TBD | TBD |
| 添加 FastMCP Server 测试 | TBD | TBD |
| 添加 ResultValidator 测试 | TBD | TBD |

### P1 - 应在 v1.0 后尽快完成

| 行动项 | 责任人 | 截止日期 |
|--------|--------|----------|
| 添加 SQLExecutor 高级测试 | TBD | TBD |
| 添加 Schema Cache 刷新测试 | TBD | TBD |
| 添加多数据库选择测试 | TBD | TBD |
| 完善测试清理逻辑 | TBD | TBD |

### P2 - 可在后续迭代完成

| 行动项 | 责任人 | 截止日期 |
|--------|--------|----------|
| 添加可观测性测试 | TBD | TBD |
| 优化性能测试（Mock 快速路径） | TBD | TBD |
| 添加 Docker Compose 测试环境 | TBD | TBD |

---

## 6. 审查结论

### 6.1 优点

1. SQL 验证器测试覆盖全面，涵盖了大量安全场景
2. 测试金字塔结构清晰
3. 使用了参数化测试减少代码重复
4. 配置和模型验证测试完备
5. CI/CD 集成配置合理

### 6.2 需改进

1. E2E 和安全测试需要从占位符升级为完整实现
2. 需要添加更多设计文档中定义的组件测试
3. 需要统一和集中 fixtures 管理
4. 需要添加长时间测试的 Mock 快速路径

### 6.3 最终建议

**建议在开始实现前先完善测试计划**，特别是：

1. 将所有 `pass` 占位符替换为 `pytest.skip()` 并添加明确的 TODO
2. 在 `tests/conftest.py` 中统一所有共享 fixtures
3. 为每个设计文档中的组件添加至少一个基本测试用例
4. 添加 Docker Compose 测试环境配置

---

## 修订历史

| 版本 | 日期       | 作者 | 修改内容     |
|------|------------|------|-------------|
| v1.0 | 2025-12-20 | Codex + Claude | 初始版本 |
