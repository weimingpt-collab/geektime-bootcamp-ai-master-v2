# TypeScript Backend Development Guidelines

## Toolchain & Build

- Always use TypeScript 5.7+ with `strict: true`, `noUncheckedIndexedAccess: true`, and `exactOptionalPropertyTypes: true` in tsconfig.json. Enable `verbatimModuleSyntax` for explicit import/export control.
- Enable `erasableSyntaxOnly: true` (TS 5.8+) when using `--isolatedDeclarations` for Node.js native TypeScript support (--experimental-strip-types).
- Use `--rewriteRelativeImportExtensions` (TS 5.7+) to write `.ts` imports that compile to `.js`: `import * as foo from "./foo.ts"` becomes `import * as foo from "./foo.js"`.
- Configure `target: "ES2024"` and `lib: ["ES2024"]` for modern Node.js 22+. Use `Uint8Array<ArrayBufferLike>` generic for SharedArrayBuffer compatibility.
- Always run build (`pnpm build`), tests (`pnpm test`), linter (`biome check` or `eslint --max-warnings 0`), and type-checker (`tsc --noEmit`) before finishing tasks.
- Use `pnpm` over `npm` for faster installs and strict dependency resolution. Run `pnpm audit` and `pnpm outdated` regularly to check for vulnerabilities.
- Configure `moduleResolution: "bundler"` or `"node16"` for Node.js projects. Use path aliases (`@/` for `src/`) in tsconfig and build config for clean imports.
- Use `tsx` for running TypeScript directly in development: `tsx src/index.ts`. Use `tsup` or `esbuild` for production builds (faster than tsc). Configure source maps for debugging.
- Enable `isolatedModules: true` for compatibility with fast transpilers. Enable `isolatedDeclarations: true` (TS 5.5+) for parallel declaration emit.
- Use Biome as primary linter/formatter (faster than ESLint + Prettier). Run `biome migrate eslint --write` to migrate existing ESLint configs. For ESLint, use v9+ flat config with `@typescript-eslint/strict-type-checked`.
- For monorepos, use pnpm workspaces with `workspace:*` protocol. Use Turborepo 2.0+ for build orchestration and caching. Structure as: `apps/`, `packages/`, `services/`.
- Pin Node.js version with `.nvmrc` or `package.json` engines field. Use LTS versions (22.x or 24.x). Use Docker for consistent environments: `FROM node:22-alpine`.
- Configure TypeScript with `skipLibCheck: true` for faster builds, `esModuleInterop: true` for CJS compatibility, `resolveJsonModule: true` for importing JSON configs.

## Error Handling

- Never throw raw strings or objects. Always throw Error instances with codes: `throw new AppError('USER_NOT_FOUND', 'User not found', { userId })`. Include error codes for client handling.
- Use discriminated unions for Result types in business logic: `type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E }`. Prefer over throwing in pure functions.
- Consider Effect-TS for complex applications requiring typed errors, dependency injection, and composable error handling:
  ```typescript
  import { Effect, Data } from "effect"
  class UserNotFound extends Data.TaggedError("UserNotFound")<{ userId: string }> {}
  const getUser = (id: string) => Effect.gen(function* () {
    const user = yield* fetchUser(id)
    if (!user) yield* new UserNotFound({ userId: id })
    return user
  })
  ```
- Implement custom error hierarchy extending Error: `class ValidationError extends Error { constructor(message: string, public readonly field: string, public readonly code: string) { super(message); this.name = 'ValidationError'; Error.captureStackTrace(this, this.constructor); } }`.
- Define domain-specific error types: `class DatabaseError`, `class AuthenticationError`, `class RateLimitError`. Include metadata for debugging: timestamp, request ID, user context.
- Use `cause` property for error chaining (Node 16.9+): `throw new Error('Failed to create user', { cause: originalError })`. Preserves full error context through stack.
- Implement global error handler middleware: Catch all errors, log with context, return sanitized responses. Never expose internal errors to clients: `{ code: 'INTERNAL_ERROR', message: 'An error occurred' }`.
- For HTTP APIs, map errors to status codes consistently: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 409 (conflict), 429 (rate limit), 500 (internal). Use custom error mapper.
- Validate external data at API boundaries with Zod schemas. Transform Zod errors into structured responses: `{ code: 'VALIDATION_ERROR', message: string, details: { field: string, message: string }[] }`.
- Implement retry logic with exponential backoff for transient failures (database deadlocks, external APIs). Use `p-retry` library with jitter: `retry(() => fetchData(), { retries: 3, factor: 2 })`.
- Use `never` return type for assertion functions: `function assertAuthenticated(user: User | null): asserts user is User { if (!user) throw new AuthError() }`. Narrows types after assertion.

## Async & Concurrency

- Always use `async/await` over raw Promises. Use `Promise.all()` for parallel execution: `const [users, posts] = await Promise.all([db.users.findMany(), db.posts.findMany()])`. Never sequential awaits for independent operations.
- Use `Promise.allSettled()` when you need all results regardless of failures. Use `Promise.race()` for timeout patterns: `Promise.race([fetchData(), timeout(5000)])`.
- Leverage Iterator Helpers (ES2024/TS 5.6+) for lazy data processing:
  ```typescript
  const results = users.values()
    .filter(u => u.isActive)
    .map(u => u.email)
    .take(10)
    .toArray()
  ```
- Implement proper cancellation with AbortController for HTTP requests, database queries: `const controller = new AbortController(); fetch(url, { signal: controller.signal }); setTimeout(() => controller.abort(), 5000)`.
- Use message queues (BullMQ, Bee-Queue) for background jobs and async processing. Define typed job payloads: `type EmailJob = { type: 'email'; to: string; template: string; data: Record<string, unknown> }`. Implement job retry and dead-letter queues.
- Organize system into subsystems using message-passing architecture. Use EventEmitter or custom event bus for internal events. For complex workflows, use state machines with XState.
- For CPU-intensive tasks, use worker threads (`node:worker_threads`). Communicate via `postMessage()` with typed messages. Use Piscina for worker pool management. Never block event loop.
- Avoid shared state between requests. Use request-scoped context with AsyncLocalStorage: `const requestContext = new AsyncLocalStorage<{ requestId: string; userId?: string }>()`. Access in nested functions without passing explicitly.
- Implement graceful shutdown: Listen for SIGTERM/SIGINT, stop accepting new connections, drain active requests, close database connections, flush logs. Use `@fastify/graceful-shutdown` or custom implementation.
- Use streaming for large payloads: Node.js streams, async iterators. Process data in chunks to avoid memory issues: `for await (const chunk of readStream) { await processChunk(chunk) }`.
- Handle uncaught errors: `process.on('uncaughtException')`, `process.on('unhandledRejection')`. Log error, clean up resources, gracefully exit. Use process managers (PM2, Kubernetes) for restart.
- Use connection pooling for databases (Prisma, Drizzle), Redis, HTTP clients. Configure pool size based on workload: Start with `max: 10`, tune based on monitoring.
- Implement circuit breakers for external dependencies using `opossum`. Open circuit after threshold failures, prevent cascading failures. Use fallback responses during circuit open.

## Type Design & API

- Use `interface` for object shapes that might be extended (DTOs, entities). Use `type` for unions, intersections, mapped types. Prefer `interface` for public APIs (better error messages).
- Leverage inferred type predicates (TS 5.5+): `const isNonNull = <T>(x: T | null): x is T => x !== null` - TypeScript now infers `x is T` automatically. Filter arrays cleanly: `users.filter(u => u !== null)` returns `User[]` not `(User | null)[]`.
- Define API request/response types separately from domain models: `type CreateUserRequest = { email: string; name: string }`, `type UserResponse = { id: string; email: string; name: string; createdAt: string }`. Never expose internal models directly.
- Use branded types for domain primitives: `type UserId = string & { readonly __brand: 'UserId' }; const makeUserId = (id: string): UserId => id as UserId`. Prevents mixing email with userId.
- Use Zod for runtime validation and type inference: `const CreateUserSchema = z.object({ email: z.string().email(), name: z.string().min(1) }); type CreateUserDto = z.infer<typeof CreateUserSchema>`. Single source of truth.
- Implement discriminated unions for polymorphic APIs: `type Event = { type: 'user.created'; userId: string } | { type: 'post.published'; postId: string }`. Use in event handlers, message queues.
- Use template literal types for API routes: `type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'; type ApiRoute = \`/api/\${string}\`; type Endpoint<M extends HttpMethod> = { method: M; path: ApiRoute }`.
- Define service interfaces with dependency injection in mind: `interface UserService { createUser(dto: CreateUserDto): Promise<User>; findById(id: UserId): Promise<User | null> }`. Easy to mock, test, replace implementations.
- Use generic constraints for type-safe query builders: `function where<T, K extends keyof T>(field: K, value: T[K]): Query<T>`. Ensures field exists and value matches type.
- Use utility types extensively: `Omit<User, 'password'>` for public user type, `Partial<User>` for update DTOs, `Pick<User, 'id' | 'email'>` for minimal representations.
- Implement builder pattern for complex objects: `class QueryBuilder<T> { where(field: keyof T, value: unknown): this; orderBy(field: keyof T): this; build(): Query<T> }`. Fluent API with type safety.
- Use const type parameters (TS 5.0+) for preserving literal types: `function createRoute<const T extends string>(path: T): Route<T>`. Useful for type-safe routing.
- Define database models with ORM types: For Prisma/Drizzle, use generated types. Always separate database models from API DTOs for loose coupling.
- Use `NoInfer<T>` (TS 5.4+) to prevent unwanted type inference in generics: `function createFSM<S extends string>(initial: NoInfer<S>, transitions: Record<S, S[]>)`.

## Web Frameworks

- Consider Hono for new projects: Ultrafast, works on all runtimes (Node.js, Bun, Deno, Cloudflare Workers, AWS Lambda), built-in RPC for type-safe APIs:
  ```typescript
  import { Hono } from 'hono'
  import { zValidator } from '@hono/zod-validator'
  const app = new Hono()
    .post('/users', zValidator('json', CreateUserSchema), async (c) => {
      const data = c.req.valid('json')
      return c.json({ id: '123', ...data }, 201)
    })
  export type AppType = typeof app  // Share with client for type-safe RPC
  ```
- Use Hono RPC client for type-safe API calls without code generation:
  ```typescript
  import { hc } from 'hono/client'
  import type { AppType } from './server'
  const client = hc<AppType>('http://localhost:3000/')
  const res = await client.users.$post({ json: { name: 'John', email: 'john@example.com' } })
  ```
- For Express/Fastify projects, use tRPC for end-to-end type safety without Hono migration.
- Use middleware composition for cross-cutting concerns: logging, auth, validation, error handling. Keep route handlers focused on business logic.

## Database & ORM

- Consider Drizzle ORM as modern Prisma alternative: SQL-like syntax, zero runtime overhead, better performance:
  ```typescript
  import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
  export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow()
  })
  // Type-safe queries
  const result = await db.select().from(users).where(eq(users.email, email))
  ```
- Use prepared statements for repeated queries (both Prisma and Drizzle support this):
  ```typescript
  const prepared = db.select().from(users).where(eq(users.id, sql.placeholder('id'))).prepare('get_user')
  const user = await prepared.execute({ id: 123 })
  ```
- For Prisma: Use generated types, relations, transactions, middleware for business logic. Run `prisma generate` after schema changes.
- Implement database migrations: Use Prisma Migrate, Drizzle Kit, or Knex. Version migrations, test rollbacks. Never modify production schema manually.
- Handle pagination with cursor-based approach for large datasets: `{ data: T[], nextCursor: string | null, hasMore: boolean }`. Encode cursor: `Buffer.from(JSON.stringify({ id, createdAt })).toString('base64url')`.

## Safety & Security

- Validate and sanitize all external input at API boundaries. Use Zod schemas with transforms: `z.string().trim().toLowerCase()`. Never trust client input, query params, headers.
- Implement authentication with JWT or session tokens. Store tokens in httpOnly, secure, SameSite=Strict cookies. For APIs, use Authorization header: `Bearer <token>`. Validate signature and expiration.
- Use bcrypt or argon2 for password hashing. Never store plain text passwords. Use high cost factor: `bcrypt.hash(password, 12)` or `argon2.hash(password, { timeCost: 3, memoryCost: 65536 })`.
- Implement CSRF protection for state-changing operations. Use SameSite cookies or CSRF tokens. For Express, use `csurf` middleware. For Fastify, use `@fastify/csrf-protection`.
- Configure CORS properly: Allow only trusted origins. Never use `*` with credentials. Set specific origins: `{ origin: ['https://app.example.com'], credentials: true }`. Use `cors` middleware.
- Implement rate limiting per IP and per user. Use Redis-backed rate limiters: `express-rate-limit` with Redis store, or `@fastify/rate-limit`. Apply different limits to sensitive endpoints (login, signup).
- Prevent injection attacks: Use parameterized queries for SQL (never string concatenation). Use ORM query builders (Prisma, Drizzle). Validate input against allowlist patterns.
- Sanitize output for logs and responses. Never log passwords, tokens, credit cards. Implement redaction: `logger.info({ user: redact(user, ['password', 'ssn']) })`. Use `fast-redact` library.
- Implement Content Security Policy for served HTML: `helmet` middleware sets security headers. Configure CSP, HSTS, X-Frame-Options, X-Content-Type-Options.
- Use `crypto.timingSafeEqual()` for comparing secrets (tokens, signatures). Prevents timing attacks. For crypto operations, use `node:crypto` module, never custom implementations.
- Implement secure session management: Rotate session IDs after login. Expire sessions after inactivity. Store sessions in Redis with TTL. Use `express-session` or `@fastify/secure-session`.
- Validate file uploads: Check file type (magic bytes, not extension), size limits, scan for malware. Store uploads outside web root. Use signed URLs for access (S3, CloudFront).
- Audit dependencies with `pnpm audit`, `npm audit`, or Socket.dev. Enable Dependabot/Renovate. Review new dependencies for supply chain attacks. Use `socket npm install` for security analysis.
- Implement security headers: Use `helmet` middleware. Enable HSTS, CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin.

## Serialization & Data

- Use Zod for runtime validation of API requests and external data: `const parsed = CreateUserSchema.parse(req.body)`. Throws on validation failure with detailed errors.
- Transform Zod validation errors into user-friendly API responses: `.safeParse()` returns Result type. Map errors: `error.issues.map(i => ({ field: i.path.join('.'), message: i.message }))`.
- Serialize dates as ISO 8601 strings in JSON responses: `JSON.stringify({ createdAt: new Date().toISOString() })`. Define serializers for custom types: Use `superjson` for Date, Map, Set, BigInt, RegExp.
- Implement DTO transformers: Map database models to API responses. Exclude sensitive fields (password, internal IDs). Use manual mappers: `function toUserResponse(user: User): UserResponse { return { id: user.id, email: user.email } }`.
- Handle pagination with cursor-based approach for large datasets: `{ data: T[], nextCursor: string | null, hasMore: boolean }`. Encode cursor: `Buffer.from(JSON.stringify({ id, createdAt })).toString('base64url')`.
- Use JSON Schema for API documentation and validation. Generate types from schema with `json-schema-to-typescript`. Or use Zod and generate JSON Schema: `zodToJsonSchema()`.
- Implement ETags for cache validation: Hash response body, set ETag header. Check `If-None-Match`, return 304 if match. Use `etag` middleware or custom implementation.
- Use Protocol Buffers for gRPC services or binary APIs. Define `.proto` schemas, generate TypeScript types with `ts-proto`. Smaller payloads, faster serialization than JSON.
- Handle BigInt serialization: JSON.stringify doesn't support BigInt. Use custom replacer: `JSON.stringify(obj, (key, value) => typeof value === 'bigint' ? value.toString() : value)` or use `json-bigint` library.
- Implement database query result caching: Use Redis for frequently accessed data. Define TTL per entity type. Invalidate on updates: `await redis.del(\`user:\${userId}\`)`.

## Testing

- Use Vitest 2.0+ over Jest (faster, native ESM, better TypeScript support). Configure with `vitest.config.ts`. Run with `vitest run` for CI, `vitest` for watch mode.
- Use Vitest workspaces for multi-project testing (unit, integration, browser):
  ```typescript
  export default defineConfig({
    test: {
      projects: [
        { test: { name: 'unit', include: ['tests/unit/**/*.test.ts'], environment: 'node' } },
        { test: { name: 'integration', include: ['tests/integration/**/*.test.ts'] } },
      ]
    }
  })
  ```
- Write unit tests colocated with code: `userService.test.ts` next to `userService.ts`. Use descriptive test names: `it('should throw ValidationError when email is invalid', async () => {})`. Follow AAA pattern.
- Write integration tests in `tests/integration/`. Test API endpoints end-to-end with real database (use test database). Use native fetch or supertest.
- Use test fixtures for database data: Create factory functions: `function createUser(overrides?: Partial<User>): Promise<User>`. Use `@faker-js/faker` for generating realistic test data.
- Mock external dependencies (third-party APIs, email services) with MSW (Mock Service Worker) for HTTP or `vi.mock()` for modules. Test error scenarios: network failures, timeouts, rate limits.
- Test database interactions with test containers (Testcontainers) or in-memory databases (better-sqlite3). Isolate tests: Clear database between tests or use transactions.
- Test authentication and authorization: Mock auth tokens, test protected endpoints return 401/403. Test role-based access.
- Test error handling explicitly: Verify error codes, status codes, error messages. Use `expect().rejects.toThrow()` for async errors. Test validation errors return proper structure.
- Use Vitest Browser Mode with Playwright for component/E2E tests:
  ```typescript
  import { playwright } from '@vitest/browser-playwright'
  export default defineConfig({
    test: { browser: { provider: playwright(), enabled: true, instances: [{ browser: 'chromium' }] } }
  })
  ```
- Aim for 80%+ coverage on business logic. Use `v8` coverage in Vitest: `vitest --coverage`. Focus on critical paths: auth, payments, data mutations.
- Test concurrency issues: Race conditions, deadlocks. Use Promise.all to trigger parallel operations. Verify proper locking or optimistic locking.

## Logging & Observability

- Use Pino for structured logging (fastest JSON logger for Node.js). Configure with `pino({ level: process.env.LOG_LEVEL || 'info', formatters: { level: (label) => ({ level: label }) } })`. Use pretty printing in dev: `pino-pretty`.
- Implement different log levels: `fatal` for crashes, `error` for errors requiring attention, `warn` for degraded state, `info` for important events (API calls, user actions), `debug` and `trace` for diagnostics.
- Add request context to all logs: request ID, user ID, session ID. Use AsyncLocalStorage to propagate context: `const storage = new AsyncLocalStorage<Context>()`. Create middleware to inject context.
- Log structured data with fields: `logger.info({ userId, action: 'user.created', duration: 123 }, 'User created successfully')`. Enables querying logs by fields. Never concatenate strings.
- Integrate error tracking with Sentry, Bugsnag, or Rollbar. Initialize with DSN. Capture errors with context. Set user and tags for debugging.
- Implement distributed tracing with OpenTelemetry. Instrument with auto-instrumentation: `@opentelemetry/auto-instrumentations-node`. Export traces to Jaeger, Zipkin, Datadog.
- Log all API requests/responses in development. Redact sensitive data in production logs. Use `fast-redact` for high-performance redaction.
- Monitor application metrics: Request rate, error rate, latency (p50, p95, p99), active connections. Use Prometheus with `prom-client`.
- Implement health checks: `/health` endpoint returning 200 when healthy. Check database connectivity, Redis, external dependencies. Use for load balancer health checks, Kubernetes probes.
- Set up alerting: Error rate spikes, high latency, failed health checks. Define SLOs and alert on violations.
- Use structured logs for audit trail: Log all state-changing operations with actor, timestamp, old/new values. Store in separate audit log.

## Performance

- Profile before optimizing: Use Node.js built-in profiler (`node --prof`), Chrome DevTools (inspect mode), or `clinic.js` for flame graphs, heap analysis.
- Optimize database queries: Use indexes on frequently queried fields. Avoid N+1 queries (use joins or dataloader). Use `EXPLAIN` to analyze query plans. Add pagination.
- Implement caching strategy: Cache frequently accessed data in Redis with TTL. Use cache-aside pattern. Define cache key convention: `entity:id`.
- Use connection pooling: Configure database pool size based on workload. Monitor pool exhaustion.
- Optimize JSON serialization: Use `fast-json-stringify` with JSON Schema for 2-3x faster serialization. For large responses, use streaming.
- Implement response compression: Use `compression` middleware (gzip, brotli). Skip for already-compressed content.
- Use clustering for CPU utilization: Use `cluster` module or deploy multiple instances behind load balancer.
- Optimize cold starts: Minimize startup work. Lazy load heavy dependencies. For serverless, reduce bundle size.
- Implement request coalescing: Deduplicate concurrent identical requests.
- Use async iterators for streaming large datasets. Process in chunks to avoid memory issues.
- Monitor event loop lag: Alert when lag exceeds threshold (indicates blocked event loop).
- Optimize Docker images: Use multi-stage builds, alpine base, copy only production dependencies.

## Dependencies

- Minimize dependencies: Each adds bundle size, security risk, maintenance burden. Implement simple utilities instead of adding libraries.
- Audit dependencies before adding: Check npm downloads, GitHub stars, last update, security advisories. Use `npx socket npm install <package>` for security analysis.
- Pin exact versions in package.json for applications: Use `"hono": "4.6.0"` not `"^4.6.0"`. Use Renovate or Dependabot for automated updates.
- Prefer well-maintained packages with TypeScript support. Check for built-in types or `@types/*` packages.
- Use workspace dependencies in monorepos: `workspace:*` for internal packages.
- Prefer pure ESM packages for modern Node.js. Check `package.json` for `"type": "module"`.
- Replace heavy dependencies with lighter alternatives: Use `pino` over `winston`, `ky` over `axios`, `hono` over `express`.
- Keep dependencies updated: Run `pnpm update` monthly. Review changelogs before major updates.
- Remove unused dependencies: Run `depcheck` to find unused deps.
- Lock versions with `pnpm-lock.yaml`. Use `pnpm install --frozen-lockfile` in CI/production.

## Documentation

- Write TSDoc comments for exported functions, classes, types: `/** Creates a new user. @param dto - User creation data. @returns Created user with generated ID. @throws {ValidationError} When email is invalid. */`.
- Document API endpoints with OpenAPI/Swagger: Use `@hono/swagger-ui`, `@fastify/swagger`, or `swagger-jsdoc`. Generate from Zod schemas with `@asteasolutions/zod-to-openapi`.
- Document environment variables in `.env.example` with comments. Use `dotenv` for loading, `@t3-oss/env-core` or `envalid` for type-safe validation.
- Generate API client types from OpenAPI spec using `openapi-typescript`. Share types between backend and frontend.
- Write README.md for services/packages: Include installation, configuration, API endpoints, examples.
- Document architecture decisions with ADRs in `docs/adr/`. Use template: Title, Status, Context, Decision, Consequences.
- Add inline comments for complex business logic only. Comment "why" not "what".
- Document error codes in centralized location. Include in API documentation.
- Create runbooks for operational procedures: Deployment, rollback, migrations, incident response.

## Code Style

- Use functional programming principles: Pure functions, immutability, composition. Use `map/filter/reduce` over `for` loops modifying arrays. Use spread operator: `{ ...obj, key: newValue }`.
- Follow naming conventions: `camelCase` for variables/functions, `PascalCase` for types/interfaces/classes, `UPPER_SNAKE_CASE` for constants. Use descriptive names.
- Keep functions small and focused: <50 lines ideally. Single responsibility. Use early returns: `if (!user) return null;`.
- Order imports consistently: Node.js built-ins first (`node:fs`), external dependencies second, internal modules third (`@/services/*`), types fourth. Use Biome or eslint-plugin-import for auto-sorting.
- Use const by default, let only when reassignment needed. Never use var. Use destructuring: `const { id, email } = user`.
- Prefer arrow functions for callbacks. Use function declarations for top-level exported functions.
- Use template literals for string interpolation: `` `User ${id} not found` ``.
- Avoid nested ternaries. Use if/else or extract to functions. Max one ternary per line.
- Use optional chaining: `user?.profile?.avatar`. Use nullish coalescing: `value ?? defaultValue`.
- Export functions as named exports. Better for tree-shaking, refactoring. Use default exports sparingly.
- Use trailing commas in multi-line arrays, objects, function parameters. Biome/Prettier enforces this.
- Organize files consistently: Imports -> Constants -> Types -> Functions -> Exports.
- Use async/await consistently. Never mix promises and callbacks. Handle errors with try/catch at boundaries.
- Prefer composition over inheritance. Use dependency injection for testability. Define interfaces for services.
