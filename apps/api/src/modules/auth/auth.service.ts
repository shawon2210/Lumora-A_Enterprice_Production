import { authRepository } from './auth.repository';
import { hashPassword, comparePassword } from '@/utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { generateToken } from '@/utils/crypto';
import { sendPasswordResetEmail } from '@/utils/email';
import { config } from '@/config/env';
import { UnauthorizedError, NotFoundError, ConflictError } from '@/utils/errors';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function createTokens(userId: string, role: string) {
  const payload = { sub: userId, role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

function excludePassword<T extends { password?: string | null }>(user: T): Omit<T, 'password'> {
  const { password: _, ...rest } = user;
  return rest;
}

export const authService = {
  async register(input: { email: string; password: string; name: string }) {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError('Email already in use');
    }

    const hashed = await hashPassword(input.password);
    const user = await authRepository.createUser({
      email: input.email,
      name: input.name,
      password: hashed,
    });

    const tokens = createTokens(user.id, user.role);
    const expiresAt = new Date(Date.now() + ONE_DAY_MS);
    await authRepository.createSession(user.id, tokens.accessToken, tokens.refreshToken, expiresAt);

    return { ...tokens, user: excludePassword(user) };
  },

  async login(input: { email: string; password: string }, rememberMe?: boolean) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user || !user.password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await comparePassword(input.password, user.password);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = createTokens(user.id, user.role);
    const days = rememberMe ? config.session.rememberMeDays : 1;
    const expiresAt = new Date(Date.now() + days * ONE_DAY_MS);
    await authRepository.createSession(user.id, tokens.accessToken, tokens.refreshToken, expiresAt);

    return { ...tokens, user: excludePassword(user) };
  },

  async logout(token: string) {
    await authRepository.deleteSession(token);
  },

  async refresh(refreshToken: string) {
    let payload: { sub: string; role: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const session = await authRepository.findSessionByRefreshToken(refreshToken);
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedError('Session expired or invalid');
    }

    await authRepository.deleteSession(session.token);

    const tokens = createTokens(session.user.id, session.user.role);
    const expiresAt = new Date(Date.now() + ONE_DAY_MS);
    await authRepository.createSession(session.user.id, tokens.accessToken, tokens.refreshToken, expiresAt);

    const refreshedUser = await authRepository.findUserById(payload.sub);
    if (!refreshedUser) {
      throw new UnauthorizedError('User not found');
    }
    return { ...tokens, user: excludePassword(refreshedUser) };
  },

  async forgotPassword(email: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Don't reveal whether email exists
      return { resetToken: null };
    }

    const resetToken = generateToken(32);
    const expiresAt = new Date(Date.now() + ONE_DAY_MS);
    await authRepository.createPasswordResetToken(email, resetToken, expiresAt);

    // Send email (in dev mode, logs to console)
    await sendPasswordResetEmail(email, resetToken);

    return { resetToken };
  },

  async resetPassword(token: string, newPassword: string) {
    const record = await authRepository.findPasswordResetToken(token);
    if (!record || record.used || record.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    const hashed = await hashPassword(newPassword);
    const user = await authRepository.findUserByEmail(record.email);
    if (!user) {
      throw new NotFoundError('User');
    }
    await authRepository.updateUserPassword(user.id, hashed);
    await authRepository.markResetTokenUsed(record.id);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await authRepository.findUserById(userId);
    if (!user || !user.password) {
      throw new UnauthorizedError('Invalid password');
    }
    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) {
      throw new UnauthorizedError('Current password is incorrect');
    }
    const hashed = await hashPassword(newPassword);
    await authRepository.updateUserPassword(userId, hashed);
    await authRepository.deleteUserSessions(userId);
  },

  async getProfile(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return excludePassword(user);
  },

  async handleOAuth(provider: string, profile: { sub: string; email: string; name: string }) {
    let account = await authRepository.findAccount(provider, profile.sub);
    if (account && account.user) {
      const tokens = createTokens(account.user.id, account.user.role);
      const expiresAt = new Date(Date.now() + ONE_DAY_MS);
      await authRepository.createSession(account.user.id, tokens.accessToken, tokens.refreshToken, expiresAt);
      return { ...tokens, user: excludePassword(account.user), isNew: false };
    }

    let user = profile.email ? await authRepository.findUserByEmail(profile.email) : null;
    if (user) {
      account = await authRepository.createAccount({
        provider,
        providerAccountId: profile.sub,
        type: 'oauth',
        user: { connect: { id: user.id } },
      });
    } else {
      user = await authRepository.createUser({
        email: profile.email,
        name: profile.name,
        password: '',
      });
      account = await authRepository.createAccount({
        provider,
        providerAccountId: profile.sub,
        type: 'oauth',
        user: { connect: { id: user.id } },
      });
    }

    if (!user) {
      throw new NotFoundError('User');
    }

    const tokens = createTokens(user.id, user.role);
    const expiresAt = new Date(Date.now() + ONE_DAY_MS);
    await authRepository.createSession(user.id, tokens.accessToken, tokens.refreshToken, expiresAt);

    return { ...tokens, user: excludePassword(user), isNew: true };
  },
};
