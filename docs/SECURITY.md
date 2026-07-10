# Security Guide

## Authentication

### JWT (JSON Web Tokens)

Lumora uses a dual-token authentication system with access and refresh tokens.

| Token   | Secret Env Var       | Default Expiry | Purpose                            |
| ------- | -------------------- | -------------- | ---------------------------------- |
| Access  | `JWT_ACCESS_SECRET`  | `15m`          | API authorization (Bearer header)  |
| Refresh | `JWT_REFRESH_SECRET` | `7d`           | Session rotation (httpOnly cookie) |

**Token payload:**

```ts
interface TokenPayload {
  sub: string; // User ID
  role: string; // User role (USER | MODERATOR | ADMIN)
}
```

**Implementation:** `apps/api/src/utils/jwt.ts`

- `signAccessToken(payload)` — signs with `JWT_ACCESS_SECRET`, expires per `JWT_ACCESS_EXPIRES_IN`
- `signRefreshToken(payload)` — signs with `JWT_REFRESH_SECRET`, expires per `JWT_REFRESH_EXPIRES_IN`
- `verifyAccessToken(token)` — verifies and decodes access tokens
- `verifyRefreshToken(token)` — verifies and decodes refresh tokens

### Cookie Configuration

Refresh tokens are transmitted via httpOnly cookies:

```ts
const COOKIE_OPTIONS = {
  httpOnly: true, // Not accessible via JavaScript
  secure: true, // HTTPS only in production
  sameSite: 'strict', // CSRF protection via same-site policy
  path: '/api/v1/auth/refresh', // Scope-limited path
};
```

The `rememberMe` flag extends the cookie `maxAge` from 1 day to `REMEMBER_ME_DAYS` (default: 30).

**Refresh cookie name:** `lumora_refresh` (from `@lumora/shared` constants)

### OAuth (Passport.js)

Two OAuth providers are supported via Passport.js strategies:

| Provider | Strategy Package          | Scope              | Env Vars                                   |
| -------- | ------------------------- | ------------------ | ------------------------------------------ |
| Google   | `passport-google-oauth20` | `profile`, `email` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| GitHub   | `passport-github2`        | `user:email`       | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` |

**Flow:**

1. Client redirects to `/api/v1/auth/{provider}`
2. Passport redirects to the provider's consent screen
3. Provider redirects to `/api/v1/auth/{provider}/callback`
4. Passport authenticates and `authService.handleOAuth()` creates/link accounts
5. Browser is redirected to `{FRONTEND_URL}/auth/callback?accessToken={token}`
6. Refresh token is set as an httpOnly cookie

**Account linking:** If a user already exists with the OAuth email, the provider account is linked. Otherwise, a new user is created.

**Important:** Ensure callback URLs are registered in both Google Cloud Console and GitHub OAuth Apps settings.

### Authentication Middleware

| Middleware     | File                                 | Behavior                                                    |
| -------------- | ------------------------------------ | ----------------------------------------------------------- |
| `authenticate` | `apps/api/src/middleware/auth.ts:7`  | Requires valid Bearer token; returns 401 if missing/expired |
| `optionalAuth` | `apps/api/src/middleware/auth.ts:40` | Attaches user if token present; continues silently if not   |

The `authenticate` middleware:

1. Extracts the Bearer token from the `Authorization` header
2. Verifies it using `verifyAccessToken()`
3. Fetches the user from the database (selecting `id`, `email`, `name`, `avatar`, `role`, `subscription`, `emailVerified`)
4. Attaches the user object to `req.user`
5. Returns `401 Unauthorized` if the token is invalid or the user no longer exists

---

## Authorization (RBAC)

### Role Hierarchy

```text
USER (0) < MODERATOR (1) < ADMIN (2)
```

Each role has a numeric level. A user can perform any action that requires a role at or below their level.

**Implementation:** `apps/api/src/middleware/rbac.ts`

### Middleware

| Guard                               | Function                             | Required Role                    |
| ----------------------------------- | ------------------------------------ | -------------------------------- |
| `requireRole('ADMIN', 'MODERATOR')` | `requireRole(...roles)`              | Maximum of specified role levels |
| `requireAdmin`                      | Shorthand for `requireRole('ADMIN')` | ADMIN                            |

```ts
// Protect admin-only routes:
router.use(authenticate, requireAdmin);

// Protect moderator+ routes:
router.get('/moderate', authenticate, requireRole('ADMIN', 'MODERATOR'), handler);
```

**Error:** Insufficient permissions return `403 FORBIDDEN`.

### Route Authorization Matrix

| Module                                  | Authentication                  | Authorization      |
| --------------------------------------- | ------------------------------- | ------------------ |
| Auth (register, login, refresh, logout) | None                            | Public             |
| Auth (OAuth)                            | None (Passport)                 | Public             |
| Auth (me)                               | `authenticate`                  | Authenticated user |
| Blog (list, get by slug)                | None                            | Public             |
| Blog (create, update, delete)           | `authenticate`                  | Authenticated user |
| User (profile, update)                  | `authenticate`                  | Authenticated user |
| Admin (all routes)                      | `authenticate` + `requireAdmin` | ADMIN only         |
| Media (list, upload, delete)            | `authenticate`                  | Authenticated user |
| Notifications (all)                     | `authenticate`                  | Authenticated user |
| Search                                  | None                            | Public             |

---

## CSRF Protection

**Pattern:** Double-submit cookie pattern.

**Implementation:** `apps/api/src/middleware/csrf.ts`

1. **Token generation** — `generateCsrfToken` middleware runs on every request:
   - Generates a 32-byte random hex token
   - Sets it as a non-httpOnly cookie named `csrfToken` (readable by JavaScript)
   - Stores it in `res.locals.csrfToken`

2. **Validation** — `csrfProtection(required = true)` middleware:
   - Skipped for `GET`, `HEAD`, `OPTIONS` requests (safe methods)
   - Compares `X-CSRF-Token` header value with the `csrfToken` cookie value
   - Returns `401 UNAUTHORIZED` if they don't match

**Cookie config:**

```ts
res.cookie('csrfToken', token, {
  httpOnly: false, // Must be readable by frontend JS
  secure: true, // HTTPS only in production
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

> **Note:** The CSRF token cookie is intentionally **not httpOnly** so the frontend can read it and include it in the `X-CSRF-Token` header. The refresh token cookie remains httpOnly.

---

## Security Headers

**Implementation:** `apps/api/src/middleware/security.ts` + `helmet` configuration

### Custom Security Headers

| Header                      | Value                                                          | Purpose                    |
| --------------------------- | -------------------------------------------------------------- | -------------------------- |
| `X-Frame-Options`           | `DENY`                                                         | Prevent clickjacking       |
| `X-Content-Type-Options`    | `nosniff`                                                      | Prevent MIME type sniffing |
| `X-XSS-Protection`          | `1; mode=block`                                                | Enable XSS filter (legacy) |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                              | Control referrer info      |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`                          | Force HTTPS (1 year)       |
| `Permissions-Policy`        | `camera=(), geolocation=(), microphone=(), payment=(), usb=()` | Restrict browser features  |

### Content Security Policy (Production only)

```text
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self';
frame-ancestors 'none';
```

### Helmet Configuration

```ts
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
  }),
);
```

- `crossOriginResourcePolicy: 'cross-origin'` — allows media resources (Cloudinary, etc.)
- CSP is only enforced in production; development uses Helmet defaults

---

## Rate Limiting

**Implementation:** `express-rate-limit` at `apps/api/src/app.ts:53`

| Parameter        | Value           | Config Key             |
| ---------------- | --------------- | ---------------------- |
| Window           | `60000ms` (60s) | `RATE_LIMIT_WINDOW_MS` |
| Max requests     | `100`           | `RATE_LIMIT_MAX`       |
| Standard headers | Enabled         |                        |
| Legacy headers   | Disabled        |                        |

```ts
app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs, // 60,000
    max: config.rateLimit.max, // 100
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' },
    },
  }),
);
```

Rate limiting is applied globally to all routes. Exceeded limits return `429 Too Many Requests` with error code `RATE_LIMIT_EXCEEDED`.

---

## Input Validation (Zod)

**Implementation:** `apps/api/src/middleware/validate.ts`

All request inputs are validated using Zod schemas defined in `@lumora/validators`:

```ts
// The validate middleware accepts body, query, and/or params schemas:
router.post('/posts', authenticate, validate({ body: createPostSchema }), handler);
```

**Validation behavior:**

- Parses `body`, `query`, and/or `params` against their respective Zod schemas
- On failure: returns `422 VALIDATION_ERROR` with field-level error details
- On success: replaces `req.body`/`req.query`/`req.params` with parsed (and defaulted) data

### Validation Schemas

| Schema                 | Fields                                               | Constraints                                                                     |
| ---------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| `registerSchema`       | email, password, name                                | Email valid; password 8-128 chars, must have upper+lower+digit; name 2-64 chars |
| `loginSchema`          | email, password                                      | Email valid; password required                                                  |
| `forgotPasswordSchema` | email                                                | Email valid                                                                     |
| `resetPasswordSchema`  | token, password                                      | Token required; password 8-128 chars                                            |
| `createPostSchema`     | title, excerpt, content, coverImage?, tags?, status? | Title 1-200 chars; excerpt 1-500 chars; tags max 10; status defaults to DRAFT   |
| `updatePostSchema`     | Partial of createPostSchema                          | All fields optional                                                             |
| `updateProfileSchema`  | name?, avatar?                                       | Name 2-64 chars; avatar valid URL                                               |
| `updateUserRoleSchema` | role                                                 | Role must be USER, MODERATOR, or ADMIN                                          |
| `paginationSchema`     | page?, limit?, sort?, order?                         | Page defaults to 1; limit 1-100 defaults to 20; order desc                      |
| `paramsSchema`         | id                                                   | ID required                                                                     |
| `changePasswordSchema` | currentPassword, newPassword                         | Current required; new 8-128 chars                                               |

---

## Cookie Security

| Cookie        | Name             | httpOnly | Secure     | SameSite | MaxAge    | Purpose             |
| ------------- | ---------------- | -------- | ---------- | -------- | --------- | ------------------- |
| Refresh Token | `lumora_refresh` | Yes      | Yes (prod) | `strict` | 1-30 days | Session persistence |
| CSRF Token    | `csrfToken`      | No       | Yes (prod) | `strict` | 7 days    | Double-submit CSRF  |

- Refresh cookies are scoped to `path: '/api/v1/auth/refresh'`
- In development (`NODE_ENV !== 'production'`), `secure` flag is `false` to allow HTTP
- Refresh tokens stored in the `Session` table for server-side invalidation

---

## Password Hashing

**Algorithm:** bcrypt via `bcryptjs`

**Implementation:** `apps/api/src/utils/password.ts`

| Parameter        | Value                            |
| ---------------- | -------------------------------- |
| Salt rounds      | `12`                             |
| Hash function    | `bcrypt.hash(password, 12)`      |
| Compare function | `bcrypt.compare(password, hash)` |

```ts
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

---

## Environment Variable Validation

**Implementation:** `apps/api/src/config/env.ts`

The application validates required environment variables at startup. Missing variables throw an error and prevent the server from starting.

```ts
function env(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}
```

Variables marked as **required** have **no default fallback** — the app will crash on startup if they are missing:

| Variable             | Required | Default                  |
| -------------------- | -------- | ------------------------ |
| `JWT_ACCESS_SECRET`  | Yes      | —                        |
| `JWT_REFRESH_SECRET` | Yes      | —                        |
| `DATABASE_URL`       | Yes      | —                        |
| `NODE_ENV`           | No       | `development`            |
| `PORT`               | No       | `4000`                   |
| `FRONTEND_URL`       | No       | `http://localhost:5173`  |
| `BACKEND_URL`        | No       | `http://localhost:4000`  |
| `REDIS_URL`          | No       | `redis://localhost:6379` |
| `CORS_ORIGIN`        | No       | `http://localhost:5173`  |

OAuth and service keys (`GOOGLE_*`, `GITHUB_*`, `CLOUDINARY_*`, `RESEND_API_KEY`) have empty defaults — missing keys disable the respective feature with a console warning rather than crashing.

---

## CORS Configuration

**Implementation:** `apps/api/src/app.ts:38`

```ts
app.use(cors({ origin: config.cors.origin, credentials: true }));
```

| Setting       | Value                                                      | Config Key                                 |
| ------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `origin`      | `http://localhost:5173` (dev), the configured frontend URL | `CORS_ORIGIN`                              |
| `credentials` | `true`                                                     | Allows cookies (refresh token, CSRF token) |

In production, `CORS_ORIGIN` must be set to the exact frontend domain (e.g., `https://lumora.app`).

---

## Security Recommendations for Production

### Environment Variables

1. **Generate strong secrets** for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`:

   ```bash
   openssl rand -hex 64
   ```

2. **Never commit `.env` files** to version control. Only `.env.example` with placeholder values.

3. **Use a secrets manager** (e.g., Doppler, AWS Secrets Manager, HashiCorp Vault) in production.

### HTTPS

- Always terminate TLS at the load balancer or reverse proxy (Nginx, Caddy, Cloudflare)
- The `Strict-Transport-Security` header enforces HTTPS for 1 year
- Cookie `secure` flag is automatically enabled when `NODE_ENV=production`

### Database

- Use a strong, unique password for PostgreSQL
- Restrict network access to the database (private VPC, firewall rules)
- Enable PostgreSQL SSL/TLS for connections
- Run database migrations through CI/CD, not manually

### Redis

- Require authentication (`REDIS_PASSWORD`)
- Use TLS for Redis connections in production
- Restrict Redis to private network access

### Rate Limiting

- Adjust `RATE_LIMIT_MAX` based on expected traffic patterns
- Consider per-route rate limiting for sensitive endpoints (auth, password reset)
- Implement IP-based allowlisting for admin routes

### Monitoring & Logging

- Set `SENTRY_DSN` for error tracking
- Set `BETTER_STACK_TOKEN` for log aggregation
- Review audit logs (`AuditLog` table) regularly for suspicious activity
- Winston logs are structured JSON in production (`LOG_LEVEL=info`)

### File Upload

- File size limit: 50MB (configured in multer)
- Uploads go through Cloudinary (server-side) — files never touch the app server in production
- Validate file types on both client and server
- Set `CORS_ORIGIN` explicitly — never use `'*'` with credentials

### OAuth

- Register exact callback URLs in Google Cloud Console and GitHub OAuth Apps
- Do not use wildcard redirect URIs
- Validate OAuth state parameters to prevent CSRF on OAuth flows
