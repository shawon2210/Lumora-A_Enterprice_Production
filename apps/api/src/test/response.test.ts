import { describe, it, expect, vi } from 'vitest';
import { sendSuccess, sendPaginated, sendMessage, sendError } from '../utils/response';

function createMockRes() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json } as any);
  return { status, json } as any;
}

describe('sendSuccess', () => {
  it('should return 200 with data by default', () => {
    const res = createMockRes();
    sendSuccess(res, { id: '1', name: 'test' });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status().json).toHaveBeenCalledWith({
      success: true,
      data: { id: '1', name: 'test' },
      meta: undefined,
    });
  });

  it('should use provided status code', () => {
    const res = createMockRes();
    sendSuccess(res, { id: '1' }, undefined, 201);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.status().json).toHaveBeenCalledWith({
      success: true,
      data: { id: '1' },
      meta: undefined,
    });
  });

  it('should include pagination meta when provided', () => {
    const res = createMockRes();
    const meta = { page: 1, limit: 20, total: 50, totalPages: 3, hasNext: true, hasPrev: false };
    sendSuccess(res, [{ id: '1' }], meta);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status().json).toHaveBeenCalledWith({
      success: true,
      data: [{ id: '1' }],
      meta,
    });
  });
});

describe('sendPaginated', () => {
  it('should return 200 with data and meta', () => {
    const res = createMockRes();
    const meta = { page: 1, limit: 10, total: 25, totalPages: 3, hasNext: true, hasPrev: false };
    sendPaginated(res, [{ id: '1' }, { id: '2' }], meta);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status().json).toHaveBeenCalledWith({
      success: true,
      data: [{ id: '1' }, { id: '2' }],
      meta,
    });
  });
});

describe('sendMessage', () => {
  it('should return 200 with message by default', () => {
    const res = createMockRes();
    sendMessage(res, 'Operation successful');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status().json).toHaveBeenCalledWith({
      success: true,
      message: 'Operation successful',
    });
  });

  it('should use provided status code', () => {
    const res = createMockRes();
    sendMessage(res, 'Created', 201);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.status().json).toHaveBeenCalledWith({
      success: true,
      message: 'Created',
    });
  });
});

describe('sendError', () => {
  it('should return 400 with error by default', () => {
    const res = createMockRes();
    sendError(res, 'BAD_REQUEST', 'Invalid input');

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status().json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Invalid input', details: undefined },
    });
  });

  it('should use provided status code', () => {
    const res = createMockRes();
    sendError(res, 'NOT_FOUND', 'User not found', 404);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.status().json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'NOT_FOUND', message: 'User not found', details: undefined },
    });
  });

  it('should include details when provided', () => {
    const res = createMockRes();
    const details = { email: ['is required'] };
    sendError(res, 'VALIDATION_ERROR', 'Validation failed', 422, details);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.status().json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details },
    });
  });
});
