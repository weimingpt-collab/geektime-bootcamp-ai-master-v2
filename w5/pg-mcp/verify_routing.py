"""多数据库路由验证：不调用 LLM，不启动 MCP。"""
import asyncio

from pg_mcp.config.settings import ResilienceConfig, Settings, ValidationConfig
from pg_mcp.db.pool import create_pool
from pg_mcp.services.orchestrator import QueryOrchestrator
from pg_mcp.services.sql_executor import SQLExecutor


async def main() -> None:
    settings = Settings()
    print(f"配置的数据库: {[db.name for db in settings.databases]}")

    pools, executors = {}, {}
    for db in settings.databases:
        pool = await create_pool(db)
        pools[db.name] = pool
        executors[db.name] = SQLExecutor(
            pool=pool, security_config=settings.security, db_config=db
        )

    orch = QueryOrchestrator(
        sql_generator=None, sql_validator=None,
        sql_executor=executors[settings.databases[0].name],
        sql_executors=executors, result_validator=None,
        schema_cache=None, pools=pools,
        resilience_config=ResilienceConfig(),
        validation_config=ValidationConfig(),
    )

    try:
        # 检查 1：每个库名路由到自己的执行器
        for name in pools:
            assert orch._resolve_executor(name) is executors[name]
            print(f"路由 OK: {name} -> 自己的执行器")

        # 检查 2：每个连接池实际连上的数据库（防"请求走错库"）
        for name, pool in pools.items():
            actual = await pool.fetchval("SELECT current_database()")
            status = "OK" if actual == name else "MISMATCH!"
            print(f"连接 {status}: 池 '{name}' 实际连到 '{actual}'")

        # 检查 3：绕过 LLM 直接执行，验证查询跑在指定库上
        first_db = settings.databases[0].name
        results, _ = await executors[first_db].execute(
            "SELECT current_database() AS db, COUNT(*) AS tables "
            "FROM information_schema.tables WHERE table_schema='public'"
        )
        print(f"在 {first_db} 上执行 -> {results}")
    finally:
        await asyncio.gather(*(p.close() for p in pools.values()))


asyncio.run(main())
