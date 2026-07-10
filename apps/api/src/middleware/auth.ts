import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt';
import { prisma } from '@lumora/database';
import { UnauthorizedError } from '@/utils/errors';
import type { User } from '@lumora/shared';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid authorization header'));
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        subscription: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      return next(new UnauthorizedError('User not found'));
    }
    req.user = user as User;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next();
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    prisma.user
      .findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          subscription: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      .then((user) => {
        if (user) req.user = user as User;
        next();
      })
      .catch(() => next());
  } catch {
    next();
  }
}
