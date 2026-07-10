import type { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      requestId: req.id,
      userId: req.user?.id,
    });
  });
  next();
}
