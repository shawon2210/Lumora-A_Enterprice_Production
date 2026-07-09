import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '@/utils/errors';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const errors: Record<string, string[]> = {};

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.body = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      } else {
        req.body = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.query = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      } else {
        req.query = result.data;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.params = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      } else {
        req.params = result.data as Record<string, string>;
      }
    }

    if (Object.keys(errors).length > 0) {
      return next(new ValidationError(errors));
    }

    next();
  };
}
