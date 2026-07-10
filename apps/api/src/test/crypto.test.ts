import { describe, it, expect } from 'vitest';
import { generateToken, generateNumericCode } from '../utils/crypto';

describe('generateToken', () => {
  it('should return a hex string', () => {
    const token = generateToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(/^[0-9a-f]+$/.test(token)).toBe(true);
  });

  it('should return 64 hex characters by default (32 bytes)', () => {
    const token = generateToken();
    expect(token.length).toBe(64);
  });

  it('should return correct length for custom byte count', () => {
    const token = generateToken(16);
    expect(token.length).toBe(32);
  });

  it('should return correct length for 8 bytes', () => {
    const token = generateToken(8);
    expect(token.length).toBe(16);
  });

  it('should generate unique tokens each call', () => {
    const tokens = new Set<string>();
    const count = 100;
    for (let i = 0; i < count; i++) {
      tokens.add(generateToken());
    }
    expect(tokens.size).toBe(count);
  });
});

describe('generateNumericCode', () => {
  it('should return a string', () => {
    const code = generateNumericCode();
    expect(typeof code).toBe('string');
  });

  it('should return 6 digits by default', () => {
    const code = generateNumericCode();
    expect(code.length).toBe(6);
  });

  it('should return correct length for custom length', () => {
    const code = generateNumericCode(4);
    expect(code.length).toBe(4);
  });

  it('should contain only digits', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateNumericCode();
      expect(/^\d+$/.test(code)).toBe(true);
    }
  });

  it('should generate unique codes', () => {
    const codes = new Set<string>();
    const count = 100;
    for (let i = 0; i < count; i++) {
      codes.add(generateNumericCode(8));
    }
    expect(codes.size).toBe(count);
  });
});
