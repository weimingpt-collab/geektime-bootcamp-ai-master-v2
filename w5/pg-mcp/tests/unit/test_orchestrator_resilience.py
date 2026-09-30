"""Unit tests for resilience/observability integration in QueryOrchestrator.

Verifies that rate limiting, exponential backoff, metrics, request_id
propagation, and shared circuit breaker are wired into the query pipeline.
"""

import asyncio
from unittest.mock import AsyncMock, MagicMock

import pytest

from pg_mcp.config.settings import ResilienceConfig, ValidationConfig
from pg_mcp.models.errors import LLMError, SecurityViolationError
from pg_mcp.models.query import QueryRequest, ReturnType
from pg_mcp.models.schema import DatabaseSchema
from pg_mcp.observability.metrics import MetricsCollector
from pg_mcp.resilience.circuit_breaker import CircuitBreaker, CircuitState
from pg_mcp.resilience.rate_limiter import MultiRateLimiter
from pg_mcp.services.orchestrator import QueryOrchestrator


def _make_schema(db_name: str = "test_db") -> DatabaseSchema:
    """Create a minimal mock schema."""
    return DatabaseSchema(database_name=db_name, tables=[], version="15.0")


def _make_orchestrator(
    generator: object,
    validator: object,
    resilience_config: ResilienceConfig | None = None,
    rate_limiter: MultiRateLimiter | None = None,
    metrics: MetricsCollector | None = None,
    circuit_breaker: CircuitBreaker | None = None,
    executor: object | None = None,
) -> QueryOrchestrator:
    """Create an orchestrator with mocked components."""
    mock_cache = MagicMock()
    mock_cache.get.return_value = _make_schema()

    return QueryOrchestrator(
        sql_generator=generator,
        sql_validator=validator,
        sql_executor=executor or AsyncMock(),
        result_validator=AsyncMock(),
        schema_cache=mock_cache,
        pools={"test_db": MagicMock()},
        resilience_config=resilience_config or ResilienceConfig(),
        validation_config=ValidationConfig(enabled=False),
        rate_limiter=rate_limiter,
        metrics=metrics,
        circuit_breaker=circuit_breaker,
    )


def _make_request(return_type: ReturnType = ReturnType.SQL) -> QueryRequest:
    """Create a basic SQL-only request."""
    return QueryRequest(
        question="test question",
        database="test_db",
        return_type=return_type,
    )


class TestRateLimiting:
    """Test rate limiter integration in query flow."""

    @pytest.mark.asyncio
    async def test_query_limiter_blocks_excess_concurrency(self) -> None:
        """Requests beyond query_limit should get rate_limit_exceeded error."""
        rate_limiter = MultiRateLimiter(query_limit=1, llm_limit=5)

        # Occupy the only slot
        await rate_limiter.query_limiter.acquire()

        orchestrator = _make_orchestrator(
            generator=AsyncMock(),
            validator=MagicMock(),
            rate_limiter=rate_limiter,
        )
        response = await orchestrator.execute_query(_make_request())

        assert response.success is False
        assert response.error is not None
        assert response.error.code == "rate_limit_exceeded"

        # Release the slot
        rate_limiter.query_limiter.release()

    @pytest.mark.asyncio
    async def test_query_limiter_released_after_success(self) -> None:
        """Query limiter slot must be released after successful execution."""
        rate_limiter = MultiRateLimiter(query_limit=1, llm_limit=5)

        generator = AsyncMock()
        generator.generate.return_value = "SELECT 1;"
        validator = MagicMock()
        validator.validate_or_raise.return_value = None

        orchestrator = _make_orchestrator(
            generator=generator,
            validator=validator,
            rate_limiter=rate_limiter,
        )
        response = await orchestrator.execute_query(_make_request())

        assert response.success is True
        # release() decrements active_count via a scheduled task; yield to it
        await asyncio.sleep(0)
        assert rate_limiter.query_limiter.active_count == 0
        assert rate_limiter.query_limiter.get_stats()["total_requests"] == 1

    @pytest.mark.asyncio
    async def test_llm_limiter_released_on_validation_failure(self) -> None:
        """LLM limiter slot must be released even when validation fails."""
        rate_limiter = MultiRateLimiter(query_limit=5, llm_limit=1)

        generator = AsyncMock()
        generator.generate.return_value = "DELETE FROM users;"
        validator = MagicMock()
        validator.validate_or_raise.side_effect = SecurityViolationError("nope")

        orchestrator = _make_orchestrator(
            generator=generator,
            validator=validator,
            resilience_config=ResilienceConfig(max_retries=0),
            rate_limiter=rate_limiter,
        )
        await orchestrator.execute_query(_make_request())

        # release() decrements active_count via a scheduled task; yield to it
        await asyncio.sleep(0)
        assert rate_limiter.llm_limiter.active_count == 0


class TestExponentialBackoff:
    """Test backoff delays between retry attempts."""

    @pytest.mark.asyncio
    async def test_backoff_delays_applied_between_retries(self) -> None:
        """Retry attempts should sleep retry_delay * backoff_factor^n."""
        generator = AsyncMock()
        generator.generate.side_effect = [
            "SELECT * FROM user;",
            "SELECT * FROM users;",
        ]
        validator = MagicMock()
        validator.validate_or_raise.side_effect = [
            SecurityViolationError("bad"),
            None,
        ]

        orchestrator = _make_orchestrator(
            generator=generator,
            validator=validator,
            resilience_config=ResilienceConfig(
                max_retries=1,
                retry_delay=0.1,
                backoff_factor=2.0,
            ),
        )

        sleep_calls: list[float] = []
        real_sleep = asyncio.sleep

        async def fake_sleep(delay: float) -> None:
            sleep_calls.append(delay)
            await real_sleep(0)

        monkey_patch = asyncio.sleep
        asyncio.sleep = fake_sleep
        try:
            response = await orchestrator.execute_query(_make_request())
        finally:
            asyncio.sleep = monkey_patch

        assert response.success is True
        assert generator.generate.call_count == 2
        assert sleep_calls == [0.1]  # one retry: retry_delay * factor^0

    @pytest.mark.asyncio
    async def test_no_backoff_on_first_attempt(self) -> None:
        """First attempt should not sleep."""
        generator = AsyncMock()
        generator.generate.return_value = "SELECT 1;"
        validator = MagicMock()
        validator.validate_or_raise.return_value = None

        orchestrator = _make_orchestrator(
            generator=generator,
            validator=validator,
            resilience_config=ResilienceConfig(max_retries=3, retry_delay=0.1),
        )

        sleep_calls: list[float] = []
        real_sleep = asyncio.sleep

        async def fake_sleep(delay: float) -> None:
            sleep_calls.append(delay)
            await real_sleep(0)

        monkey_patch = asyncio.sleep
        asyncio.sleep = fake_sleep
        try:
            response = await orchestrator.execute_query(_make_request())
        finally:
            asyncio.sleep = monkey_patch

        assert response.success is True
        assert sleep_calls == []


class TestMetricsIntegration:
    """Test metrics recording in query flow.

    MetricsCollector is a prometheus singleton registry; tests assert that
    counter values increase rather than comparing absolute values.
    """

    def _fresh_metrics(self) -> MetricsCollector:
        """Create a metrics collector instance for testing."""
        return MetricsCollector()

    @pytest.mark.asyncio
    async def test_success_metrics_recorded(self) -> None:
        """Successful query should increment request counter."""
        metrics = self._fresh_metrics()
        generator = AsyncMock()
        generator.generate.return_value = "SELECT 1;"
        validator = MagicMock()
        validator.validate_or_raise.return_value = None

        orchestrator = _make_orchestrator(
            generator=generator,
            validator=validator,
            metrics=metrics,
        )

        before = (
            metrics.query_requests.labels(status="success", database="test_db")._value.get()
        )
        response = await orchestrator.execute_query(_make_request())

        assert response.success is True
        after = (
            metrics.query_requests.labels(status="success", database="test_db")._value.get()
        )
        assert after - before == 1

    @pytest.mark.asyncio
    async def test_error_metrics_recorded(self) -> None:
        """Failed query should increment request counter with error status."""
        metrics = self._fresh_metrics()
        generator = AsyncMock()
        generator.generate.side_effect = LLMError("LLM down")

        orchestrator = _make_orchestrator(
            generator=generator,
            validator=MagicMock(),
            metrics=metrics,
        )
        response = await orchestrator.execute_query(_make_request())

        assert response.success is False
        counter_value = (
            metrics.query_requests.labels(
                status="llm_error", database="test_db"
            )._value.get()
        )
        assert counter_value == 1

    @pytest.mark.asyncio
    async def test_llm_call_metrics_recorded(self) -> None:
        """LLM generation should record call count and latency."""
        metrics = self._fresh_metrics()
        generator = AsyncMock()
        generator.generate.return_value = "SELECT 1;"
        validator = MagicMock()
        validator.validate_or_raise.return_value = None

        orchestrator = _make_orchestrator(
            generator=generator,
            validator=validator,
            metrics=metrics,
        )

        before = metrics.llm_calls.labels(operation="generate_sql")._value.get()
        await orchestrator.execute_query(_make_request())

        after = metrics.llm_calls.labels(operation="generate_sql")._value.get()
        assert after - before == 1
        latency_count = metrics.llm_latency.labels(
            operation="generate_sql"
        )._sum.get()
        assert latency_count >= 0

    @pytest.mark.asyncio
    async def test_security_rejection_metric_recorded(self) -> None:
        """Rejected SQL should increment sql_rejected counter."""
        metrics = self._fresh_metrics()
        generator = AsyncMock()
        generator.generate.return_value = "DELETE FROM users;"
        validator = MagicMock()
        validator.validate_or_raise.side_effect = SecurityViolationError("nope")

        orchestrator = _make_orchestrator(
            generator=generator,
            validator=validator,
            resilience_config=ResilienceConfig(max_retries=0),
            metrics=metrics,
        )
        await orchestrator.execute_query(_make_request())

        assert (
            metrics.sql_rejected.labels(reason="security_violation")._value.get() == 1
        )

    @pytest.mark.asyncio
    async def test_no_metrics_when_collector_absent(self) -> None:
        """Pipeline should work without a metrics collector (None)."""
        generator = AsyncMock()
        generator.generate.return_value = "SELECT 1;"
        validator = MagicMock()
        validator.validate_or_raise.return_value = None

        orchestrator = _make_orchestrator(
            generator=generator,
            validator=validator,
            metrics=None,
        )
        response = await orchestrator.execute_query(_make_request())
        assert response.success is True

    @pytest.mark.asyncio
    async def test_schema_cache_age_metric_recorded(self) -> None:
        """Schema cache age gauge should be set from cache timestamp."""
        metrics = self._fresh_metrics()
        generator = AsyncMock()
        generator.generate.return_value = "SELECT 1;"
        validator = MagicMock()
        validator.validate_or_raise.return_value = None

        mock_cache = MagicMock()
        mock_cache.get.return_value = _make_schema()
        mock_cache.get_cache_age.return_value = 42.0

        orchestrator = QueryOrchestrator(
            sql_generator=generator,
            sql_validator=validator,
            sql_executor=AsyncMock(),
            result_validator=AsyncMock(),
            schema_cache=mock_cache,
            pools={"test_db": MagicMock()},
            resilience_config=ResilienceConfig(),
            validation_config=ValidationConfig(enabled=False),
            metrics=metrics,
        )
        await orchestrator.execute_query(_make_request())

        gauge_value = metrics.schema_cache_age.labels(database="test_db")._value.get()
        assert gauge_value == 42.0

    @pytest.mark.asyncio
    async def test_db_connections_active_metric_recorded(self) -> None:
        """Active connection gauge should be set from pool stats."""
        metrics = self._fresh_metrics()
        generator = AsyncMock()
        generator.generate.return_value = "SELECT 1;"
        validator = MagicMock()
        validator.validate_or_raise.return_value = None

        mock_pool = MagicMock()
        mock_pool.get_size.return_value = 8
        mock_pool.get_idle_size.return_value = 3

        executor = AsyncMock()
        executor.execute.return_value = ([{"id": 1}], 1)

        orchestrator = QueryOrchestrator(
            sql_generator=generator,
            sql_validator=validator,
            sql_executor=executor,
            result_validator=AsyncMock(),
            schema_cache=MagicMock(),
            pools={"test_db": mock_pool},
            resilience_config=ResilienceConfig(),
            validation_config=ValidationConfig(enabled=False),
            metrics=metrics,
        )
        # Bypass schema flow; go straight through with RESULT to hit executor
        orchestrator.schema_cache.get.return_value = _make_schema()
        request = _make_request(return_type=ReturnType.RESULT)
        response = await orchestrator.execute_query(request)

        assert response.success is True
        gauge_value = metrics.db_connections_active.labels(
            database="test_db"
        )._value.get()
        assert gauge_value == 5  # 8 total - 3 idle


class TestRequestIdPropagation:
    """Test request_id generation and propagation."""

    @pytest.mark.asyncio
    async def test_response_contains_request_id(self) -> None:
        """Response should carry a request_id for tracing."""
        generator = AsyncMock()
        generator.generate.return_value = "SELECT 1;"
        validator = MagicMock()
        validator.validate_or_raise.return_value = None

        orchestrator = _make_orchestrator(generator=generator, validator=validator)
        response = await orchestrator.execute_query(_make_request())

        assert response.request_id is not None
        assert len(response.request_id) == 36  # UUID4

    @pytest.mark.asyncio
    async def test_error_response_contains_request_id(self) -> None:
        """Error responses should also carry request_id."""
        generator = AsyncMock()
        generator.generate.side_effect = LLMError("LLM down")

        orchestrator = _make_orchestrator(generator=generator, validator=MagicMock())
        response = await orchestrator.execute_query(_make_request())

        assert response.success is False
        assert response.request_id is not None

    @pytest.mark.asyncio
    async def test_request_id_unique_per_call(self) -> None:
        """Each call should get a distinct request_id."""
        generator = AsyncMock()
        generator.generate.return_value = "SELECT 1;"
        validator = MagicMock()
        validator.validate_or_raise.return_value = None

        orchestrator = _make_orchestrator(generator=generator, validator=validator)
        r1 = await orchestrator.execute_query(_make_request())
        r2 = await orchestrator.execute_query(_make_request())

        assert r1.request_id != r2.request_id


class TestSharedCircuitBreaker:
    """Test shared circuit breaker wiring."""

    @pytest.mark.asyncio
    async def test_shared_circuit_breaker_state_updated(self) -> None:
        """Orchestrator should use the provided shared circuit breaker."""
        shared_breaker = CircuitBreaker(failure_threshold=1, recovery_timeout=60.0)

        generator = AsyncMock()
        generator.generate.side_effect = RuntimeError("boom")

        orchestrator = _make_orchestrator(
            generator=generator,
            validator=MagicMock(),
            resilience_config=ResilienceConfig(max_retries=0),
            circuit_breaker=shared_breaker,
        )
        await orchestrator.execute_query(_make_request())

        assert orchestrator.circuit_breaker is shared_breaker
        assert shared_breaker.state == CircuitState.OPEN

    @pytest.mark.asyncio
    async def test_open_shared_breaker_blocks_requests(self) -> None:
        """Open shared breaker should short-circuit before LLM call."""
        shared_breaker = CircuitBreaker(failure_threshold=1)
        shared_breaker._state = CircuitState.OPEN
        shared_breaker._failure_count = 1

        generator = AsyncMock()
        orchestrator = _make_orchestrator(
            generator=generator,
            validator=MagicMock(),
            circuit_breaker=shared_breaker,
        )
        response = await orchestrator.execute_query(_make_request())

        assert response.success is False
        assert "circuit breaker" in response.error.message.lower()
        generator.generate.assert_not_called()
