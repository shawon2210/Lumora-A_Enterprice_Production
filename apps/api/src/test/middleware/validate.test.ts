/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { ValidationError } from '../../utils/errors';

function createMockReqRes(body = {}, query = {}, params = {}) {
  const req = { body, query, params } as any;
  const res = {} as any;
  const next = vi.fn();
  return { req, res, next };
}

describe('validate middleware', () => {
  const bodySchema = z.object({ name: z.string().min(1), email: z.string().email() });
  const querySchema = z.object({ page: z.coerce.number().int().positive() });
  const paramsSchema = z.object({ id: z.string().uuid() });

  describe('body validation', () => {
    it('should pass when body is valid', () => {
      const { req, res, next } = createMockReqRes({ name: 'Test', email: 'test@example.com' });
      const middleware = validate({ body: bodySchema });

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should replace req.body with parsed data on success', () => {
      const { req, res, next } = createMockReqRes({ name: 'Test', email: 'test@example.com' });
      const middleware = validate({ body: bodySchema });

      middleware(req, res, next);

      expect(req.body).toEqual({ name: 'Test', email: 'test@example.com' });
    });

    it('should call next with ValidationError when body is invalid', () => {
      const { req, res, next } = createMockReqRes({ name: '', email: 'invalid' });
      const middleware = validate({ body: bodySchema });

      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toBeDefined();
      expect(error.details!.body).toBeDefined();
      expect(Array.isArray(error.details!.body)).toBe(true);
      expect(error.details!.body.length).toBeGreaterThan(0);
    });

    it('should not modify req.body on validation failure', () => {
      const original = { name: '', email: 'invalid' };
      const { req, res, next } = createMockReqRes(original);
      const middleware = validate({ body: bodySchema });

      middleware(req, res, next);

      expect(req.body).toBe(original);
    });
  });

  describe('query validation', () => {
    it('should pass when query is valid', () => {
      const { req, res, next } = createMockReqRes({}, { page: '1' });
      const middleware = validate({ query: querySchema });

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should replace req.query with parsed data on success', () => {
      const { req, res, next } = createMockReqRes({}, { page: '1' });
      const middleware = validate({ query: querySchema });

      middleware(req, res, next);

      expect(req.query).toEqual({ page: 1 });
    });

    it('should call next with ValidationError when query is invalid', () => {
      const { req, res, next } = createMockReqRes({}, { page: '-1' });
      const middleware = validate({ query: querySchema });

      middleware(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.details!.query).toBeDefined();
    });
  });

  describe('params validation', () => {
    it('should pass when params are valid', () => {
      const { req, res, next } = createMockReqRes({}, {}, { id: '550e8400-e29b-41d4-a716-446655440000' });
      const middleware = validate({ params: paramsSchema });

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should replace req.params with parsed data on success', () => {
      const { req, res, next } = createMockReqRes({}, {}, { id: '550e8400-e29b-41d4-a716-446655440000' });
      const middleware = validate({ params: paramsSchema });

      middleware(req, res, next);

      expect(req.params).toEqual({ id: '550e8400-e29b-41d4-a716-446655440000' });
    });

    it('should call next with ValidationError when params are invalid', () => {
      const { req, res, next } = createMockReqRes({}, {}, { id: 'not-a-uuid' });
      const middleware = validate({ params: paramsSchema });

      middleware(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.details!.params).toBeDefined();
    });
  });

  describe('multiple schemas', () => {
    it('should validate body and params together', () => {
      const { req, res, next } = createMockReqRes(
        { name: 'Test', email: 'test@example.com' },
        {},
        { id: '550e8400-e29b-41d4-a716-446655440000' },
      );
      const middleware = validate({ body: bodySchema, params: paramsSchema });

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body).toEqual({ name: 'Test', email: 'test@example.com' });
      expect(req.params).toEqual({ id: '550e8400-e29b-41d4-a716-446655440000' });
    });

    it('should collect errors from multiple failing schemas', () => {
      const { req, res, next } = createMockReqRes({ name: '', email: 'bad' }, {}, { id: 'invalid' });
      const middleware = validate({ body: bodySchema, params: paramsSchema });

      middleware(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.details!.body).toBeDefined();
      expect(error.details!.params).toBeDefined();
    });
  });

  describe('no schemas', () => {
    it('should call next when no schemas are provided', () => {
      const { req, res, next } = createMockReqRes();
      const middleware = validate({});

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });
});
