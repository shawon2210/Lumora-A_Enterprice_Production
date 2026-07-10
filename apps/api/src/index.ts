import app from '@/app';
import { config } from '@/config/env';
import { logger } from '@/utils/logger';
import { prisma } from '@lumora/database';
import { createServer } from 'node:http';
import type { Server as HttpServer } from 'node:http';

interface SocketWithUserId {
  userId?: string;
  join: (room: string) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  handshake?: {
    auth?: {
      token?: string;
    };
  };
}

interface SocketIO {
  use: (middleware: (socket: SocketWithUserId, next: (err?: Error) => void) => void) => void;
  on: (event: string, callback: (socket: SocketWithUserId) => void) => void;
}

async function main() {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL');
  } catch (err) {
    logger.error('Failed to connect to database:', err);
    process.exit(1);
  }

  const httpServer: HttpServer = createServer(app);

  let io: SocketIO | null = null;
  try {
    const { Server } = await import('socket.io');
    const { verifyAccessToken } = await import('@/utils/jwt');
    io = new Server(httpServer, {
      cors: { origin: config.cors.origin, credentials: true },
    });
    io.use(async (socket: SocketWithUserId, next: (err?: Error) => void) => {
      const token = socket.handshake?.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      try {
        const payload = verifyAccessToken(token);
        socket.userId = payload.sub;
        next();
      } catch {
        next(new Error('Invalid token'));
      }
    });
    io.on('connection', (socket: SocketWithUserId) => {
      const userId = socket.userId;
      socket.join(`user:${userId}`);
      logger.info(`Socket connected: user ${userId}`);
      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: user ${userId}`);
      });
    });
  } catch {
    logger.warn('Socket.IO not available');
  }

  (globalThis as Record<string, unknown>).io = io;

  httpServer.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
    logger.info(`API: http://localhost:${config.port}${config.apiPrefix}`);
    logger.info(`Docs: http://localhost:${config.port}/api-docs`);
  });
}

main().catch((err) => {
  logger.error('Fatal error:', err);
  process.exit(1);
});
