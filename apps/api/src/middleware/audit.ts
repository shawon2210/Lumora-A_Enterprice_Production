import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@lumora/database';
import type { Prisma } from '@prisma/client';

export function auditLog(action: string, entity: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const originalSend = _res.json.bind(_res);
    _res.json = function (body: unknown) {
      if (_res.statusCode < 400 && req.user) {
        prisma.auditLog
          .create({
            data: {
              userId: req.user.id,
              action,
              entity,
              entityId:
                (req.params.id as string)?.toString() ?? ((body as Record<string, unknown>)?.id as string) ?? null,
              metadata: JSON.parse(
                JSON.stringify({ method: req.method, path: req.path, body: sanitizeBody(req.body) }),
              ) as Prisma.InputJsonValue,
              ip: req.ip || null,
              userAgent: req.headers['user-agent'] || null,
            },
          })
          .catch(() => {});
      }
      return originalSend.call(this, body);
    };
    next();
  };
}

function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.currentPassword;
  delete sanitized.newPassword;
  return sanitized;
}
