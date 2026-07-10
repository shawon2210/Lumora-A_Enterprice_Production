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

## Success Metrics

✅ **Core Features Implemented**

- [x] Authentication system (register, login, refresh, logout)
- [x] Blog management (CRUD operations)
- [x] Media uploads (Cloudinary integration)
- [x] Admin dashboard (user management, analytics)
- [x] Notification system

✅ **Security Hardened**

- [x] httpOnly cookies with secure configuration
- [x] CSRF protection (double-submit cookie)
- [x] Security headers (CSP, HSTS, X-Frame-Options)
- [x] Rate limiting per endpoint
- [x] RBAC authorization

✅ **Infrastructure Ready**

- [x] Docker configuration complete
- [x] Database seeding implemented
- [x] Email service integrated
- [x] OAuth strategies configured
