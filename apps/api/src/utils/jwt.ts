import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '@/config/env';

export interface TokenPayload {
  sub: string;
  role: string;
}

export function signAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload as object, config.jwt.accessSecret, options);
}

export function signRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload as object, config.jwt.refreshSecret, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
}
