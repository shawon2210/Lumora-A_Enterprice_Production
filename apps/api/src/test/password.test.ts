import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { hashPassword, comparePassword } from '../utils/password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password correctly', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2')).toBe(true);
      expect(hash.length).toBe(60);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const result = await comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const result = await comparePassword('WrongPassword!', hash);

      expect(result).toBe(false);
    });

    it('should return false for invalid hash', async () => {
      const result = await comparePassword('TestPassword123!', '$2a$12$invalidhash');

      expect(result).toBe(false);
    });
  });
});