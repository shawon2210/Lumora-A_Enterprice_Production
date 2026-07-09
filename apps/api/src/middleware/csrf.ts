import type { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'node:crypto';
import { UnauthorizedError } from '@/utils/errors';

// CSRF protection using double-submit cookie pattern
export function csrfProtection(required = true) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!required || req.method === 'GET') {
      return next();
    }

    const headerToken = req.headers['x-csrf-token'] as string | undefined;
    const cookieToken = req.cookies?.csrfToken as string | undefined;

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      return next(new UnauthorizedError('CSRF token validation failed'));
    }

    next();
  };
}

// Generate CSRF token middleware
export function generateCsrfToken(_req: Request, res: Response, next: NextFunction) {
  const token = randomBytes(32).toString('hex');
  res.cookie('csrfToken', token, {
    httpOnly: false, // Must be readable by JS for double-submit pattern
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.locals.csrfToken = token;
  next();
}