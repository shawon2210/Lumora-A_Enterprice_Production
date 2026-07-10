# Lumora

> **Clarity in an Endlessly Noisy Universe.**

Lumora is a production-ready, full-stack content platform that provides a clean and secure
environment for blog management, media uploads, authentication, and administration. It is built
as a TypeScript monorepo and ships with enterprise-grade security, observability, and a
containerized deployment pipeline.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [API Reference](#api-reference)
- [Security](#security)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [License](#license)

---

## Features

- **Authentication & Authorization** — JWT-based auth with `httpOnly` refresh cookies, OAuth
  (Google / GitHub) via Passport.js, and role-based access control (`USER`, `MODERATOR`, `ADMIN`).
- **Blog Management** — Full CRUD for posts with slug generation, tags, categories, and
  draft/published status.
- **Media Management** — Cloud-based uploads to Cloudinary with folder organization and database
  metadata.
- **Admin Dashboard** — User management, analytics, and audit logs for operators.
- **Notifications** — In-app notification system with read / unread tracking.
- **Global Search** — Query parsing, database lookup, and cached result serving.
- **Resilient Caching** — Redis-backed caching with graceful degradation when unavailable.

---

## Tech Stack

### Backend (`apps/api`)

| Concern    | Technology                             |
| ---------- | -------------------------------------- |
| Runtime    | Node.js 20+, Express 4, TypeScript     |
| Database   | PostgreSQL 16, Prisma ORM              |
| Cache      | Redis (optional, graceful degradation) |
| Auth       | JWT, Passport.js (OAuth 2.0)           |
| Storage    | Cloudinary                             |
| Email      | Resend                                 |
| Validation | Zod                                    |
| Security   | Helmet, CSURF, rate limiting           |
| Logging    | Winston                                |
| Docs       | Swagger / OpenAPI (`/api-docs`)        |

### Frontend (`apps/web`)

| Concern       | Technology                        |
| ------------- | --------------------------------- |
| UI            | React 19, Vite 6, Tailwind CSS 4  |
| Routing       | React Router 7                    |
| Data fetching | TanStack Query 5                  |
| State         | Zustand 5                         |
| Forms         | React Hook Form                   |
| Components    | Radix UI, Framer Motion, Recharts |
| Validation    | Zod (shared with backend)         |

### Tooling

- **Monorepo**: Turborepo + pnpm workspaces
- **Quality**: ESLint 9 (flat config), Prettier, TypeScript
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **CI/CD**: GitHub Actions, Husky + commitlint + lint-staged
- **Containers**: Docker, Docker Compose, nginx reverse proxy

---

## Architecture

Lumora follows a modular, layered architecture. Inbound requests traverse a security pipeline
before reaching feature handlers:

```
Request
  → Security Headers (Helmet)
  → Rate Limiting
  → Authentication (JWT / Cookie)
  → Authorization (RBAC)
  → Validation (Zod)
  → Module Handler
  → Response (envelope) + Winston log
```

Errors flow through a centralized handler that maps domain exceptions
(`NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`,
`ValidationError`, `RateLimitError`) to a consistent JSON envelope.

### Caching Strategy

- Blog posts cached with a 60-second TTL and pattern-based invalidation.
- User profiles invalidated on update.
- The application degrades gracefully and runs without Redis if the service is unavailable.

---

## Project Structure

```
lumora/
├── apps/
│   ├── api/          # Express REST API (port 4000)
│   └── web/          # React + Vite frontend (port 5173)
├── packages/
│   ├── database/     # Prisma client, schema, seed, migrations
│   ├── shared/       # Types, enums, constants (api + web)
│   ├── validators/   # Zod schemas (api + web)
│   ├── ui/           # React component library (Radix UI + Tailwind)
│   └── config/       # Shared tooling/lint configuration
├── docker/           # Dockerfiles and compose
├── tests/
│   └── e2e/          # Playwright end-to-end tests
├── docs/            # API, Architecture, Security, Deployment, Contributing
├── .github/         # CI/CD workflows
├── turbo.json       # Turborepo pipeline config
└── pnpm-workspace.yaml
```

**Build pipeline (Turborepo):** `database` → `shared` → `validators` → `ui` → `api` + `web`.

---

## Getting Started

### Prerequisites

- Node.js `>=20`
- pnpm `>=10`
- PostgreSQL `>=16`
- Redis (optional for local development)

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
#    Edit .env with your database, JWT, Cloudinary, and Resend credentials

# 3. Generate the Prisma client and apply migrations
pnpm db:generate
pnpm --filter=@lumora/database prisma migrate dev

# 4. (Optional) Seed the database
pnpm db:seed

# 5. Start the development servers
pnpm dev
```

- API: <http://localhost:4000> (Swagger UI at `/api-docs`)
- Web: <http://localhost:5173>

---

## Development Workflow

```text
Development → Build → Test → Lint → TypeCheck → Deploy
```

| Script           | Description                                  |
| ---------------- | -------------------------------------------- |
| `pnpm dev`       | Start all development servers via Turborepo  |
| `pnpm build`     | Build all packages in dependency order       |
| `pnpm test`      | Run the unit/integration test suite (Vitest) |
| `pnpm test:e2e`  | Run end-to-end tests (Playwright)            |
| `pnpm lint`      | Run ESLint across all packages               |
| `pnpm typecheck` | Run the TypeScript compiler in all packages  |
| `pnpm format`    | Format code with Prettier                    |
| `pnpm db:studio` | Open Prisma Studio                           |

---

## API Reference

The REST API is versioned under `/api/v1`. A full reference is published in
[`docs/API.md`](docs/API.md) and interactively via Swagger UI at `/api-docs` when the server runs.

| Module | Base Path        | Capabilities                            |
| ------ | ---------------- | --------------------------------------- |
| Auth   | `/api/v1/auth`   | Register, login, logout, refresh, OAuth |
| Blog   | `/api/v1/blog`   | Post CRUD, tags, categories             |
| Media  | `/api/v1/media`  | Upload, list, delete                    |
| Admin  | `/api/v1/admin`  | Users, analytics, audit logs            |
| User   | `/api/v1/user`   | Profile management, notifications       |
| Search | `/api/v1/search` | Global search                           |

Authentication uses a short-lived access token (`Authorization: Bearer <token>`) and a rotating
`httpOnly` refresh cookie (`lumora_refresh`).

---

## Security

Lumora is designed with security as a first-class concern. See
[`docs/SECURITY.md`](docs/SECURITY.md) for the full policy.

- **httpOnly cookies** for refresh tokens (never exposed in the response body)
- **CSRF protection** via the double-submit cookie pattern
- **Security headers** — CSP, HSTS, X-Frame-Options (Helmet)
- **Rate limiting** per endpoint
- **RBAC** authorization across all protected routes
- **Input validation** with shared Zod schemas

### Environment Variables

Required in `.env`:

| Variable                | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `DATABASE_URL`          | PostgreSQL connection string             |
| `JWT_ACCESS_SECRET`     | Access token signing secret (32+ chars)  |
| `JWT_REFRESH_SECRET`    | Refresh token signing secret (32+ chars) |
| `RESEND_API_KEY`        | Email service API key                    |
| `CLOUDINARY_*`          | Media storage credentials                |
| `GOOGLE_*` / `GITHUB_*` | OAuth credentials (optional)             |

---

## Deployment

Lumora is containerized and orchestrated with Docker Compose. See
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for details.

```bash
# Build and start all services (API, Web, PostgreSQL, Redis)
docker compose -f docker/docker-compose.yml up -d
```

- **API** — port `4000`, behind an nginx reverse proxy
- **Web** — port `5173`, serves the production build
- **PostgreSQL** — internal container with health checks
- **Redis** — optional caching layer

The CI/CD pipeline runs integration tests against a PostgreSQL service container, lints all
packages, and enforces coverage thresholds (Vitest + Playwright).

---

## Documentation

Additional documentation lives in [`docs/`](docs):

- [`API.md`](docs/API.md) — Endpoint and schema reference
- [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) — System and package architecture
- [`SECURITY.md`](docs/SECURITY.md) — Security model and reporting
- [`DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Deployment and operations
- [`CONTRIBUTING.md`](docs/CONTRIBUTING.md) — Contribution guidelines

---

## License

[MIT](LICENSE)
