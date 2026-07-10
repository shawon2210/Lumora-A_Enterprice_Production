# Deployment Guide

## Prerequisites

| Dependency     | Version    | Purpose                             |
| -------------- | ---------- | ----------------------------------- |
| Node.js        | `>=20.0.0` | Runtime                             |
| pnpm           | `>=10.0.0` | Package manager                     |
| PostgreSQL     | `>=16`     | Primary database                    |
| Redis          | `>=7`      | Caching and session management      |
| Docker         | `24+`      | Containerized deployment (optional) |
| Docker Compose | `v2+`      | Multi-container orchestration       |

---

## Environment Variables

### Complete Reference

| Variable                 | Required | Default                                             | Description                                       |
| ------------------------ | -------- | --------------------------------------------------- | ------------------------------------------------- |
| `NODE_ENV`               | No       | `development`                                       | Runtime environment (production/development/test) |
| `PORT`                   | No       | `4000`                                              | API server port                                   |
| `FRONTEND_URL`           | No       | `http://localhost:5173`                             | Frontend URL for CORS and redirects               |
| `BACKEND_URL`            | No       | `http://localhost:4000`                             | Backend URL for self-references                   |
| `DATABASE_URL`           | **Yes**  | —                                                   | PostgreSQL connection string                      |
| `REDIS_URL`              | No       | `redis://localhost:6379`                            | Redis connection string                           |
| `JWT_ACCESS_SECRET`      | **Yes**  | —                                                   | Secret for signing access tokens                  |
| `JWT_ACCESS_EXPIRES_IN`  | No       | `15m`                                               | Access token expiry duration                      |
| `JWT_REFRESH_SECRET`     | **Yes**  | —                                                   | Secret for signing refresh tokens                 |
| `JWT_REFRESH_EXPIRES_IN` | No       | `7d`                                                | Refresh token expiry duration                     |
| `CORS_ORIGIN`            | No       | `http://localhost:5173`                             | Allowed CORS origin                               |
| `GOOGLE_CLIENT_ID`       | No       | `""`                                                | Google OAuth client ID                            |
| `GOOGLE_CLIENT_SECRET`   | No       | `""`                                                | Google OAuth client secret                        |
| `GOOGLE_CALLBACK_URL`    | No       | `http://localhost:4000/api/v1/auth/google/callback` | Google OAuth callback URL                         |
| `GITHUB_CLIENT_ID`       | No       | `""`                                                | GitHub OAuth client ID                            |
| `GITHUB_CLIENT_SECRET`   | No       | `""`                                                | GitHub OAuth client secret                        |
| `GITHUB_CALLBACK_URL`    | No       | `http://localhost:4000/api/v1/auth/github/callback` | GitHub OAuth callback URL                         |
| `CLOUDINARY_CLOUD_NAME`  | No       | `""`                                                | Cloudinary cloud name                             |
| `CLOUDINARY_API_KEY`     | No       | `""`                                                | Cloudinary API key                                |
| `CLOUDINARY_API_SECRET`  | No       | `""`                                                | Cloudinary API secret                             |
| `RESEND_API_KEY`         | No       | `""`                                                | Resend email API key                              |
| `EMAIL_FROM`             | No       | `noreply@lumora.app`                                | From address for emails                           |
| `RATE_LIMIT_WINDOW_MS`   | No       | `60000`                                             | Rate limit window in milliseconds                 |
| `RATE_LIMIT_MAX`         | No       | `100`                                               | Max requests per window                           |
| `REMEMBER_ME_DAYS`       | No       | `30`                                                | Remember-me session duration in days              |
| `SENTRY_DSN`             | No       | `""`                                                | Sentry error tracking DSN                         |
| `BETTER_STACK_TOKEN`     | No       | `""`                                                | Better Stack log ingestion token                  |

### Database Connection String Format

```env
# Standard
DATABASE_URL="postgresql://user:password@host:5432/lumora"

# With SSL
DATABASE_URL="postgresql://user:password@host:5432/lumora?sslmode=require"
```

---

## Docker Deployment

### Quick Start (Production)

```bash
# Clone and enter the project
git clone https://github.com/your-org/lumora.git
cd lumora

# Create environment file
cp .env.example .env
# EDIT .env with production values (especially JWT secrets and DATABASE_URL)

# Start all services (PostgreSQL, Redis, API, Web)
docker compose -f docker/docker-compose.yml up -d

# Run database migrations
docker compose -f docker/docker-compose.yml exec api npx prisma migrate deploy

# Seed the database (optional)
docker compose -f docker/docker-compose.yml exec api pnpm db:seed

# Check logs
docker compose -f docker/docker-compose.yml logs -f api web
```

The application is now available:

- **Web:** `http://localhost:5173`
- **API:** `http://localhost:4000`
- **API Docs:** `http://localhost:4000/api-docs`

### Docker Compose Architecture

```yaml
Services:
  postgres:16-alpine    # Database (exposed on :5432)
  redis:7-alpine        # Cache (exposed on :6379)
  api                   # Express API (exposed on :4000)
  web                   # Nginx + Vite build (exposed on :5173 -> :80)
```

### Nginx Configuration (`docker/nginx.conf`)

The web service uses Nginx to serve the built frontend and proxy API requests:

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;

  location / {
    try_files $uri $uri/ /index.html;  # SPA fallback
  }

  location /api {
    proxy_pass http://api:4000;         # Proxy to API container
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### Docker Image Details

**`Dockerfile.api`** — Multi-stage build:

1. `base` stage: Installs pnpm, copies workspace, installs dependencies, generates Prisma client, builds all packages
2. `production` stage: Fresh image with only runtime dependencies and compiled output (`node:20-alpine`, ~150MB)

**`Dockerfile.web`** — Multi-stage build:

1. `base` stage: Installs pnpm, builds the web app
2. `production` stage: Copies build output to `nginx:alpine` (~25MB)

### Manual Docker Build

```bash
# Build individual images
docker compose -f docker/docker-compose.yml build api
docker compose -f docker/docker-compose.yml build web

# Or build all at once
pnpm docker:build

# Run without compose
docker network create lumora
docker run -d --name lumora-postgres --network lumora -e POSTGRES_PASSWORD=lumora postgres:16-alpine
docker run -d --name lumora-redis --network lumora redis:7-alpine
docker run -d --name lumora-api --network lumora -p 4000:4000 -e DATABASE_URL=... lumora-api
```

---

## Database Setup

### Migrations

```bash
# Development (creates migration files)
pnpm --filter @lumora/database db:migrate

# Production (apply pending migrations)
docker compose exec api npx prisma migrate deploy

# Or via pnpm
pnpm --filter @lumora/database db:push
```

### Seed Data

```bash
pnpm db:seed
```

This populates the database with initial data defined in `packages/database/src/seed.ts`.

### Prisma Studio (Development)

```bash
pnpm db:studio
# Opens http://localhost:5555
```

---

## Production Checklist

### Pre-Deployment

- [ ] Generate strong JWT secrets: `openssl rand -hex 64`
- [ ] Set `NODE_ENV=production`
- [ ] Configure `DATABASE_URL` with SSL (`?sslmode=require`)
- [ ] Set `REDIS_URL` with authentication if required
- [ ] Set `CORS_ORIGIN` to the exact frontend domain
- [ ] Register OAuth callback URLs with Google and GitHub
- [ ] Configure Cloudinary credentials for media uploads
- [ ] Set `RESEND_API_KEY` for transactional emails
- [ ] Set `SENTRY_DSN` for error tracking
- [ ] Set `BETTER_STACK_TOKEN` for log aggregation
- [ ] Configure frontend `VITE_API_URL` environment variable
- [ ] Run database migrations
- [ ] Run test suite: `pnpm test:ci`
- [ ] Build and verify: `pnpm build`

### Post-Deployment

- [ ] Verify health endpoint: `GET /api/v1/health`
- [ ] Test user registration and login
- [ ] Verify OAuth flows (Google, GitHub)
- [ ] Check API docs are accessible at `/api-docs`
- [ ] Monitor logs for errors
- [ ] Verify rate limiting is active (429 responses on abuse)
- [ ] Check security headers via browser DevTools
- [ ] Verify CSRF protection on state-changing requests

### Security Hardening

- [ ] Enable PostgreSQL SSL
- [ ] Enable Redis password authentication
- [ ] Use a reverse proxy (Caddy, Nginx, Cloudflare) for TLS termination
- [ ] Set up database backups (automated, daily)
- [ ] Configure WAF rules (Cloudflare, AWS WAF)
- [ ] Enable fail2ban or similar for brute-force protection
- [ ] Restrict database to private network only
- [ ] Apply security patches regularly

---

## Deployment Options

### Railway

```bash
# Deploy with railway CLI
railway login
railway init
railway up
```

**Configuration:**

- Set environment variables via Railway dashboard
- Use Railway PostgreSQL and Redis plugins
- Automatic HTTPS and custom domains

### Render

```bash
# Deploy via Git - Blueprint (render.yaml)
services:
  - type: web
    name: lumora-api
    env: docker
    dockerfilePath: ./docker/Dockerfile.api
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: lumora-db
          property: connectionString

  - type: web
    name: lumora-web
    env: docker
    dockerfilePath: ./docker/Dockerfile.web

databases:
  - name: lumora-db
    database: lumora
    plan: starter

  - name: lumora-redis
    plan: free
```

### Fly.io

```bash
# Deploy with fly CLI
fly launch
fly deploy
```

**`fly.toml` for API:**

```toml
[build]
  dockerfile = "docker/Dockerfile.api"

[[services]]
  internal_port = 4000
  protocol = "tcp"

[[services.ports]]
  handlers = ["http"]
  port = 80

[[services.ports]]
  handlers = ["tls", "http"]
  port = 443
```

### DigitalOcean App Platform

- Create a PostgreSQL database (Managed Database)
- Create a Redis database (Managed Database)
- Deploy API as a service with Dockerfile
- Deploy Web as a static site (or service with Dockerfile)
- Set environment variables in App Platform dashboard

### AWS (Manual)

**ECS / ECR:**

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker build -f docker/Dockerfile.api -t lumora-api .
docker tag lumora-api:latest <account>.dkr.ecr.us-east-1.amazonaws.com/lumora-api:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/lumora-api:latest
```

**Services needed:**

- **RDS** (PostgreSQL) — managed database
- **ElastiCache** (Redis) — caching
- **ECS Fargate** — container orchestration
- **ALB** — load balancing and TLS termination
- **CloudFront** — CDN for static assets
- **S3** — static asset storage (if not using Nginx)
- **SES** — transactional emails
- **CloudWatch** — logging and monitoring

---

## CI/CD Pipeline

**GitHub Actions:** `.github/workflows/ci.yml`

The CI pipeline runs on every push to `main`/`develop` and on PRs to `main`:

| Job         | Steps                                         | Dependencies                 |
| ----------- | --------------------------------------------- | ---------------------------- |
| `typecheck` | pnpm install → pnpm typecheck                 | None                         |
| `lint`      | pnpm install → pnpm lint                      | None                         |
| `test`      | pnpm install → pnpm build → pnpm test:ci      | PostgreSQL service container |
| `build`     | pnpm install → pnpm build → pnpm docker:build | typecheck, lint, test pass   |

Docker build only runs on `main` branch pushes.

---

## Monitoring

### Logging

- **Winston** — structured JSON logging (console transport)
- **Better Stack** — log aggregation (set `BETTER_STACK_TOKEN`)
- **Log levels:** `error`, `warn`, `info`, `debug` (configurable via `LOG_LEVEL`)
- In production, logs are JSON-formatted for machine parsing

### Error Tracking

- **Sentry** — set `SENTRY_DSN` for error tracking
- Unhandled errors return `500` with `INTERNAL_ERROR` code (details hidden in production)

### Health Check

```http
GET /api/v1/health
Response: { "success": true, "data": { "status": "ok", "timestamp": "..." } }
```
