"""Query orchestrator for coordinating the complete query flow.

This module provides the QueryOrchestrator class that coordinates all components
of the query processing pipeline: SQL generation, validation, execution, and result
validation. It implements retry logic, error handling, and request tracking.
"""

import asyncio
import logging
import time
import uuid
from typing import Any

from asyncpg import Pool

from pg_mcp.cache.schema_cache import SchemaCache
from pg_mcp.config.settings import ResilienceConfig, ValidationConfig
from pg_mcp.models.errors import (
    DatabaseError,
    ErrorCode,
    LLMError,
    PgMcpError,
    RateLimitExceededError,
    SchemaLoadError,
    SecurityViolationError,
    SQLParseError,
)
from pg_mcp.models.query import (
    ErrorDetail,
    QueryRequest,
    QueryResponse,
    QueryResult,
    ReturnType,
    ValidationResult,
)
from pg_mcp.observability.metrics import MetricsCollector
from pg_mcp.observability.tracing import request_context
from pg_mcp.resilience.circuit_breaker import CircuitBreaker
from pg_mcp.resilience.rate_limiter import MultiRateLimiter
from pg_mcp.services.result_validator import ResultValidator
from pg_mcp.services.sql_executor import SQLExecutor
from pg_mcp.services.sql_generator import SQLGenerator
from pg_mcp.services.sql_validator import SQLValidator

logger = logging.getLogger(__name__)


class QueryOrchestrator:
    """Orchestrates the complete query processing pipeline.

    This class coordinates SQL generation, validation, execution, and result
    validation. It implements retry logic with error feedback, circuit breaker
    pattern for fault tolerance, and comprehensive error handling.

    Example:
        >>> orchestrator = QueryOrchestrator(
        ...     sql_generator=generator,
        ...     sql_validator=validator,
        ...     sql_executor=executor,
        ...     result_validator=result_validator,
        ...     schema_cache=cache,
        ...     pools={"mydb": pool},
        ...     resilience_config=resilience_config,
        ...     validation_config=validation_config,
        ... )
        >>> response = await orchestrator.execute_query(QueryRequest(
        ...     question="How many users?",
        ...     database="mydb"
        ... ))
    """

    def __init__(
        self,
        sql_generator: SQLGenerator,
        sql_validator: SQLValidator,
        sql_executor: SQLExecutor,
        result_validator: ResultValidator,
        schema_cache: SchemaCache,
        pools: dict[str, Pool],
        resilience_config: ResilienceConfig,
        validation_config: ValidationConfig,
        sql_executors: dict[str, SQLExecutor] | None = None,
        circuit_breaker: CircuitBreaker | None = None,
        rate_limiter: MultiRateLimiter | None = None,
        metrics: MetricsCollector | None = None,
    ) -> None:
        """Initialize query orchestrator.

        Args:
            sql_generator: SQL generation service.
            sql_validator: SQL validation service.
            sql_executor: Default SQL execution service (used when no per-database
                executors are provided).
            result_validator: Result validation service.
            schema_cache: Schema cache instance.
            pools: Dictionary mapping database names to connection pools.
            resilience_config: Resilience configuration for retries and circuit breaker.
            validation_config: Validation configuration including thresholds.
            sql_executors: Optional mapping of database names to executors. When
                provided, the executor is selected by the resolved database name so
                that requests run against the correct database.
            circuit_breaker: Optional shared circuit breaker for LLM calls. When
                omitted, a private instance is created from resilience_config.
            rate_limiter: Optional rate limiter guarding concurrent query and LLM
                operations. When omitted, no rate limiting is applied.
            metrics: Optional metrics collector for observability. When omitted,
                no metrics are recorded.
        """
        self.sql_generator = sql_generator
        self.sql_validator = sql_validator
        self.result_validator = result_validator
        self.schema_cache = schema_cache
        self.pools = pools
        self.resilience_config = resilience_config
        self.validation_config = validation_config

        # Per-database executors: explicit map, or fall back to the single
        # executor for every database (legacy single-database mode).
        if sql_executors is not None:
            missing = set(pools) - set(sql_executors)
            if missing:
                raise ValueError(
                    f"Missing SQL executors for databases: {sorted(missing)}"
                )
            self.sql_executors = dict(sql_executors)
        else:
            self.sql_executors = {}
        # Default executor for backward compatibility / single-DB mode
        self.sql_executor = sql_executor

        # Circuit breaker for LLM calls (shared instance from server when provided)
        self.circuit_breaker = circuit_breaker or CircuitBreaker(
            failure_threshold=resilience_config.circuit_breaker_threshold,
            recovery_timeout=resilience_config.circuit_breaker_timeout,
        )

        # Rate limiters for query/LLM concurrency control (None = unlimited)
        self.rate_limiter = rate_limiter

        # Metrics collector for observability (None = metrics disabled)
        self.metrics = metrics

    def _resolve_executor(self, database_name: str) -> SQLExecutor:
        """Resolve the SQL executor for a specific database.

        Args:
            database_name: Resolved database name.

        Returns:
            SQLExecutor: The executor bound to the requested database's pool.

        Raises:
            DatabaseError: If no executor is configured for the database.

        Example:
            >>> executor = orchestrator._resolve_executor("analytics_db")
        """
        if self.sql_executors:
            executor = self.sql_executors.get(database_name)
            if executor is None:
                raise DatabaseError(
                    message=f"No SQL executor available for database '{database_name}'",
                    details={
                        "database": database_name,
                        "available_databases": sorted(self.sql_executors),
                    },
                )
            return executor
        # Legacy single-DB mode: single executor serves the only database
        return self.sql_executor

    async def execute_query(self, request: QueryRequest) -> QueryResponse:
        """Execute complete query flow from question to results.

        This method orchestrates the entire pipeline:
        1. Generate request_id for tracking and set tracing context
        2. Apply query rate limiting
        3. Resolve and validate database name
        4. Load schema from cache
        5. Generate and validate SQL with retry/backoff logic
        6. Execute SQL (if return_type == RESULT)
        7. Validate results (optional)
        8. Record metrics and return structured response

        Args:
            request: Query request containing question and parameters.

        Returns:
            QueryResponse: Complete response with SQL, results, or error information.
                The response includes request_id for end-to-end tracing.

        Example:
            >>> response = await orchestrator.execute_query(
            ...     QueryRequest(question="Count all users", return_type="result")
            ... )
            >>> if response.success:
            ...     print(f"Found {response.data.row_count} rows")
        """
        total_start = time.perf_counter()

        # Generate request_id and propagate through tracing context
        request_id = str(uuid.uuid4())
        async with request_context(request_id):
            response = await self._execute_query_impl(request, request_id, total_start)
            response.request_id = request_id
            return response

    async def _execute_query_impl(
        self,
        request: QueryRequest,
        request_id: str,
        total_start: float,
    ) -> QueryResponse:
        """Internal query flow implementation (runs inside request_context).

        Args:
            request: Query request containing question and parameters.
            request_id: Request ID for tracking.
            total_start: Start timestamp (perf_counter) for total duration metric.

        Returns:
            QueryResponse: Complete response with SQL, results, or error information.
        """
        logger.info(
            "Starting query execution",
            extra={"request_id": request_id, "question": request.question[:100]},
        )

        # Apply query rate limiting for the whole pipeline (fail-fast)
        if self.rate_limiter is not None:
            acquired = await self.rate_limiter.query_limiter.acquire(timeout=0)
            if not acquired:
                logger.warning(
                    "Query rate limit exceeded",
                    extra={"request_id": request_id},
                )
                self._record_metric_error(request, "rate_limited", total_start)
                return QueryResponse(
                    success=False,
                    generated_sql=None,
                    validation=None,
                    data=None,
                    error=ErrorDetail(
                        code=ErrorCode.RATE_LIMIT_EXCEEDED.value,
                        message="Too many concurrent queries, please retry later",
                        details={"limiter": "query"},
                    ),
                    confidence=0,
                    tokens_used=None,
                )

        try:
            return await self._process_query(request, request_id, total_start)
        finally:
            if self.rate_limiter is not None:
                self.rate_limiter.query_limiter.release()

    async def _process_query(
        self,
        request: QueryRequest,
        request_id: str,
        total_start: float,
    ) -> QueryResponse:
        """Core query pipeline: schema, generation, execution, validation.

        Args:
            request: Query request containing question and parameters.
            request_id: Request ID for tracking.
            total_start: Start timestamp (perf_counter) for total duration metric.

        Returns:
            QueryResponse: Complete response with SQL, results, or error information.
        """
        try:
            # Step 1: Resolve database name
            database_name = self._resolve_database(request.database)
            logger.debug(
                "Resolved database",
                extra={"request_id": request_id, "database": database_name},
            )

            # Step 2: Get schema from cache
            schema = self.schema_cache.get(database_name)
            if schema is None:
                # Schema not in cache, load it
                pool = self.pools.get(database_name)
                if pool is None:
                    raise DatabaseError(
                        message=f"No connection pool available for database '{database_name}'",
                        details={"database": database_name},
                    )
                try:
                    schema = await self.schema_cache.load(database_name, pool)
                except Exception as e:
                    raise SchemaLoadError(
                        message=f"Failed to load schema for database '{database_name}': {e!s}",
                        details={"database": database_name, "error": str(e)},
                    ) from e

            logger.debug(
                "Schema loaded",
                extra={
                    "request_id": request_id,
                    "database": database_name,
                    "tables": len(schema.tables),
                },
            )
            if self.metrics is not None:
                cache_age = self.schema_cache.get_cache_age(database_name)
                if cache_age is not None:
                    self.metrics.set_schema_cache_age(database_name, cache_age)

            # Step 3: Generate and validate SQL with retry logic
            generated_sql, validation_result, tokens_used = await self._generate_sql_with_retry(
                question=request.question,
                schema=schema,
                request_id=request_id,
            )

            # Step 4: If return_type is SQL, return early
            if request.return_type == ReturnType.SQL:
                logger.info(
                    "Returning SQL only",
                    extra={"request_id": request_id, "sql_length": len(generated_sql)},
                )
                self._record_query_metric(
                    status="success", database=database_name, total_start=total_start
                )
                return QueryResponse(
                    success=True,
                    generated_sql=generated_sql,
                    validation=validation_result,
                    data=None,
                    error=None,
                    confidence=100,
                    tokens_used=tokens_used,
                )

            # Step 5: Execute SQL on the resolved database's executor
            executor = self._resolve_executor(database_name)
            logger.debug(
                "Executing SQL",
                extra={
                    "request_id": request_id,
                    "database": database_name,
                },
            )
            start_time = self._get_current_time_ms()

            results, total_count = await executor.execute(generated_sql)

            execution_time_ms = self._get_current_time_ms() - start_time
            if self.metrics is not None:
                self.metrics.observe_db_query_duration(execution_time_ms / 1000.0)
                self._record_active_connections(database_name)
            logger.info(
                "SQL executed successfully",
                extra={
                    "request_id": request_id,
                    "row_count": total_count,
                    "execution_time_ms": execution_time_ms,
                },
            )

            # Step 6: Validate results (non-blocking, failures don't fail the request)
            result_confidence = await self._validate_results_safely(
                question=request.question,
                sql=generated_sql,
                results=results,
                row_count=total_count,
                request_id=request_id,
            )

            # Step 7: Build successful response
            query_result = QueryResult(
                columns=list(results[0].keys()) if results else [],
                rows=results,
                row_count=len(results),  # Limited row count (after max_rows applied)
                execution_time_ms=execution_time_ms,
            )

            self._record_query_metric(
                status="success", database=database_name, total_start=total_start
            )

            return QueryResponse(
                success=True,
                generated_sql=generated_sql,
                validation=validation_result,
                data=query_result,
                error=None,
                confidence=result_confidence,
                tokens_used=tokens_used,
            )

        except PgMcpError as e:
            # Handle known application errors
            logger.warning(
                "Query execution failed with known error",
                extra={
                    "request_id": request_id,
                    "error_code": e.code,
                    "error_message": str(e),
                },
            )
            self._record_metric_error(request, e.code.value, total_start)
            return QueryResponse(
                success=False,
                generated_sql=None,
                validation=None,
                data=None,
                error=ErrorDetail(
                    code=e.code.value,
                    message=e.message,
                    details=e.details,
                ),
                confidence=0,
                tokens_used=None,
            )
        except Exception as e:
            # Handle unexpected errors
            logger.exception(
                "Query execution failed with unexpected error",
                extra={"request_id": request_id},
            )
            self._record_metric_error(request, ErrorCode.INTERNAL_ERROR.value, total_start)
            return QueryResponse(
                success=False,
                generated_sql=None,
                validation=None,
                data=None,
                error=ErrorDetail(
                    code=ErrorCode.INTERNAL_ERROR.value,
                    message=f"Internal server error: {e!s}",
                    details={"error_type": type(e).__name__},
                ),
                confidence=0,
                tokens_used=None,
            )

    def _record_active_connections(self, database_name: str) -> None:
        """Record active connection gauge from the database pool.

        Args:
            database_name: Target database name.
        """
        pool = self.pools.get(database_name)
        if pool is None:
            return
        try:
            active = pool.get_size() - pool.get_idle_size()
        except Exception:  # pragma: no cover - pool stats are best-effort
            logger.debug("Failed to read pool stats", extra={"database": database_name})
            return
        self.metrics.set_db_connections_active(database_name, active)

    def _record_query_metric(
        self,
        status: str,
        database: str,
        total_start: float,
    ) -> None:
        """Record query request counter and total duration histogram.

        Args:
            status: Outcome label (success, error, rate_limited, ...).
            database: Target database name.
            total_start: Start timestamp (perf_counter).
        """
        if self.metrics is None:
            return
        self.metrics.increment_query_request(
            status=status, database=database
        )
        self.metrics.query_duration.observe(time.perf_counter() - total_start)

    def _record_metric_error(
        self,
        request: QueryRequest,
        status: str,
        total_start: float,
    ) -> None:
        """Record metrics for error outcomes, resolving database best-effort.

        Args:
            request: Original query request.
            status: Outcome label (error code or rate_limited).
            total_start: Start timestamp (perf_counter).
        """
        if self.metrics is None:
            return
        try:
            database = self._resolve_database(request.database)
        except PgMcpError:
            database = request.database or "unknown"
        self._record_query_metric(status=status, database=database, total_start=total_start)
        if status == "rate_limited":
            self.metrics.increment_sql_rejected(reason="rate_limited")

    def _resolve_database(self, database: str | None) -> str:
        """Resolve database name from request or auto-select.

        If database is specified, validate it exists.
        If not specified and only one database available, auto-select it.

        Args:
            database: Database name from request (optional).

        Returns:
            str: Resolved database name.

        Raises:
            DatabaseError: If database is invalid or cannot be auto-selected.

        Example:
            >>> name = orchestrator._resolve_database("mydb")  # Validates "mydb" exists
            >>> name = orchestrator._resolve_database(None)  # Auto-selects if only one DB
        """
        if database is not None:
            # Validate specified database exists
            if database not in self.pools:
                raise DatabaseError(
                    message=f"Database '{database}' not found",
                    details={
                        "requested_database": database,
                        "available_databases": list(self.pools.keys()),
                    },
                )
            return database

        # Auto-select if only one database available
        available_dbs = list(self.pools.keys())
        if len(available_dbs) == 0:
            raise DatabaseError(
                message="No databases configured",
                details={},
            )
        if len(available_dbs) == 1:
            return available_dbs[0]

        # Multiple databases, must specify
        raise DatabaseError(
            message="Multiple databases available, please specify which to query",
            details={"available_databases": available_dbs},
        )

    async def _generate_sql_with_retry(
        self,
        question: str,
        schema: Any,
        request_id: str,
    ) -> tuple[str, ValidationResult, int | None]:
        """Generate and validate SQL with retry logic on validation failures.

        This method implements a retry loop that:
        1. Checks circuit breaker state
        2. Generates SQL using LLM
        3. Validates the generated SQL
        4. On validation failure, retries with error feedback
        5. Records success/failure to circuit breaker

        Args:
            question: User's natural language question.
            schema: Database schema for context.
            request_id: Request ID for tracking.

        Returns:
            tuple: (generated_sql, validation_result, tokens_used)

        Raises:
            LLMError: If circuit breaker is open or generation fails.
            SecurityViolationError: If SQL fails validation after all retries.
            SQLParseError: If SQL cannot be parsed.

        Example:
            >>> sql, validation, tokens = await orchestrator._generate_sql_with_retry(
            ...     question="Count users",
            ...     schema=db_schema,
            ...     request_id="123",
            ... )
        """
        # Check circuit breaker
        if not self.circuit_breaker.allow_request():
            raise LLMError(
                message="SQL generation service is temporarily unavailable (circuit breaker open)",
                details={
                    "circuit_state": self.circuit_breaker.state,
                    "failure_count": self.circuit_breaker.failure_count,
                },
            )

        previous_sql: str | None = None
        error_feedback: str | None = None
        max_retries = self.resilience_config.max_retries
        retry_delay = self.resilience_config.retry_delay
        backoff_factor = self.resilience_config.backoff_factor
        tokens_used: int | None = None

        for attempt in range(max_retries + 1):
            try:
                # Apply exponential backoff before retry attempts
                if attempt > 0:
                    delay = retry_delay * (backoff_factor ** (attempt - 1))
                    logger.debug(
                        "Backing off before retry",
                        extra={
                            "request_id": request_id,
                            "attempt": attempt + 1,
                            "delay_seconds": delay,
                        },
                    )
                    await asyncio.sleep(delay)

                logger.debug(
                    "Generating SQL",
                    extra={
                        "request_id": request_id,
                        "attempt": attempt + 1,
                        "max_retries": max_retries + 1,
                    },
                )

                # Acquire LLM rate limiter slot around generation + validation (fail-fast)
                if self.rate_limiter is not None:
                    acquired = await self.rate_limiter.llm_limiter.acquire(timeout=0)
                    if not acquired:
                        raise RateLimitExceededError(
                            message="LLM rate limit exceeded, please retry later",
                            details={"limiter": "llm"},
                        )

                try:
                    llm_start = time.perf_counter()
                    generated_sql = await self.sql_generator.generate(
                        question=question,
                        schema=schema,
                        previous_attempt=previous_sql,
                        error_feedback=error_feedback,
                    )
                    if self.metrics is not None:
                        self.metrics.increment_llm_call(operation="generate_sql")
                        self.metrics.observe_llm_latency(
                            operation="generate_sql",
                            duration=time.perf_counter() - llm_start,
                        )
                finally:
                    if self.rate_limiter is not None:
                        self.rate_limiter.llm_limiter.release()

                # Note: tokens_used would come from OpenAI response metadata if available
                # For now, we don't extract it, but it can be added later

                logger.debug(
                    "SQL generated",
                    extra={
                        "request_id": request_id,
                        "sql_length": len(generated_sql),
                    },
                )

                # Validate SQL
                try:
                    self.sql_validator.validate_or_raise(generated_sql)
                except (SecurityViolationError, SQLParseError) as validation_error:
                    if self.metrics is not None:
                        reason = (
                            "security_violation"
                            if isinstance(validation_error, SecurityViolationError)
                            else "sql_parse_error"
                        )
                        self.metrics.increment_sql_rejected(reason=reason)
                    if attempt < max_retries:
                        # Record as failure and retry with feedback
                        logger.warning(
                            "SQL validation failed, retrying with feedback",
                            extra={
                                "request_id": request_id,
                                "attempt": attempt + 1,
                                "error": str(validation_error),
                            },
                        )
                        previous_sql = generated_sql
                        error_feedback = str(validation_error)
                        continue
                    else:
                        # Out of retries, record failure and raise
                        self.circuit_breaker.record_failure()
                        logger.error(
                            "SQL validation failed after all retries",
                            extra={
                                "request_id": request_id,
                                "attempts": attempt + 1,
                                "error": str(validation_error),
                            },
                        )
                        raise

                # Validation successful
                self.circuit_breaker.record_success()
                logger.info(
                    "SQL generated and validated successfully",
                    extra={
                        "request_id": request_id,
                        "attempts": attempt + 1,
                    },
                )

                # Build validation result
                validation_result = ValidationResult(
                    is_valid=True,
                    is_select=True,
                    allows_data_modification=False,
                    uses_blocked_functions=[],
                    error_message=None,
                )

                return generated_sql, validation_result, tokens_used

            except (LLMError, SecurityViolationError, SQLParseError):
                # Re-raise known errors
                raise
            except Exception as e:
                # Unexpected error during generation
                self.circuit_breaker.record_failure()
                logger.exception(
                    "Unexpected error during SQL generation",
                    extra={"request_id": request_id},
                )
                raise LLMError(
                    message=f"SQL generation failed unexpectedly: {e!s}",
                    details={"error_type": type(e).__name__},
                ) from e

        # Should not reach here, but just in case
        self.circuit_breaker.record_failure()
        raise LLMError(
            message="SQL generation failed after all retry attempts",
            details={"max_retries": max_retries},
        )

    async def _validate_results_safely(
        self,
        question: str,
        sql: str,
        results: list[dict[str, Any]],
        row_count: int,
        request_id: str,
    ) -> int:
        """Validate query results with error handling (non-blocking).

        This method attempts to validate results using LLM, but failures
        don't cause the overall query to fail. Returns a confidence score.

        Args:
            question: User's original question.
            sql: Generated SQL query.
            results: Query results.
            row_count: Total row count.
            request_id: Request ID for tracking.

        Returns:
            int: Confidence score (0-100). Returns 100 if validation disabled/fails.

        Example:
            >>> confidence = await orchestrator._validate_results_safely(
            ...     question="Count users",
            ...     sql="SELECT COUNT(*) FROM users",
            ...     results=[{"count": 42}],
            ...     row_count=1,
            ...     request_id="123",
            ... )
        """
        if not self.validation_config.enabled:
            return 100

        try:
            logger.debug(
                "Validating results",
                extra={"request_id": request_id},
            )

            validation_result = await self.result_validator.validate(
                question=question,
                sql=sql,
                results=results,
                row_count=row_count,
            )

            logger.info(
                "Result validation completed",
                extra={
                    "request_id": request_id,
                    "confidence": validation_result.confidence,
                    "is_acceptable": validation_result.is_acceptable,
                },
            )

            return validation_result.confidence

        except Exception as e:
            # Log but don't fail the query
            logger.warning(
                "Result validation failed, continuing with default confidence",
                extra={
                    "request_id": request_id,
                    "error": str(e),
                },
            )
            return 100  # Default to high confidence if validation fails

    @staticmethod
    def _get_current_time_ms() -> float:
        """Get current time in milliseconds.

        Returns:
            float: Current time in milliseconds since epoch.
        """
        return time.time() * 1000
