# TypeScript Application Development Guidelines

## Toolchain & Build

- Always use TypeScript 5.7+ with `strict: true`, `noUncheckedIndexedAccess: true`, and `exactOptionalPropertyTypes: true` in tsconfig.json. Enable `verbatimModuleSyntax` for explicit import/export control.
- Always run build (`npm run build` or `pnpm build`), tests (`npm test`), linter (`eslint --max-warnings 0`), and type-checker (`tsc --noEmit`) before finishing tasks.
- Use Vite for modern apps (faster HMR, native ESM). Use Next.js 15+ for SSR/SSG. Use Webpack 5+ only for legacy projects. Always configure source maps for production debugging.
- Use ESLint 9+ with flat config (`eslint.config.js`). Enable `@typescript-eslint/strict-type-checked` ruleset. Use `typescript-eslint` v8+ parser and plugin.
- Use Prettier 3+ with `printWidth: 100`, `semi: false`, `singleQuote: true`, `trailingComma: 'all'`. Run via `eslint-plugin-prettier` to avoid conflicts.
- Use `pnpm` over `npm` for faster installs and strict dependency resolution. Use workspace protocol (`workspace:*`) for monorepos. Run `pnpm audit` and `pnpm outdated` regularly.
- Configure TypeScript `moduleResolution: "bundler"` for Vite/Webpack projects. Use path aliases (`@/` for `src/`) in tsconfig and bundler config for clean imports.
- Use `tsx` or `ts-node` with `--loader` flags for running TypeScript scripts. Never use `ts-node` without proper ESM configuration in modern projects.
- Enable `isolatedModules: true` to ensure compatibility with transpilers like esbuild and SWC. Avoid const enums and namespace merging patterns.
- Use Biome as alternative to ESLint/Prettier for 100x faster linting and formatting. Configure `.biome.json` with strict rules for production projects.

## Error Handling

- Never throw raw strings or objects. Always throw Error instances with descriptive messages and error codes: `throw new AppError('USER_NOT_FOUND', 'User not found', { userId })`.
- Use discriminated unions for Result types: `type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E }`. Prefer this over throwing in pure functions.
- Implement custom error classes extending Error with proper prototype chain: `class ValidationError extends Error { constructor(message: string, public field: string) { super(message); this.name = 'ValidationError'; Object.setPrototypeOf(this, ValidationError.prototype); } }`.
- Use React Error Boundaries for component error handling. Create typed error boundary with `react-error-boundary` library: `<ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>`.
- Catch async errors with try/catch in async functions. Never leave promises without `.catch()` or `try/catch`. Use `Promise.allSettled()` for parallel operations needing individual error handling.
- Validate external data at boundaries using Zod schemas. Transform Zod errors into user-friendly messages: `zodSchema.safeParse(data)` returns discriminated union for type-safe error handling.
- Use `cause` property in Error constructor for error chaining (Node 16.9+, modern browsers): `new Error('Failed to load user', { cause: originalError })`. Preserve stack traces when wrapping errors.
- For API errors, create typed error responses: `{ code: 'VALIDATION_ERROR', message: string, details?: Record<string, string[]> }`. Never expose internal error details to clients.
- Use `never` return type for functions that always throw: `function assertNever(x: never): never { throw new Error('Unexpected value: ' + x) }`. Useful for exhaustive switch checks.
- Implement exponential backoff for retrying failed operations. Use libraries like `p-retry` or `@opentelemetry/instrumentation-http` for automatic retry with jitter.

## Async & Concurrency

- Always use `async/await` over raw Promises. Chain with `Promise.all()` for parallel execution, never sequential awaits for independent operations: `const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()])`.
- Use `Promise.allSettled()` when you need all results regardless of individual failures. Use `Promise.race()` for timeout patterns: `Promise.race([fetchData(), timeout(5000)])`.
- Implement proper cancellation with AbortController: `const controller = new AbortController(); fetch(url, { signal: controller.signal }); controller.abort()`. Clean up on unmount in React.
- Use TanStack Query (React Query) v5+ for server state management. Never implement custom data fetching with useState/useEffect. Configure `staleTime`, `cacheTime`, and `retry` per query requirements.
- For React 19, use `use()` hook for reading Promises in render: `const data = use(promise)`. Combine with Suspense boundaries for declarative loading states. Throw promises for Suspense, throw errors for Error Boundaries.
- Implement request deduplication for concurrent identical requests. TanStack Query handles this automatically. For custom fetchers, use Map-based promise caching with request key.
- Use Web Workers for CPU-intensive tasks (data processing, image manipulation). Communicate via `postMessage()` with typed messages using discriminated unions. Consider Comlink for RPC-style worker APIs.
- Avoid race conditions in React with cleanup functions: `useEffect(() => { let cancelled = false; fetchData().then(data => { if (!cancelled) setState(data) }); return () => { cancelled = true } }, [])`.
- Use `queueMicrotask()` for scheduling tasks after current event loop. Use `requestIdleCallback()` for non-critical work during browser idle time. Use `requestAnimationFrame()` for animations.
- For concurrent React features (React 18+), wrap updates in `startTransition()` for non-urgent updates. Use `useDeferredValue()` for debouncing expensive re-renders. Enable concurrent rendering in root: `createRoot(el).render(<App />)`.
- Implement optimistic updates with TanStack Query mutations: `useMutation({ mutationFn, onMutate: async (newData) => { await queryClient.cancelQueries({ queryKey }); const prev = queryClient.getQueryData(queryKey); queryClient.setQueryData(queryKey, optimisticData); return { prev } } })`.

## Type Design & API

- Use `interface` for object shapes that might be extended. Use `type` for unions, intersections, mapped types, and primitives. Prefer `interface` for public APIs (better error messages, faster compilation).
- Use branded types for nominal typing: `type UserId = string & { readonly __brand: 'UserId' }; const makeUserId = (id: string): UserId => id as UserId`. Prevents mixing semantically different strings.
- Use const type parameters (TS 5.0+) for preserving literal types: `function identity<const T>(value: T): T`. Useful for tuple types and object literals requiring exact types.
- Implement builder pattern with fluent interfaces: Return `this` from methods. Use `as const` for literal arrays/objects. Consider typed-builder libraries like `ts-belt` or custom implementations.
- Use `satisfies` operator (TS 4.9+) for type checking without widening: `const config = { port: 3000 } satisfies Config`. Preserves literal types while ensuring type conformance.
- Use template literal types for string validation: `type HttpMethod = 'GET' | 'POST'; type Endpoint = \`/api/\${string}\`; type Route<M extends HttpMethod> = \`\${M} \${Endpoint}\``.
- Implement discriminated unions with `type` field for state machines: `type State = { type: 'idle' } | { type: 'loading' } | { type: 'success'; data: T } | { type: 'error'; error: Error }`. Use in reducer patterns.
- Use utility types extensively: `Partial<T>`, `Required<T>`, `Readonly<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`, `NonNullable<T>`, `ReturnType<F>`, `Parameters<F>`, `Awaited<T>`.
- Use `unknown` for truly unknown data (not `any`). Use type guards for narrowing: `function isUser(x: unknown): x is User`. Use `as const` assertions for readonly deeply nested types.
- Avoid function overloads unless necessary. Prefer union types or generic constraints. If using overloads, provide implementation signature: `function fn(x: string): string; function fn(x: number): number; function fn(x: string | number): string | number { ... }`.
- Use generic constraints for bounded polymorphism: `function prop<T, K extends keyof T>(obj: T, key: K): T[K]`. Use `extends` for conditional types: `type IsString<T> = T extends string ? true : false`.
- Leverage TypeScript 5.x features: decorators (stage 3 proposal support), `using` declarations for explicit resource management, `const` type parameters, improved inference for `this`, enum improvements with union-like behavior.

## Safety & Security

- Sanitize all user input before rendering in React. Use DOMPurify for HTML sanitization: `<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userHtml) }} />`. Never use `dangerouslySetInnerHTML` with unsanitized content.
- Implement Content Security Policy (CSP) headers: `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:`. Use nonces for inline scripts/styles.
- Never store sensitive data (tokens, passwords) in localStorage. Use httpOnly, secure, SameSite=Strict cookies for authentication tokens. For client-side tokens, use memory storage with session persistence.
- Validate all form inputs with Zod schemas on both client and server. Never trust client-side validation alone. Use `zod-form-data` for FormData validation in server actions.
- Implement CSRF protection for state-changing operations. Use SameSite cookies or CSRF tokens. For Next.js, use built-in CSRF protection with `next-csrf` or middleware.
- Escape user content in dynamic imports and URLs: Use `encodeURIComponent()` for query parameters. Validate URLs before redirects to prevent open redirect vulnerabilities: Check against allowlist or use relative URLs.
- Use Subresource Integrity (SRI) for CDN resources: `<script src="cdn.com/lib.js" integrity="sha384-..." crossorigin="anonymous">`. Generate with `openssl dgst -sha384 -binary file.js | openssl base64 -A`.
- Implement rate limiting on API routes. Use `express-rate-limit` or Next.js middleware. Apply exponential backoff on client for retries. Log excessive requests for security monitoring.
- Use `crypto.subtle` for client-side cryptography (Web Crypto API). Never implement custom crypto. For key derivation, use PBKDF2 with high iteration count (100k+) or Argon2 (server-side).
- Audit dependencies regularly: `pnpm audit`, `npm audit`, or use Snyk/Socket.dev. Enable Dependabot/Renovate for automated security updates. Review supply chain with `socket` CLI before adding dependencies.
- Implement proper CORS configuration: Allow only trusted origins. Use credentials: true with explicit origin (not `*`). For Next.js API routes, configure in next.config.js or middleware.

## Serialization & Data

- Use Zod for runtime type validation and parsing. Define schemas colocated with types: `const UserSchema = z.object({ id: z.string().uuid(), email: z.string().email(), name: z.string().min(1) }); type User = z.infer<typeof UserSchema>`.
- Validate API responses immediately: `const result = UserSchema.safeParse(await response.json()); if (!result.success) throw new ValidationError(result.error)`. Use `.parse()` to throw on failure, `.safeParse()` for Result-like return.
- Use Zod transforms for data normalization: `z.string().transform(s => s.trim().toLowerCase())`. Use refinements for complex validation: `.refine(val => val.age >= 18, { message: 'Must be 18+' })`.
- Serialize dates as ISO 8601 strings in JSON: `JSON.stringify({ date: new Date().toISOString() })`. Parse back with `new Date(isoString)`. Use Zod coercion: `z.coerce.date()` for automatic parsing.
- Use superjson or devalue for serializing complex types (Date, RegExp, Map, Set, BigInt, undefined) in Next.js server components or tRPC. Regular `JSON.stringify()` loses these types.
- Implement custom JSON serialization with `toJSON()` method for classes: `class User { toJSON() { return { id: this.id, email: this.email } } }`. Prevents accidental leakage of sensitive properties.
- Use `JSON.parse()` reviver for custom deserialization: `JSON.parse(str, (key, value) => key === 'date' ? new Date(value) : value)`. Useful for automatic type coercion from APIs.
- Handle pagination with cursor-based approach for large datasets: `{ data: T[], nextCursor: string | null }`. Use Relay-style connections for GraphQL. Avoid offset-based pagination at scale.
- Use Protocol Buffers (protobuf) for binary serialization in performance-critical applications. Use `protobuf.js` or `ts-proto` for TypeScript types. Smaller payload size and faster parsing than JSON.
- Implement GraphQL with typed operations using `@graphql-codegen/cli`. Generate TypeScript types from schema and queries. Use fragments for reusable selections. Consider TanStack Query integration for caching.

## Testing

- Use Vitest over Jest for modern projects (faster, native ESM, Vite integration). Configure with `vitest.config.ts`. Use `@vitest/ui` for interactive test UI. Run with `vitest --coverage` for coverage reports.
- Write unit tests colocated with code: `Button.test.tsx` next to `Button.tsx`. Use descriptive test names: `it('should disable button when loading prop is true', () => {})`. Follow AAA pattern: Arrange, Act, Assert.
- Use React Testing Library for component tests. Never test implementation details (state, refs). Test user behavior: `const button = screen.getByRole('button', { name: /submit/i }); await user.click(button); expect(screen.getByText(/success/i)).toBeInTheDocument()`.
- Use `@testing-library/user-event` v14+ over `fireEvent`. Simulates real user interactions with timing and event propagation: `const user = userEvent.setup(); await user.type(input, 'hello')`.
- Mock API calls with MSW (Mock Service Worker). Define handlers: `const handlers = [http.get('/api/user', () => HttpResponse.json({ id: '1' }))]`. Works in both tests and browser for development.
- Use Playwright or Cypress for E2E tests. Prefer Playwright (faster, better TypeScript support, multi-browser). Write tests with `test()` and `expect()` from `@playwright/test`. Use Page Object Model for maintainability.
- Test error states explicitly: Verify error messages, error boundaries, fallback UI. Use `expect().rejects.toThrow()` for async errors. Mock failed API responses: `http.get('/api/user', () => HttpResponse.error())`.
- Use snapshot tests sparingly (only for complex rendered output). Use inline snapshots for small outputs: `expect(result).toMatchInlineSnapshot('"expected value"')`. Update with `-u` flag when intentional changes occur.
- Test hooks with `renderHook()` from React Testing Library: `const { result, rerender } = renderHook(() => useCounter()); act(() => result.current.increment()); expect(result.current.count).toBe(1)`.
- Aim for 80%+ coverage on critical paths (authentication, payments, data mutations). Use `v8` coverage provider in Vitest. Generate reports with `vitest --coverage --reporter=html`. Ignore trivial code with `/* v8 ignore next */`.
- Test accessibility with `@axe-core/react` or `jest-axe`. Add to test utils: `await expect(container).toHaveNoViolations()`. Test keyboard navigation, ARIA attributes, screen reader announcements.
- Use property-based testing with `fast-check` for complex logic: `fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => add(a, b) === add(b, a)))`. Finds edge cases automatically.

## Logging & Observability

- Use structured logging with Pino (Node.js) or browser console with typed wrapper. Never use raw `console.log()` in production. Create logger utility: `const logger = { info: (msg, meta) => console.log(JSON.stringify({ level: 'info', msg, ...meta, timestamp: Date.now() })) }`.
- Implement different log levels: ERROR for errors requiring attention, WARN for degraded state, INFO for important events (user actions, API calls), DEBUG for diagnostic info. Configure level via environment variable.
- Add request context to logs: Request ID, user ID, session ID. Use AsyncLocalStorage (Node.js) or React Context for propagating context through call stack without explicit passing.
- Integrate error tracking with Sentry, Bugsnag, or Rollbar. Initialize with `Sentry.init()`. Set context: `Sentry.setUser()`, `Sentry.setTag()`. Capture errors: `Sentry.captureException(error)`. Use breadcrumbs for debugging: `Sentry.addBreadcrumb()`.
- Implement performance monitoring with Web Vitals: Track LCP (Largest Contentful Paint), FID (First Input Delay), CLS (Cumulative Layout Shift). Use `web-vitals` library: `onCLS(sendToAnalytics)`. Send to analytics or RUM service.
- Use OpenTelemetry for distributed tracing. Instrument with `@opentelemetry/instrumentation-fetch` for browser, `@opentelemetry/instrumentation-http` for Node.js. Export traces to Jaeger, Zipkin, or cloud providers.
- Log API requests/responses in development. Redact sensitive data (tokens, passwords) in logs. Use `@tanstack/query-devtools` for debugging React Query state.
- Monitor bundle size with `bundlesize` or `size-limit` in CI. Fail builds exceeding thresholds. Use `webpack-bundle-analyzer` or `rollup-plugin-visualizer` to identify large dependencies.
- Implement feature flags with LaunchDarkly, Flagsmith, or simple config service. Track flag evaluations in logs. Use for gradual rollouts and A/B testing.
- Set up Real User Monitoring (RUM) with Datadog, New Relic, or Google Analytics. Track page views, user flows, errors, performance metrics. Set up alerts for error rate spikes or performance degradation.

## Performance

- Profile with Chrome DevTools: Performance tab for runtime analysis, Coverage tab for unused code, Lighthouse for holistic audit. Use React DevTools Profiler for component render analysis.
- Optimize Core Web Vitals: LCP <2.5s (lazy load images, preload critical resources), FID <100ms (minimize JS, code split), CLS <0.1 (reserve space for dynamic content, avoid layout shifts).
- Use `React.memo()` for expensive components that receive same props frequently. Use `useMemo()` for expensive calculations. Use `useCallback()` for function props passed to memoized children. Profile before optimizing.
- Implement virtualization for long lists with `@tanstack/react-virtual` or `react-window`. Render only visible items. Use fixed item heights for best performance. Consider infinite scroll for better UX.
- Optimize images: Use WebP/AVIF formats. Generate responsive images with `next/image` or `vite-imagetools`. Lazy load below-the-fold images: `loading="lazy"`. Use BlurHash or LQIP for placeholders.
- Code split by route with dynamic imports: `const Page = lazy(() => import('./Page'))`. Split large dependencies: `const lodash = await import('lodash')`. Use Suspense for loading states.
- Reduce bundle size: Tree-shake with ESM imports. Avoid default exports for better tree-shaking. Use `import()` for conditional imports. Replace Moment.js with date-fns or Day.js (smaller). Use lodash-es and import specific functions.
- Prefetch critical resources: `<link rel="preload" as="script" href="critical.js">`. Prefetch next pages: `<link rel="prefetch" href="/next-page">`. Use Next.js `<Link prefetch>` for automatic prefetching.
- Optimize React rendering: Lift state down to minimize re-renders. Use context sparingly (splits component tree). Use state colocation. Avoid creating objects/arrays in render: `style={{ margin: 10 }}` creates new object every render.
- Use Web Workers for heavy computations. Use WebAssembly for CPU-intensive algorithms (image processing, parsing). Use Service Workers for offline support and caching strategies.
- Implement request deduplication and caching with TanStack Query. Set appropriate `staleTime` and `gcTime`. Use query invalidation strategically. Prefetch queries on hover: `queryClient.prefetchQuery()`.
- Monitor runtime performance with `performance.mark()` and `performance.measure()`: `performance.mark('start'); doWork(); performance.mark('end'); performance.measure('work', 'start', 'end')`. Send measurements to analytics.

## Dependencies

- Minimize dependencies: Each adds bundle size, security risk, maintenance burden. Evaluate necessity before adding. Consider implementing simple utilities instead of adding library (e.g., debounce function vs lodash).
- Audit dependencies before adding: Check npm downloads, GitHub stars, last update date, open issues, security advisories. Use `npx socket npm install <package>` for security analysis. Avoid packages with suspicious code.
- Pin exact versions in package.json for applications: Use `"react": "18.2.0"` not `"^18.2.0"`. Prevents unexpected breakages. Use Renovate or Dependabot for automated updates with testing. Use ranges only in libraries.
- Prefer modern ESM packages. Check `package.json` for `"type": "module"` and `"exports"` field. Avoid CJS-only packages (poor tree-shaking, bundler issues). Use `publint` to check package quality.
- Use bundle analyzers to identify large dependencies. Replace heavy libs: Use `date-fns` over `moment`, `zustand` over `redux`, `wretch` over `axios`. Check bundlephobia.com before adding packages.
- Avoid polyfills when targeting modern browsers. Use `browserslist` in package.json: `"> 0.5%, last 2 versions, not dead"`. Let Vite/Next.js handle polyfills automatically based on targets.
- Use peer dependencies correctly in library packages. Avoid bundling React/Vue in libraries. Mark as peer deps: `"peerDependencies": { "react": "^18.0.0" }`. Document required peer versions in README.
- Keep dependencies updated: Run `pnpm update` monthly. Review changelogs before major updates. Test thoroughly. Use `npm-check-updates` for bulk updates: `npx ncu -u`.
- Use workspaces for monorepos: pnpm workspaces, npm workspaces, or Turborepo. Share dependencies with `workspace:*` protocol. Use `--filter` flag for selective operations.
- Remove unused dependencies: Run `depcheck` to find unused deps. Remove `devDependencies` not used in scripts. Check for duplicate packages: `pnpm list --depth=Infinity | grep <package>`.

## Documentation

- Write TSDoc comments for exported functions, types, and classes: `/** Description. @param x - Parameter description. @returns Return description. @example \`\`\`ts\nfn(5) // => 10\n\`\`\` */`. Use `@deprecated`, `@see`, `@throws` tags appropriately.
- Document component props with JSDoc: `interface ButtonProps { /** Button label text. @default 'Click me' */ label?: string; }`. Renders in IDE tooltips and generated docs.
- Use Storybook 8+ for component documentation. Write stories with CSF3 format: `export default { component: Button }; export const Primary: Story = { args: { variant: 'primary' } }`. Use `@storybook/addon-docs` for auto-generated prop tables.
- Generate API docs with TypeDoc: `typedoc --out docs src/index.ts`. Configure with `typedoc.json`. Host on GitHub Pages or Vercel. Use `--plugin typedoc-plugin-markdown` for markdown output.
- Write README.md for packages/projects: Include installation, quick start, API reference, examples, contributing guide. Use badges for build status, coverage, npm version. Keep up-to-date.
- Document architecture decisions with ADRs (Architecture Decision Records) in `docs/adr/`. Use template: Context, Decision, Consequences. Number sequentially: `001-use-react-query.md`.
- Add inline comments for complex logic only. Code should be self-documenting with clear names. Comment "why" not "what": `// Retry with exponential backoff to handle rate limiting` not `// Wait 2 seconds`.
- Use JSDoc `@link` for cross-references: `{@link OtherFunction}`. Use `@inheritDoc` to inherit docs from parent class/interface. Use `@internal` for private APIs.
- Document environment variables in `.env.example` with comments: `# Supabase project URL\nREACT_APP_SUPABASE_URL=https://xxx.supabase.co`. Generate types: `VITE_` prefix for Vite client vars.
- Create CONTRIBUTING.md for open-source projects: Code style, PR process, testing requirements, commit conventions. Link to it from README. Include code of conduct.

## Code Style

- Use functional programming principles: Pure functions, immutability, composition. Avoid mutations: Use `map/filter/reduce` over `for` loops modifying arrays. Use spread operator for object updates: `{ ...state, key: newValue }`.
- Follow naming conventions: `camelCase` for variables/functions, `PascalCase` for types/interfaces/components, `UPPER_SNAKE_CASE` for constants. Use descriptive names: `fetchUserById` not `getUser`, `isLoading` not `loading`.
- Keep functions small and focused: <50 lines ideally. Single responsibility. Extract complex logic into well-named helper functions. Use early returns to reduce nesting: `if (!user) return null;`.
- Order imports consistently: External dependencies first (React, third-party), internal modules second (utils, components), types/interfaces third, styles last. Use auto-import sorting with `eslint-plugin-import` or Biome.
- Use const by default, let only when reassignment needed. Never use var. Use destructuring for cleaner code: `const { id, name } = user` not `const id = user.id; const name = user.name`.
- Prefer arrow functions for callbacks and inline functions: `const double = (x: number) => x * 2`. Use function declarations for top-level functions needing hoisting or `this` binding.
- Use template literals for string interpolation: `` `Hello ${name}` `` not `'Hello ' + name`. Use template literals for multi-line strings. Use tagged templates for advanced use cases (styled-components, SQL).
- Avoid nested ternaries. Use if/else or extract to functions. Max one ternary per line: `const status = isLoading ? 'loading' : 'idle'`. For multiple conditions, use switch or object lookup.
- Use optional chaining: `user?.profile?.avatar` instead of `user && user.profile && user.profile.avatar`. Use nullish coalescing: `value ?? defaultValue` not `value || defaultValue` (handles `0`, `''`, `false` correctly).
- Export components as named exports, not default: `export const Button = () => {}` not `export default function Button() {}`. Better for tree-shaking, refactoring, consistency. Use default exports only for page components in Next.js/Remix.
- Use trailing commas in multi-line arrays, objects, function parameters: Cleaner git diffs, easier to reorder lines. Prettier enforces this automatically with `trailingComma: 'all'`.
- Organize component files consistently: Imports → Types → Component → Styles → Export. Colocate related files: `Button/Button.tsx`, `Button/Button.test.tsx`, `Button/Button.stories.tsx`, `Button/index.ts` (re-exports).
