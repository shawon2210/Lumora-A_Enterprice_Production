import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/jwt';

describe('JWT Utilities', () => {
  const testPayload = { sub: 'user-123', role: 'USER' as const };

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-for-testing';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing';
  });

  afterAll(() => {
    delete process.env.JWT_ACCESS_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
  });

  describe('signAccessToken', () => {
    it('should sign an access token', () => {
      const token = signAccessToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

it('should include correct payload in token', () => {
      const token = signAccessToken(testPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.sub).toBe(testPayload.sub);
      expect(decoded.role).toBe(testPayload.role);
    });
  });

  describe('signRefreshToken', () => {
    it('should sign a refresh token', () => {
      const token = signRefreshToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should include correct payload in refresh token', () => {
      const token = signRefreshToken(testPayload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.sub).toBe(testPayload.sub);
      expect(decoded.role).toBe(testPayload.role);
    });
  });

  describe('verifyAccessToken', () => {
it('should verify a valid token', () => {
      const token = signAccessToken(testPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.sub).toBe(testPayload.sub);
      expect(decoded.role).toBe(testPayload.role);
    });

    it('should throw for invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
it('should verify a valid refresh token', () => {
      const token = signRefreshToken(testPayload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.sub).toBe(testPayload.sub);
      expect(decoded.role).toBe(testPayload.role);
    });

    it('should throw for invalid refresh token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });
  });
});