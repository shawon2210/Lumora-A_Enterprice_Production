import crypto from 'node:crypto';

export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function generateNumericCode(length = 6): string {
  return Array.from(crypto.randomBytes(length), (b) => (b % 10).toString()).join('');
}
