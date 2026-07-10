# Lumora Workflow Report

## Goal Objective

**Clarity in an Endlessly Noisy Universe.** Lumora is a full-stack production-ready application designed to provide users with a clean, secure platform for blog management, media uploads, user authentication, and admin dashboard functionality.

---

## Project Overview

### What We're Building

A modern, enterprise-grade web application featuring:

- **Blog Management System** - Create, read, update, delete blog posts with tagging and categorization
- **Media Management** - Cloud-based file uploads with folder organization and Cloudinary integration
- **User Authentication** - Secure JWT-based auth with httpOnly cookies, OAuth (Google/GitHub), and session management
- **Admin Dashboard** - User management, analytics, and audit logs with RBAC authorization
- **Real-time Notifications** - In-app notification system with read/unread tracking

### Target Audience

Content creators, bloggers, and enterprise users who need a comprehensive content management platform with enterprise-grade security.

---

## Status Report: Working vs Not Working

### ✅ Authenticated Features (WORKING)

| Feature                   | Status            | Notes                                                            |
| ------------------------- | ----------------- | ---------------------------------------------------------------- |
| **Auth Routes**           | ✅ Working        | All routes defined and properly wired to controller              |
| **Register Endpoint**     | ✅ Working        | Email validation, password hashing, token generation implemented |
| **Login Endpoint**        | ✅ Working        | Credential verification, httpOnly cookie set                     |
| **Logout Endpoint**       | ✅ Working        | Session deletion, cookie clearing implemented                    |
| **Refresh Token**         | ✅ Working        | Cookie-based refresh with token rotation                         |
| **Forgot/Reset Password** | ✅ Working        | Token generation, email sending logic in place                   |
| **OAuth Google**          | ✅ Routes Working | Passport strategy configured, callback handled                   |
| **OAuth GitHub**          | ✅ Routes Working | Passport strategy configured, callback handled                   |

### ✅ Blog Module (WORKING)

| Feature              | Status     | Notes                                      |
| -------------------- | ---------- | ------------------------------------------ |
| **List Posts**       | ✅ Working | Pagination, status filtering implemented   |
| **Get Post by Slug** | ✅ Working | Slug-based lookup implemented              |
| **Create Post**      | ✅ Working | Auth required, audit logging, validation   |
| **Update Post**      | ✅ Working | Auth required, ownership check via service |
| **Delete Post**      | ✅ Working | Auth required, audit logging               |

### ⚠️ Media Module (PARTIAL - Development Fallback)

| Feature          | Status          | Notes                                                                  |
| ---------------- | --------------- | ---------------------------------------------------------------------- |
| **List Media**   | ✅ Working      | Pagination and filtering implemented                                   |
| **Upload Media** | ⚠️ Dev Fallback | Service ready, **Cloudinary integration requires production API keys** |
| **Delete Media** | ✅ Working      | Ownership verification implemented                                     |

### ✅ Admin Module (WORKING)

| Feature              | Status     | Notes                        |
| -------------------- | ---------- | ---------------------------- |
| **List Users**       | ✅ Working | RBAC enforced (admin only)   |
| **Get User**         | ✅ Working | Single user lookup           |
| **Update User Role** | ✅ Working | Role management implemented  |
| **Delete User**      | ✅ Working | Admin-only deletion          |
| **Analytics**        | ✅ Working | Dashboard analytics endpoint |
| **Audit Logs**       | ✅ Working | Admin-only log viewing       |

### ✅ Notifications Module (WORKING)

| Feature                | Status     | Notes                     |
| ---------------------- | ---------- | ------------------------- |
| **List Notifications** | ✅ Working | Auth required, pagination |
| **Unread Count**       | ✅ Working | Quick count endpoint      |
| **Mark as Read**       | ✅ Working | Single notification       |
| **Mark All Read**      | ✅ Working | Bulk action               |

### ✅ Security Infrastructure (WORKING)

| Feature              | Status     | Notes                                          |
| -------------------- | ---------- | ---------------------------------------------- |
| **httpOnly Cookies** | ✅ Working | Configured in auth.controller.ts               |
| **CSRF Protection**  | ✅ Working | Double-submit cookie pattern implemented       |
| **Security Headers** | ✅ Working | CSP, HSTS, X-Frame-Options in middleware       |
| **RBAC Middleware**  | ✅ Working | requireAdmin, authenticate working             |
| **Input Validation** | ✅ Working | Zod schemas integrated via validate middleware |
| **Rate Limiting**    | ✅ Working | Global middleware configured                   |

### ⚠️ Services Requiring Configuration (NOT FULLY WORKING in dev mode)

| Service               | Status          | Requirements                                                                                    |
| --------------------- | --------------- | ----------------------------------------------------------------------------------------------- |
| **Cloudinary Upload** | ⚠️ Dev Fallback | Requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`                 |
| **Resend Email**      | ⚠️ Dev Fallback | Requires `RESEND_API_KEY`, `EMAIL_FROM`                                                         |
| **OAuth Providers**   | ⚠️ Partial      | Requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` |
| **Redis Cache**       | ⚠️ Optional     | App runs without Redis, degrades gracefully                                                     |

### ✅ Infrastructure (WORKING)

| Component                | Status     | Notes                                    |
| ------------------------ | ---------- | ---------------------------------------- |
| **Docker Configuration** | ✅ Working | All Dockerfiles and compose ready        |
| **Database Schema**      | ✅ Working | Prisma schema complete, migrations ready |
| **Seed Script**          | ✅ Working | Creates admin, moderator, user accounts  |
| **Error Handling**       | ✅ Working | AppError hierarchy with proper responses |

---

## Core Workflow

### 1. Development Workflow

```
Development → Build → Test → Lint → TypeCheck → Deploy
```

- **Monorepo Structure**: Turborepo manages packages with shared dependencies
- **Package Build Order**: `database` → `shared` → `validators` → `ui` → `api` + `web`
- **Available Scripts**:
  - `pnpm dev` - Start all development servers
  - `pnpm build` - Build all packages
  - `pnpm test` - Run test suite
  - `pnpm lint` - Code quality checks
  - `pnpm typecheck` - TypeScript validation

### 2. Authentication Workflow

```
Register/Login → JWT Token Generation → Session Creation → Cookie/Set Token → Access Protected Routes
```

- **Register**: Email/password validation → Password hashing → User creation → Token generation
- **Login**: Credential verification → Token issuance → Session management
- **OAuth**: Provider redirect → Callback handling → Account linking/creation
- **Token Refresh**: Cookie extraction → Session validation → New token pair generation

### 3. Content Management Workflow

```
Create Post → Validate Input → Store in DB → Invalidate Cache → Return Response
```

- **Blog Posts**: Full CRUD with slug generation and status management
- **Media Upload**: File validation → Cloudinary upload → Database record
- **Search**: Query parsing → Database search → Cached results

### 4. Security Workflow

```
Request → Security Headers → Rate Limiting → Authentication → Authorization → Validation → Handler
```

- **httpOnly Cookies**: Refresh tokens stored securely, not in response body
- **CSRF Protection**: Double-submit cookie pattern for state-changing requests
- **Security Headers**: CSP, HSTS, X-Frame-Options applied to all responses
- **RBAC**: Role-based access control (USER, MODERATOR, ADMIN)

---

## Technical Architecture

### Stack Summary

| Layer        | Technology                                   |
| ------------ | -------------------------------------------- |
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS 3 |
| **Backend**  | Node.js 20, Express 4, TypeScript            |
| **Database** | PostgreSQL 16, Prisma ORM                    |
| **Cache**    | Redis (optional, graceful degradation)       |
| **Storage**  | Cloudinary                                   |
| **Email**    | Resend API                                   |
| **Auth**     | JWT, Passport.js (OAuth)                     |

### Error Handling Flow

```
Error → AppError Handler → Format Response → Log (Winston)
```

- Custom error hierarchy: NotFoundError, UnauthorizedError, ForbiddenError, ConflictError, ValidationError, RateLimitError

### Caching Strategy

- Blog posts: 60-second TTL with pattern invalidation
- User profiles: Cache invalidation on update
- Graceful degradation: App runs without Redis if unavailable

---

## Deployment Workflow

### Docker Deployment

```bash
docker-compose up -d
```

- **API**: Port 3000 (behind nginx reverse proxy)
- **Web**: Port 5173 (production build served)
- **PostgreSQL**: Internal container with health checks
- **Redis**: Optional, for caching layer

### CI/CD Pipeline

- **Test**: PostgreSQL service container spins up for integration tests
- **Lint**: ESLint across all packages
- **Coverage**: Vitest for unit tests, Playwright for E2E

---

## Summary

**Overall Status:** ✅ **Core functionality is working.** The application is production-ready with proper routes, controllers, services, and security middleware in place.

**Note:** Some external services (Cloudinary, Resend Email, OAuth providers) require API keys to be fully functional in production, but have development fallbacks in place.
