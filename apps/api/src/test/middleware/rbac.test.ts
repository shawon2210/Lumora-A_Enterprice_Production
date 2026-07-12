/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { requireRole, requireAdmin } from '../../middleware/rbac';
import { ForbiddenError } from '../../utils/errors';

function createMockReqRes(user?: { role: string }) {
  const req = { user: user ?? null } as any;
  const res = {} as any;
  const next = vi.fn();
  return { req, res, next };
}

describe('requireRole', () => {
  it('should call next() when user has matching role', () => {
    const { req, res, next } = createMockReqRes({ role: 'USER' });
    const middleware = requireRole('USER');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should call next() when user has MODERATOR role for MODERATOR requirement', () => {
    const { req, res, next } = createMockReqRes({ role: 'MODERATOR' });
    const middleware = requireRole('MODERATOR');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should call next() when user has ADMIN role for ADMIN requirement', () => {
    const { req, res, next } = createMockReqRes({ role: 'ADMIN' });
    const middleware = requireRole('ADMIN');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should pass for higher role (hierarchical) - MODERATOR satisfies USER', () => {
    const { req, res, next } = createMockReqRes({ role: 'MODERATOR' });
    const middleware = requireRole('USER');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should pass for higher role (hierarchical) - ADMIN satisfies USER', () => {
    const { req, res, next } = createMockReqRes({ role: 'ADMIN' });
    const middleware = requireRole('USER');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should pass for higher role (hierarchical) - ADMIN satisfies MODERATOR', () => {
    const { req, res, next } = createMockReqRes({ role: 'ADMIN' });
    const middleware = requireRole('MODERATOR');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should block for insufficient role - USER cannot satisfy MODERATOR', () => {
    const { req, res, next } = createMockReqRes({ role: 'USER' });
    const middleware = requireRole('MODERATOR');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error.message).toBe('Insufficient permissions');
  });

  it('should block for insufficient role - MODERATOR cannot satisfy ADMIN', () => {
    const { req, res, next } = createMockReqRes({ role: 'MODERATOR' });
    const middleware = requireRole('ADMIN');

    middleware(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error.message).toBe('Insufficient permissions');
  });

  it('should block unauthenticated requests', () => {
    const { req, res, next } = createMockReqRes();
    const middleware = requireRole('USER');

    middleware(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error.message).toBe('Authentication required');
  });

  it('should pass with multiple roles when user satisfies highest', () => {
    const { req, res, next } = createMockReqRes({ role: 'ADMIN' });
    const middleware = requireRole('USER', 'MODERATOR');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should block with multiple roles when user cannot satisfy highest', () => {
    const { req, res, next } = createMockReqRes({ role: 'USER' });
    const middleware = requireRole('USER', 'MODERATOR');

    middleware(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error.message).toBe('Insufficient permissions');
  });
});

describe('requireAdmin', () => {
  it('should pass for ADMIN role', () => {
    const { req, res, next } = createMockReqRes({ role: 'ADMIN' });

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should block for USER role', () => {
    const { req, res, next } = createMockReqRes({ role: 'USER' });

    requireAdmin(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error.message).toBe('Insufficient permissions');
  });

  it('should block for MODERATOR role', () => {
    const { req, res, next } = createMockReqRes({ role: 'MODERATOR' });

    requireAdmin(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error.message).toBe('Insufficient permissions');
  });

  it('should block for unauthenticated requests', () => {
    const { req, res, next } = createMockReqRes();

    requireAdmin(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error.message).toBe('Authentication required');
  });
});
