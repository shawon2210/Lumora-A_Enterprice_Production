import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { errorHandler } from '../../middleware/error-handler';
import { NotFoundError, ValidationError } from '../../utils/errors';
import { logger } from '../../utils/logger';

vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

function createMockReqRes() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json } as any);
  return { req: {} as any, res: { status, json } as any, next: vi.fn() };
}

describe('errorHandler', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return AppError with correct status and code', () => {
    const { req, res, next } = createMockReqRes();
    const error = new NotFoundError('User');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.status().json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'NOT_FOUND', message: 'User not found', details: undefined },
    });
  });

  it('should include details when present on ValidationError', () => {
    const { req, res, next } = createMockReqRes();
    const details = { email: ['is required'] };
    const error = new ValidationError(details);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.status().json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details },
    });
  });

  it('should return 500 for unknown errors in test environment', () => {
    const { req, res, next } = createMockReqRes();
    const error = new Error('Something went wrong');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.status().json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
    });
  });

  it('should hide error message for unknown errors in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { req, res, next } = createMockReqRes();
    const error = new Error('Database connection failed');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.status().json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  });

  it('should expose error message for unknown errors in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { req, res, next } = createMockReqRes();
    const error = new Error('Debug error details');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.status().json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Debug error details' },
    });
  });

  it('should log unknown errors', () => {
    const { req, res, next } = createMockReqRes();
    const error = new Error('Log me');

    errorHandler(error, req, res, next);

    expect(logger.error).toHaveBeenCalledWith('Unhandled error:', error);
  });

  it('should not log AppError instances', () => {
    const { req, res, next } = createMockReqRes();
    const error = new NotFoundError('Post');

    errorHandler(error, req, res, next);

    expect(logger.error).not.toHaveBeenCalled();
  });
});
