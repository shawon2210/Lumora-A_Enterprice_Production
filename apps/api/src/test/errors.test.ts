import { describe, it, expect } from 'vitest';
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError,
  RateLimitError,
} from '../utils/errors';

describe('AppError', () => {
  it('should create an error with statusCode, code, message, and name', () => {
    const err = new AppError(418, 'TEAPOT', "I'm a teapot");
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe('TEAPOT');
    expect(err.message).toBe("I'm a teapot");
    expect(err.name).toBe('AppError');
  });

  it('should accept optional details', () => {
    const details = { field: ['is required'] };
    const err = new AppError(400, 'BAD_REQUEST', 'Bad request', details);
    expect(err.details).toEqual(details);
  });

  it('should have undefined details when not provided', () => {
    const err = new AppError(400, 'BAD_REQUEST', 'Bad request');
    expect(err.details).toBeUndefined();
  });
});

describe('NotFoundError', () => {
  it('should have status 404 and code NOT_FOUND', () => {
    const err = new NotFoundError('User');
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
  });

  it('should include entity name in message', () => {
    const err = new NotFoundError('BlogPost');
    expect(err.message).toBe('BlogPost not found');
  });
});

describe('UnauthorizedError', () => {
  it('should have status 401 and code UNAUTHORIZED', () => {
    const err = new UnauthorizedError();
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('should use default message', () => {
    const err = new UnauthorizedError();
    expect(err.message).toBe('Unauthorized');
  });

  it('should accept custom message', () => {
    const err = new UnauthorizedError('Invalid token');
    expect(err.message).toBe('Invalid token');
  });
});

describe('ForbiddenError', () => {
  it('should have status 403 and code FORBIDDEN', () => {
    const err = new ForbiddenError();
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('should use default message', () => {
    const err = new ForbiddenError();
    expect(err.message).toBe('Forbidden');
  });

  it('should accept custom message', () => {
    const err = new ForbiddenError('Not enough permissions');
    expect(err.message).toBe('Not enough permissions');
  });
});

describe('ConflictError', () => {
  it('should have status 409 and code CONFLICT', () => {
    const err = new ConflictError('Email already exists');
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
  });

  it('should use provided message', () => {
    const err = new ConflictError('Slug already taken');
    expect(err.message).toBe('Slug already taken');
  });
});

describe('ValidationError', () => {
  it('should have status 422 and code VALIDATION_ERROR', () => {
    const details = { email: ['is invalid'] };
    const err = new ValidationError(details);
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe('VALIDATION_ERROR');
  });

  it('should store validation details', () => {
    const details = { email: ['is required', 'must be valid'], password: ['too short'] };
    const err = new ValidationError(details);
    expect(err.details).toEqual(details);
  });

  it('should have default message', () => {
    const err = new ValidationError({ field: ['error'] });
    expect(err.message).toBe('Validation failed');
  });
});

describe('RateLimitError', () => {
  it('should have status 429 and code RATE_LIMIT_EXCEEDED', () => {
    const err = new RateLimitError();
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('should have rate limit message', () => {
    const err = new RateLimitError();
    expect(err.message).toBe('Too many requests, please try again later');
  });
});
