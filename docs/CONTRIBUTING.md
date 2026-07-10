# Contributing Guide

## Getting Started

### Prerequisites

- Node.js `>=20.0.0`
- pnpm `>=10.0.0`
- PostgreSQL `>=16`
- Redis `>=7`

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/lumora.git
cd lumora

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your local PostgreSQL and Redis connection details

# 4. Set up the database
pnpm db:push      # Push schema to database
pnpm db:seed      # Seed with initial data (optional)
pnpm db:generate  # Generate Prisma client

# 5. Start development servers
pnpm dev
```

The application is now running at:

- **API:** http://localhost:4000
- **API Docs:** http://localhost:4000/api-docs
- **Web:** http://localhost:5173

### Available Commands

| Command             | Description                                    |
| ------------------- | ---------------------------------------------- |
| `pnpm dev`          | Start all apps in development mode (Turborepo) |
| `pnpm build`        | Build all packages and apps                    |
| `pnpm lint`         | Lint all packages and apps                     |
| `pnpm format`       | Format code with Prettier                      |
| `pnpm format:check` | Check formatting without writing               |
| `pnpm typecheck`    | Run TypeScript type checking                   |
| `pnpm test`         | Run all tests                                  |
| `pnpm test:ci`      | Run tests in CI mode                           |
| `pnpm test:e2e`     | Run Playwright end-to-end tests                |
| `pnpm clean`        | Clean all build artifacts and node_modules     |
| `pnpm db:generate`  | Generate Prisma client                         |
| `pnpm db:push`      | Push Prisma schema to database                 |
| `pnpm db:seed`      | Seed database with initial data                |
| `pnpm db:studio`    | Open Prisma Studio                             |
| `pnpm db:migrate`   | Create and apply migrations                    |
| `pnpm docker:build` | Build Docker images                            |

---

## Development Workflow

### Branch Strategy

```
main          Production-ready code
develop       Integration branch for features
feat/*        New features (branch off develop)
fix/*         Bug fixes (branch off develop)
chore/*       Tooling, dependencies, CI (branch off develop)
docs/*        Documentation changes (branch off develop)
```

### Branch Naming

```
feat/add-blog-editor
fix/login-validation-error
chore/update-dependencies
docs/api-endpoints
```

### Commit Convention

This project uses **Conventional Commits** with commitlint and Husky.

```
<type>(<scope>): <description>

[optional body]
```

**Types:**

| Type       | Usage                                     |
| ---------- | ----------------------------------------- |
| `feat`     | A new feature                             |
| `fix`      | A bug fix                                 |
| `chore`    | Maintenance, tooling, dependencies        |
| `docs`     | Documentation changes                     |
| `refactor` | Code restructuring (no functional change) |
| `test`     | Adding or modifying tests                 |
| `style`    | Formatting, linting (no logic change)     |
| `perf`     | Performance improvements                  |

**Scopes:**

| Scope        | Area                                                     |
| ------------ | -------------------------------------------------------- |
| `api`        | API server (`apps/api/`)                                 |
| `web`        | Web frontend (`apps/web/`)                               |
| `db`         | Database schema, seed, migrations (`packages/database/`) |
| `shared`     | Shared types/constants (`packages/shared/`)              |
| `validators` | Zod schemas (`packages/validators/`)                     |
| `ui`         | UI components (`packages/ui/`)                           |

**Examples:**

```
feat(api): add blog post pagination
fix(web): handle expired token redirect
chore(deps): update turborepo to 2.4.4
docs(api): update auth endpoint examples
test(api): add auth service unit tests
```

### Commit Hooks

Husky runs the following hooks:

**`pre-commit` — lint-staged:**

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{js,jsx,json,css,md}": ["prettier --write"]
}
```

**`commit-msg` — commitlint:**
Checks that commit messages follow the Conventional Commits format.

---

## Code Style

### Linting — ESLint

ESLint 9 with flat config (`eslint.config.mjs`) enforces code quality rules.

**Configuration:**

- `@eslint/js` — base recommended rules
- `typescript-eslint` — TypeScript rules
- `eslint-plugin-react` — React rules
- `eslint-plugin-react-hooks` — React Hooks rules
- `eslint-config-prettier` — Disables rules that conflict with Prettier

```bash
pnpm lint                # Lint all packages
pnpm --filter @lumora/api lint   # Lint specific package
```

### Formatting — Prettier

Prettier enforces consistent code formatting.

**Config (`.prettierrc`):**

- `prettier-plugin-tailwindcss` — sorts Tailwind CSS classes

```bash
pnpm format              # Format all files
pnpm format:check        # Check formatting (CI)
```

### TypeScript

Strict mode is enabled across the project. Run type checking before opening a PR:

```bash
pnpm typecheck
```

---

## Testing Requirements

### Running Tests

```bash
pnpm test            # Run all tests
pnpm test:ci         # CI mode (same as above)
pnpm test:e2e        # Playwright E2E tests
```

### Test Guidelines

1. **Unit tests are required** for all new services, utilities, and validation schemas
2. **Integration tests** should cover API endpoints and database interactions
3. **E2E tests** (Playwright) cover critical user flows:
   - Registration and login
   - Blog post CRUD
   - Profile management
4. Tests live alongside source files as `*.test.ts` or in `tests/` directories
5. API integration tests use `supertest` against the Express app
6. A PostgreSQL service container is available in CI for test runs
7. Mock external services (Cloudinary, Resend, OAuth providers) in unit tests

---

## Pull Request Process

### Before Submitting

- [ ] Branch is up to date with `develop`
- [ ] All tests pass: `pnpm test`
- [ ] Type checking passes: `pnpm typecheck`
- [ ] Linting passes: `pnpm lint`
- [ ] Formatting is correct: `pnpm format:check`
- [ ] Build succeeds: `pnpm build`
- [ ] No new ESLint warnings or errors
- [ ] Changes include or update relevant tests
- [ ] API changes include OpenAPI documentation in route files
- [ ] Database changes include a new migration
- [ ] Commits follow Conventional Commits format

### PR Title Format

```
<type>(<scope>): <description>
```

Follows the same convention as commit messages.

### PR Description Template

```markdown
## Description

[Brief description of the changes]

## Type of Change

- [ ] feat: New feature
- [ ] fix: Bug fix
- [ ] chore: Maintenance
- [ ] docs: Documentation
- [ ] refactor: Code restructuring
- [ ] test: Tests
- [ ] style: Formatting

## Testing

[Describe how the changes were tested]

## Screenshots (if applicable)

[Add screenshots for UI changes]

## Related Issues

Closes #[issue-number]
```

### Review Process

1. PR targets `develop` branch
2. CI pipeline must pass (typecheck, lint, test, build)
3. At least one maintainer review is required
4. Address all review comments before merging
5. Squash-merge into `develop`
6. Releases to `main` are managed by maintainers

### PR Checklist for Reviewers

- [ ] Code follows project conventions and style
- [ ] Tests cover the changes adequately
- [ ] No security concerns (validation, auth, error handling)
- [ ] OpenAPI docs are updated if API changed
- [ ] Database migrations are safe (no destructive changes without discussion)
- [ ] Error messages are user-friendly and not leaking internals

---

## Project Structure Reference

```
lumora/
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── config/          # Env, Redis, Passport, Swagger
│   │       ├── middleware/      # Auth, RBAC, validation, CSRF, error handling
│   │       ├── modules/         # Feature modules (auth, blog, user, admin, etc.)
│   │       │   ├── *.routes.ts  # Route definitions + OpenAPI annotations
│   │       │   ├── *.controller.ts
│   │       │   ├── *.service.ts
│   │       │   └── *.repository.ts
│   │       └── utils/           # JWT, password, cache, errors, response, etc.
│   └── web/
│       └── src/
│           ├── components/      # React components
│           ├── hooks/           # Custom React hooks
│           ├── lib/             # API client, utilities
│           ├── pages/           # Route pages
│           └── stores/          # Zustand stores
├── packages/
│   ├── database/
│   │   ├── prisma/schema.prisma # Database schema
│   │   └── src/                 # Prisma client singleton, seed
│   ├── shared/src/
│   │   ├── types/               # Shared TypeScript interfaces
│   │   ├── enums/               # Shared enums
│   │   └── constants/           # Shared constants
│   ├── validators/src/
│   │   └── schemas/             # Zod validation schemas
│   └── ui/src/                  # React UI components
└── docker/
    ├── docker-compose.yml       # Multi-container setup
    ├── Dockerfile.api           # API container
    ├── Dockerfile.web           # Web container
    └── nginx.conf               # Nginx reverse proxy config
```

---

## Additional Resources

- **API Documentation:** Run the server and visit `/api-docs` (Swagger UI)
- **Database Schema:** View `packages/database/prisma/schema.prisma`
- **Shared Types:** `packages/shared/src/types/index.ts`
- **Validation Schemas:** `packages/validators/src/schemas/`
- **Environment Variables:** `.env.example` for all configurable values
