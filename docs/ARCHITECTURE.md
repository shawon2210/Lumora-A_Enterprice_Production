# System Architecture

## Monorepo Structure (Turborepo)

```
lumora/
├── apps/
│   ├── api/          # Express REST API (port 4000)
│   └── web/          # React + Vite frontend (port 5173)
├── packages/
│   ├── database/     # Prisma client, schema, seed, migrations
│   ├── shared/       # Types, enums, constants (api + web)
│   ├── validators/   # Zod schemas (api + web)
│   └── ui/           # React component library (Radix UI + Tailwind)
├── docker/           # Dockerfiles and compose
├── .github/          # CI/CD workflows
├── turbo.json        # Turborepo pipeline config
└── pnpm-workspace.yaml
```

### Turborepo Pipeline (`turbo.json`)

```json
{
  "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
  "dev": { "cache": false, "persistent": true, "dependsOn": ["^build"] },
  "lint": { "dependsOn": ["^build"] },
  "test": { "dependsOn": ["^build"] }
}
```

**Build order:** `packages/database` → `packages/shared` → `packages/validators` → `packages/ui` → `apps/api` + `apps/web`

### Dependency Graph

```
@lumora/web ──┬── @lumora/shared
              ├── @lumora/validators
              └── @lumora/ui

@lumora/api ───┬── @lumora/database (Prisma)
               ├── @lumora/shared
               └── @lumora/validators

@lumora/database ─── @prisma/client
```

---

## Package Overview

### `@lumora/api` — Express REST API

**Tech stack:** Express 4, TypeScript, Prisma Client, Redis, Passport.js, JWT, Zod, Helmet, Winston, Cloudinary, Swagger

**Scripts:** `dev` (tsx watch), `build` (tsc), `start` (node dist), `test` (vitest)

### `@lumora/web` — React Frontend

**Tech stack:** React 19, Vite 6, Tailwind 4, React Router 7, TanStack Query 5, Zustand 5, React Hook Form, Radix UI, Framer Motion, Recharts

### `@lumora/database` — Prisma ORM

Exports a singleton `PrismaClient` instance. In development, enables query logging. Uses global caching to prevent multiple instances during hot-reload.

```ts
// packages/database/src/index.ts
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });
```

### `@lumora/shared` — Shared Types & Constants

Shared across API and web:

- **Types:** `User`, `Session`, `BlogPost`, `Notification`, `MediaFile`, `ApiResponse<T>`, `PaginationMeta`, `PaginationParams`
- **Enums:** `UserRole` (USER, ADMIN, MODERATOR), `SubscriptionStatus` (FREE, PRO, ENTERPRISE), `ContentStatus` (DRAFT, PUBLISHED, ARCHIVED), `NotificationType` (INFO, SUCCESS, WARNING, ERROR), `MediaType` (IMAGE, VIDEO, AUDIO, DOCUMENT)
- **Constants:** `APP_NAME`, `API_PREFIX` (`/api/v1`), pagination defaults, cookie names, route paths

### `@lumora/validators` — Zod Validation Schemas

Shared validation schemas for API request bodies and frontend forms:

- `registerSchema`, `loginSchema`, `forgotPasswordSchema`, `resetPasswordSchema`, `changePasswordSchema`
- `createPostSchema`, `updatePostSchema`
- `updateProfileSchema`, `updateUserRoleSchema`
- `paginationSchema`, `paramsSchema`, `slugSchema`

### `@lumora/ui` — UI Component Library

Radix UI primitives styled with Tailwind CSS and `class-variance-authority`. Includes utilities like `cn()` (`clsx` + `tailwind-merge`).

---

## Clean Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│                    Routes                            │
│  (HTTP routing, middleware chain, OpenAPI docs)      │
├─────────────────────────────────────────────────────┤
│                  Controllers                         │
│  (Request parsing, response formatting, cookies)     │
├─────────────────────────────────────────────────────┤
│                   Services                           │
│  (Business logic, orchestration, error handling)     │
├─────────────────────────────────────────────────────┤
│                 Repositories                         │
│  (Database queries via Prisma)                       │
├─────────────────────────────────────────────────────┤
│                   Prisma Client                      │
│  (ORM — auto-generated from schema)                  │
├─────────────────────────────────────────────────────┤
│              PostgreSQL / Redis                      │
└─────────────────────────────────────────────────────┘
```

### Layer Rules

- **Routes** → define HTTP method, path, middleware chain (auth, validation, audit), and link to controller
- **Controllers** → extract data from request, call service, format response (`sendSuccess`, `sendPaginated`, `sendMessage`), handle cookies
- **Services** → implement business logic, throw typed errors (`AppError` subclasses), call repositories
- **Repositories** → Prisma queries only, no business logic
- **Errors** bubble up from service → controller → error handler middleware

### Request Flow Example

```
POST /api/v1/blog/posts
  │
  ├── rateLimit (global)
  ├── securityHeaders + helmet
  ├── cors, compression, cookieParser, json parser
  ├── authenticate (verify JWT, load user -> req.user)
  ├── validate({ body: createPostSchema }) (Zod -> 422 on fail)
  ├── auditLog('CREATE', 'BlogPost') (log to AuditLog table)
  │
  └── blogController.createPost(req, res)
        │
        ├── blogService.create(req.body, req.user.id)
        │     ├── generateSlug(title)
        │     ├── blogRepository.create(data)
        │     │     └── prisma.blogPost.create({ data, include: { author } })
        │     └── cache.delPattern('blog:*')
        │
        └── sendSuccess(res, post, undefined, 201)
```

---

## Request Flow Diagram

```
Client                    API Server
  │                          │
  │── HTTP Request ──────────┤
  │                          │
  │                     ┌────┴────┐
  │                     │ Global  │
  │                     │Middleware│
  │                     │ - helmet │
  │                     │ - cors   │
  │                     │ - rate   │
  │                     │   limit  │
  │                     │ ─────── │
  │                     │ Module  │
  │                     │Middleware│
  │                     │ - auth   │
  │                     │ - validate│
  │                     │ - rbac   │
  │                     │ - audit  │
  │                     └────┬────┘
  │                          │
  │                     ┌────┴────┐
  │                     │Controller│
  │                     └────┬────┘
  │                          │
  │                     ┌────┴────┐
  │                     │ Service │
  │                     └────┬────┘
  │                          │
  │                     ┌────┴────┐
  │                     │Repository│
  │                     └────┬────┘
  │                          │
  │                     ┌────┴────┐
  │                     │ Prisma  │
  │                     │ /Redis  │
  │                     └────┬────┘
  │                          │
  │◄──── JSON Response ──────┤
  │     { success, data,     │
  │       error, meta }      │
```

---

## Authentication Flow

### Register

```
POST /api/v1/auth/register { email, password, name }
  │
  ├── validate({ body: registerSchema })
  │
  ├── authController.register
  │     ├── authService.register(input)
  │     │     ├── Check email uniqueness (ConflictError if exists)
  │     │     ├── hashPassword(password) — bcrypt, 12 rounds
  │     │     ├── authRepository.createUser({ email, name, password })
  │     │     ├── signAccessToken({ sub: user.id, role })
  │     │     ├── signRefreshToken({ sub: user.id, role })
  │     │     ├── authRepository.createSession(user.id, accessToken, refreshToken, expiresAt)
  │     │     └── Return { accessToken, refreshToken, user }
  │     │
  │     ├── Set refresh cookie (httpOnly, secure, sameSite: strict)
  │     └── sendSuccess(res, { accessToken, user }, undefined, 201)
```

### Login

```
POST /api/v1/auth/login { email, password, rememberMe? }
  │
  ├── validate({ body: loginSchema })
  │
  ├── authController.login
  │     ├── authService.login(input, rememberMe)
  │     │     ├── Find user by email (UnauthorizedError if not found)
  │     │     ├── comparePassword(password, user.password)
  │     │     ├── sign tokens
  │     │     ├── createSession
  │     │     └── Return tokens + user
  │     │
  │     ├── Set refresh cookie (maxAge: 1 day or REMEMBER_ME_DAYS)
  │     └── sendSuccess(res, { accessToken, user })
```

### Refresh Token Rotation

```
POST /api/v1/auth/refresh (cookie: lumora_refresh)
  │
  ├── authController.refresh
  │     ├── Extract refreshToken from cookie or body
  │     ├── authService.refresh(refreshToken)
  │     │     ├── verifyRefreshToken(token) — verify signature
  │     │     ├── Find session by refresh token
  │     │     ├── Check session not expired
  │     │     ├── DELETE old session (rotation — prevents reuse)
  │     │     ├── Sign NEW access + refresh tokens
  │     │     ├── CREATE new session
  │     │     └── Return new tokens + user
  │     │
  │     └── Set new refresh cookie
  │
  └── sendSuccess(res, { accessToken, user })
```

### OAuth Flow (Google / GitHub)

```
1. GET /api/v1/auth/{provider}
   → Redirect to provider's consent screen

2. User grants permissions on provider's site
   → Provider redirects to /api/v1/auth/{provider}/callback

3. Passport authenticates the profile
   → authService.handleOAuth(provider, profile)
     ├── Look for existing Account(provider, providerAccountId)
     ├── If found: sign tokens, create session, return
     ├── If not found:
     │     ├── Look up user by email
     │     ├── If found: link Account to existing user
     │     ├── If not: create user + account
     │     └── Sign tokens, create session, return
     │
     └── Set refresh cookie
     → Redirect to {FRONTEND_URL}/auth/callback?accessToken={token}
```

---

## Database Schema (Entity Relationships)

```
User ──1:N── Session
User ──1:N── Account (OAuth provider accounts)
User ──1:N── BlogPost
User ──1:N── Media
User ──1:N── Folder
User ──1:N── Notification
User ──1:N── AuditLog
User ──1:N── EmailVerificationToken

BlogPost ──N:M── BlogTag       (via BlogPostTag)
BlogPost ──N:M── Category      (via BlogPostCategory)
BlogPost ──N:1── User (author)

Media ──N:1── Folder
Folder ──N:1── Folder (self-referential hierarchy)

PasswordResetToken (standalone, keyed by email)
Setting             (key-value store)
AnalyticsEvent      (event tracking, optional user link)
```

### Key Entity Fields

| Entity           | Key Fields                                                                     | Indexes                                |
| ---------------- | ------------------------------------------------------------------------------ | -------------------------------------- |
| `User`           | id, email (unique), name, avatar, password?, role, subscription, emailVerified | role, email                            |
| `Session`        | id, userId, token (unique), refreshToken?, expiresAt                           | userId, token, refreshToken, expiresAt |
| `Account`        | id, userId, provider, providerAccountId (unique per provider)                  | userId, [provider, providerAccountId]  |
| `BlogPost`       | id, title, slug (unique), excerpt?, content?, authorId, status, publishedAt?   | authorId, status, slug, publishedAt    |
| `BlogTag`        | id, name (unique), slug (unique)                                               | slug                                   |
| `Category`       | id, name (unique), slug (unique)                                               | slug                                   |
| `Media`          | id, url, type, name, size, mimeType, userId, folderId?                         | userId, type, folderId                 |
| `Folder`         | id, name, parentId?, userId                                                    | userId, parentId                       |
| `Notification`   | id, userId, type, title, message?, read                                        | userId, read, createdAt                |
| `AuditLog`       | id, userId, action, entity, entityId?, metadata (Json)                         | userId, entity, action, createdAt      |
| `AnalyticsEvent` | id, event, userId?, entity?, metadata (Json)                                   | event, userId, createdAt               |

---

## Redis Caching Strategy

**Implementation:** `apps/api/src/utils/cache.ts`

Redis is used for caching frequently accessed data to reduce database load.

### Cache API

```ts
cache.get<T>(key): Promise<T | null>        // Get cached value
cache.set(key, value, ttlSeconds?): void     // Set cached value (default TTL: 60s)
cache.del(key): void                         // Delete specific key
cache.delPattern(pattern): void              // Delete keys matching pattern (e.g., "blog:*")
cache.getOrSet(key, fetchFn, ttlSeconds?)    // Get or compute + cache
```

### Cache Invalidation Strategy

| Action               | Invalidation                 |
| -------------------- | ---------------------------- |
| Blog post created    | `cache.delPattern('blog:*')` |
| Blog post updated    | `cache.delPattern('blog:*')` |
| Blog post deleted    | `cache.delPattern('blog:*')` |
| User profile updated | `cache.delPattern('user:*')` |

### Caching Patterns

- **Blog post list:** `cache.getOrSet('blog:posts:{page}:{limit}', fetchPosts, 60)`
- **Redis connection** is lazy-initialized via `getRedis()` — the app runs without Redis if unavailable (cache gracefully degrades to no-op with a warning)

---

## Error Handling Pipeline

### Error Class Hierarchy

```
AppError (base)
├── NotFoundError      → 404 NOT_FOUND
├── UnauthorizedError  → 401 UNAUTHORIZED
├── ForbiddenError     → 403 FORBIDDEN
├── ConflictError      → 409 CONFLICT
├── ValidationError    → 422 VALIDATION_ERROR
└── RateLimitError     → 429 RATE_LIMIT_EXCEEDED
```

All custom errors extend `AppError` which carries `statusCode`, `code`, `message`, and optional `details`.

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "body": ["email: Invalid email address"],
      "query": ["page: Expected number, received string"]
    }
  }
}
```

### Error Handler

The global error handler at `apps/api/src/middleware/error-handler.ts`:

```ts
export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  // Unexpected errors (500)
  logger.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    },
  });
}
```

Unhandled errors are logged via Winston. In production, the internal error message is hidden to avoid leaking sensitive information.

---

## Testing Strategy

### Test Runner — Vitest

All packages and apps use Vitest as the test runner.

### Unit Tests

- **Location:** Alongside source files as `*.test.ts` or in `__tests__/`
- **Scope:** Services, utilities, validators, helpers
- **Dependencies:** Mocked via Vitest mocking
- **Coverage targets:** Business logic in services, validation schemas, utility functions

### Integration Tests

- **Location:** `apps/api/tests/`
- **Scope:** API endpoints, database interactions, authentication flows
- **Setup:** Test database with migrations, `supertest` for HTTP assertions
- **CI:** PostgreSQL service container spins up for test job

### E2E Tests

- **Framework:** Playwright
- **Command:** `pnpm test:e2e` (runs `playwright test`)
- **Scope:** Full user flows (registration, blog CRUD, navigation)
- **Setup:** Requires both API and web servers running

### CI Pipeline

In `.github/workflows/ci.yml`, the `test` job runs against a real PostgreSQL service container with test environment variables:

```yaml
- run: pnpm test:ci
  env:
    DATABASE_URL: postgresql://lumora:lumora@localhost:5432/lumora_test
    JWT_ACCESS_SECRET: test-secret-key-for-ci
    JWT_REFRESH_SECRET: test-refresh-secret-for-ci
```

### Test Commands

```bash
pnpm test              # Run all tests across workspace
pnpm test:ci           # CI mode (same as test)
pnpm test:e2e          # Playwright E2E tests
pnpm --filter @lumora/api test    # API-specific tests
```
