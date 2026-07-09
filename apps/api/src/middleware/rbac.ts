import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '@/utils/errors';

type Role = 'USER' | 'MODERATOR' | 'ADMIN';

const roleHierarchy: Record<Role, number> = {
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2,
};

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    const userRole = req.user.role as Role;
    const requiredLevel = Math.max(...roles.map((r) => roleHierarchy[r]));
    const userLevel = roleHierarchy[userRole];

    if (userLevel < requiredLevel) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  return requireRole('ADMIN')(req, _res, next);
}
