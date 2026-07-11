<div align="center">
  <h1>Lumora</h1>
  <p><strong>Clarity in an Endlessly Noisy Universe.</strong></p>
  <p>Production-ready full-stack content platform for blog management, media uploads, authentication, and administration.</p>
  <br/>
  <div>
    <img src="https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Turborepo-EF4444?logo=turborepo&logoColor=white" alt="Turborepo" />
    <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" alt="Docker" />
  </div>
</div>

---

## Overview

Lumora is a full-stack content platform built as a TypeScript monorepo. It provides a clean, secure environment for content creation, publishing, and administration — backed by enterprise-grade security, observability, and containerized deployment.

| Layer     | Stack                                                                                      |
| --------- | ------------------------------------------------------------------------------------------ |
| **API**   | Node.js 20+, Express 4, TypeScript, PostgreSQL 16 + Prisma, Redis, JWT + Passport.js OAuth |
| **Web**   | React 19, Vite 6, Tailwind CSS 4, React Router 7, TanStack Query 5, Zustand 5              |
| **Tools** | Turborepo + pnpm, ESLint 9, Prettier, Vitest, Playwright, Docker Compose                   |

---

## Features

- **Auth** — JWT with `httpOnly` refresh cookies, OAuth (Google/GitHub), RBAC
- **Blog** — Full CRUD, slugs, tags, categories, draft/published states
- **Media** — Cloudinary uploads with folder organization and metadata
- **Admin** — User management, analytics, audit logs
- **Notifications** — In-app notification system with read/unread tracking
- **Search** — Global search with query parsing, DB lookup, cached results
- **Caching** — Redis-backed with graceful degradation when unavailable

---

## Quick Start

```bash
pnpm install
cp .env.example .env     # configure database, JWT, Cloudinary, Resend
pnpm db:generate && pnpm --filter=@lumora/database prisma migrate dev
pnpm db:seed             # optional
pnpm dev                 # starts API (:4000) + Web (:5173)
```

---

## Project Structure

```
lumora/
├── apps/
│   ├── api/          # Express REST API (port 4000)
│   └── web/          # React + Vite frontend (port 5173)
├── packages/
│   ├── database/     # Prisma client, schema, migrations
│   ├── shared/       # Types, enums, constants
│   ├── validators/   # Zod schemas (shared across api + web)
│   ├── ui/           # Radix UI + Tailwind component library
│   └── config/       # Shared ESLint / TypeScript configs
├── docker/           # Dockerfiles and compose
├── tests/e2e/        # Playwright tests
└── docs/             # API, architecture, security, deployment guides
```

**Build order:** `database` → `shared` → `validators` → `ui` → `api` + `web`

---

## API (REST)

All routes are prefixed with `/api/v1`. Full reference at [`docs/API.md`](docs/API.md) or `/api-docs` (Swagger) when running.

| Module | Path             | Capabilities                   |
| ------ | ---------------- | ------------------------------ |
| Auth   | `/api/v1/auth`   | Register, login, logout, OAuth |
| Blog   | `/api/v1/blog`   | Post CRUD, tags, categories    |
| Media  | `/api/v1/media`  | Upload, list, delete           |
| Admin  | `/api/v1/admin`  | Users, analytics, audit logs   |
| User   | `/api/v1/user`   | Profile, notifications         |
| Search | `/api/v1/search` | Global search                  |

Auth uses a short-lived `Bearer` access token + rotating `httpOnly` refresh cookie.

---

## Scripts

| Command          | Description                       |
| ---------------- | --------------------------------- |
| `pnpm dev`       | Start all dev servers (Turborepo) |
| `pnpm build`     | Build all packages in order       |
| `pnpm test`      | Vitest unit/integration tests     |
| `pnpm test:e2e`  | Playwright E2E tests              |
| `pnpm lint`      | ESLint across all packages        |
| `pnpm typecheck` | TypeScript compiler check         |
| `pnpm db:studio` | Open Prisma Studio                |

---

## Deployment

```bash
docker compose -f docker/docker-compose.yml up -d
```

- **API** — port 4000 behind nginx reverse proxy
- **Web** — port 5173 (production build)
- **PostgreSQL** — internal container
- **Redis** — optional caching layer

CI/CD via GitHub Actions runs linting, type checking, tests (Vitest + Playwright), and enforces coverage thresholds.

---

## Documentation

- [API Reference](docs/API.md) — endpoints and schemas
- [Architecture](docs/ARCHITECTURE.md) — system and package design
- [Security](docs/SECURITY.md) — security model and reporting
- [Deployment](docs/DEPLOYMENT.md) — operations guide
- [Contributing](docs/CONTRIBUTING.md) — how to contribute

---

## License

[MIT](LICENSE)
