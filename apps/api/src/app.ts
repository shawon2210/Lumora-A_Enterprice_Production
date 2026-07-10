import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import { config } from '@/config/env';
import { swaggerSpec } from '@/config/swagger';
import { configurePassport } from '@/config/passport';
import { errorHandler } from '@/middleware/error-handler';
import { securityHeaders } from '@/middleware/security';
import { generateCsrfToken } from '@/middleware/csrf';
import { requestId } from '@/middleware/request-id';
import { requestLogger } from '@/middleware/request-logger';

import authRoutes from '@/modules/auth/auth.routes';
import blogRoutes from '@/modules/blog/blog.routes';
import mediaRoutes from '@/modules/media/media.routes';
import adminRoutes from '@/modules/admin/admin.routes';
import notificationRoutes from '@/modules/notifications/notifications.routes';
import searchRoutes from '@/modules/search/search.routes';
import userRoutes from '@/modules/user/user.routes';

const app: express.Express = express();

// Security headers (before helmet for additional protection)
app.use(securityHeaders);

// Helmet with custom config
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
  }),
);

app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(requestId);
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Passport initialization for OAuth
configurePassport();
app.use(passport.initialize());

// Generate CSRF tokens for authenticated routes
app.use(generateCsrfToken);

// Global rate limiting
app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' },
    },
  }),
);

const api = config.apiPrefix;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

app.use(`${api}/auth`, authRoutes);
app.use(`${api}/blog`, blogRoutes);
app.use(`${api}/media`, mediaRoutes);
app.use(`${api}/admin`, adminRoutes);
app.use(`${api}/user/notifications`, notificationRoutes);
app.use(`${api}/search`, searchRoutes);
app.use(`${api}/user`, userRoutes);

// Health endpoints
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get(`${api}/health`, (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.get('/ready', async (_req, res) => {
  try {
    const { prisma } = await import('@lumora/database');
    await prisma.$queryRaw`SELECT 1`;
    const io = (globalThis as any).io;
    res.json({ status: 'ok', database: 'connected', socketio: !!io });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.get('/live', (_req, res) => {
  res.json({ status: 'alive' });
});

app.use(errorHandler);

export default app;
