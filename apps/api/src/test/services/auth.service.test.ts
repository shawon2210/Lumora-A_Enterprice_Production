import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@/modules/auth/auth.service';
import { authRepository } from '@/modules/auth/auth.repository';
import { hashPassword, comparePassword } from '@/utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { generateToken } from '@/utils/crypto';
import { sendPasswordResetEmail } from '@/utils/email';
import { UnauthorizedError, NotFoundError, ConflictError } from '@/utils/errors';

vi.mock('@/modules/auth/auth.repository');
vi.mock('@/utils/password');
vi.mock('@/utils/jwt');
vi.mock('@/utils/crypto');
vi.mock('@/utils/email');

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  password: '$2a$12$hashedpassword',
  role: 'USER' as const,
  avatar: null,
  subscription: 'FREE' as const,
  emailVerified: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockSession = {
  id: 'session-1',
  token: 'access-token-1',
  refreshToken: 'refresh-token-1',
  userId: 'user-1',
  expiresAt: new Date(Date.now() + 86400000),
  createdAt: new Date(),
  user: mockUser,
};

const mockResetToken = {
  id: 'reset-1',
  email: 'test@example.com',
  token: 'reset-token-abc',
  expiresAt: new Date(Date.now() + 86400000),
  used: false,
  createdAt: new Date(),
};

const mockAccount = {
  id: 'account-1',
  provider: 'google',
  providerAccountId: 'google-sub-123',
  type: 'oauth',
  userId: 'user-1',
  user: mockUser,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('authService.register', () => {
  it('creates user, hashes password, creates session, returns tokens', async () => {
    const input = { email: 'test@example.com', password: 'password123', name: 'Test User' };
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
    vi.mocked(hashPassword).mockResolvedValue('$2a$12$hashedpassword');
    vi.mocked(authRepository.createUser).mockResolvedValue(mockUser);
    vi.mocked(signAccessToken).mockReturnValue('access-token-1');
    vi.mocked(signRefreshToken).mockReturnValue('refresh-token-1');
    vi.mocked(authRepository.createSession).mockResolvedValue(mockSession as any);

    const result = await authService.register(input);

    expect(authRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(hashPassword).toHaveBeenCalledWith('password123');
    expect(authRepository.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'Test User',
      password: '$2a$12$hashedpassword',
    });
    expect(authRepository.createSession).toHaveBeenCalledWith(
      'user-1',
      'access-token-1',
      'refresh-token-1',
      expect.any(Date),
    );
    expect(result.accessToken).toBe('access-token-1');
    expect(result.refreshToken).toBe('refresh-token-1');
    expect(result.user).not.toHaveProperty('password');
    expect(result.user.email).toBe('test@example.com');
  });

  it('throws ConflictError if email exists', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUser);

    await expect(
      authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    ).rejects.toThrow(ConflictError);

    expect(authRepository.createUser).not.toHaveBeenCalled();
  });
});

describe('authService.login', () => {
  it('authenticates user, creates session, returns tokens', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUser);
    vi.mocked(comparePassword).mockResolvedValue(true);
    vi.mocked(signAccessToken).mockReturnValue('access-token-1');
    vi.mocked(signRefreshToken).mockReturnValue('refresh-token-1');
    vi.mocked(authRepository.createSession).mockResolvedValue(mockSession as any);

    const result = await authService.login({ email: 'test@example.com', password: 'password123' });

    expect(comparePassword).toHaveBeenCalledWith('password123', mockUser.password);
    expect(authRepository.createSession).toHaveBeenCalledWith(
      'user-1',
      'access-token-1',
      'refresh-token-1',
      expect.any(Date),
    );
    expect(result.accessToken).toBe('access-token-1');
    expect(result.user).not.toHaveProperty('password');
  });

  it('supports rememberMe flag for extended session', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUser);
    vi.mocked(comparePassword).mockResolvedValue(true);
    vi.mocked(signAccessToken).mockReturnValue('access-token-1');
    vi.mocked(signRefreshToken).mockReturnValue('refresh-token-1');
    vi.mocked(authRepository.createSession).mockResolvedValue(mockSession as any);

    await authService.login({ email: 'test@example.com', password: 'password123' }, true);

    expect(authRepository.createSession).toHaveBeenCalled();
  });

  it('throws UnauthorizedError for invalid email', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'wrong@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it('throws UnauthorizedError for wrong password', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUser);
    vi.mocked(comparePassword).mockResolvedValue(false);

    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it('throws UnauthorizedError if no password (OAuth user)', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue({ ...mockUser, password: '' });

    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(UnauthorizedError);
  });
});

describe('authService.logout', () => {
  it('deletes session', async () => {
    vi.mocked(authRepository.deleteSession).mockResolvedValue(mockSession as any);

    await authService.logout('some-token');

    expect(authRepository.deleteSession).toHaveBeenCalledWith('some-token');
  });
});

describe('authService.refresh', () => {
  it('verifies refresh token, rotates session, returns new tokens', async () => {
    vi.mocked(verifyRefreshToken).mockReturnValue({ sub: 'user-1', role: 'USER' });
    vi.mocked(authRepository.findSessionByRefreshToken).mockResolvedValue(mockSession as any);
    vi.mocked(authRepository.deleteSession).mockResolvedValue(mockSession as any);
    vi.mocked(signAccessToken).mockReturnValue('new-access-token');
    vi.mocked(signRefreshToken).mockReturnValue('new-refresh-token');
    vi.mocked(authRepository.createSession).mockResolvedValue(mockSession as any);
    vi.mocked(authRepository.findUserById).mockResolvedValue(mockUser);

    const result = await authService.refresh('refresh-token-1');

    expect(verifyRefreshToken).toHaveBeenCalledWith('refresh-token-1');
    expect(authRepository.findSessionByRefreshToken).toHaveBeenCalledWith('refresh-token-1');
    expect(authRepository.deleteSession).toHaveBeenCalledWith('access-token-1');
    expect(authRepository.createSession).toHaveBeenCalledWith(
      'user-1',
      'new-access-token',
      'new-refresh-token',
      expect.any(Date),
    );
    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(result.user).not.toHaveProperty('password');
  });

  it('throws UnauthorizedError for invalid token', async () => {
    vi.mocked(verifyRefreshToken).mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    await expect(authService.refresh('bad-token')).rejects.toThrow(UnauthorizedError);
  });

  it('throws UnauthorizedError for expired session', async () => {
    vi.mocked(verifyRefreshToken).mockReturnValue({ sub: 'user-1', role: 'USER' });
    vi.mocked(authRepository.findSessionByRefreshToken).mockResolvedValue({
      ...mockSession,
      expiresAt: new Date(Date.now() - 86400000),
    } as any);

    await expect(authService.refresh('expired-token')).rejects.toThrow(UnauthorizedError);
  });

  it('throws UnauthorizedError for missing session', async () => {
    vi.mocked(verifyRefreshToken).mockReturnValue({ sub: 'user-1', role: 'USER' });
    vi.mocked(authRepository.findSessionByRefreshToken).mockResolvedValue(null);

    await expect(authService.refresh('ghost-token')).rejects.toThrow(UnauthorizedError);
  });

  it('throws UnauthorizedError if user not found after refresh', async () => {
    vi.mocked(verifyRefreshToken).mockReturnValue({ sub: 'user-1', role: 'USER' });
    vi.mocked(authRepository.findSessionByRefreshToken).mockResolvedValue(mockSession as any);
    vi.mocked(authRepository.deleteSession).mockResolvedValue(mockSession as any);
    vi.mocked(signAccessToken).mockReturnValue('new-access-token');
    vi.mocked(signRefreshToken).mockReturnValue('new-refresh-token');
    vi.mocked(authRepository.createSession).mockResolvedValue(mockSession as any);
    vi.mocked(authRepository.findUserById).mockResolvedValue(null);

    await expect(authService.refresh('refresh-token-1')).rejects.toThrow(UnauthorizedError);
  });
});

describe('authService.forgotPassword', () => {
  it('creates reset token, sends email, returns token', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUser);
    vi.mocked(generateToken).mockReturnValue('reset-token-abc');
    vi.mocked(authRepository.createPasswordResetToken).mockResolvedValue(mockResetToken);
    vi.mocked(sendPasswordResetEmail).mockResolvedValue(true);

    const result = await authService.forgotPassword('test@example.com');

    expect(generateToken).toHaveBeenCalledWith(32);
    expect(authRepository.createPasswordResetToken).toHaveBeenCalledWith(
      'test@example.com',
      'reset-token-abc',
      expect.any(Date),
    );
    expect(sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com', 'reset-token-abc');
    expect(result.resetToken).toBe('reset-token-abc');
  });

  it('returns silently if email not found (dont reveal existence)', async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);

    const result = await authService.forgotPassword('unknown@example.com');

    expect(result).toEqual({ resetToken: null });
    expect(authRepository.createPasswordResetToken).not.toHaveBeenCalled();
  });
});

describe('authService.resetPassword', () => {
  it('updates password and marks token used', async () => {
    vi.mocked(authRepository.findPasswordResetToken).mockResolvedValue(mockResetToken);
    vi.mocked(hashPassword).mockResolvedValue('$2a$12$newhash');
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUser);
    vi.mocked(authRepository.updateUserPassword).mockResolvedValue(mockUser);
    vi.mocked(authRepository.markResetTokenUsed).mockResolvedValue(mockResetToken);

    await authService.resetPassword('reset-token-abc', 'new-password');

    expect(hashPassword).toHaveBeenCalledWith('new-password');
    expect(authRepository.updateUserPassword).toHaveBeenCalledWith('user-1', '$2a$12$newhash');
    expect(authRepository.markResetTokenUsed).toHaveBeenCalledWith('reset-1');
  });

  it('throws UnauthorizedError for used token', async () => {
    vi.mocked(authRepository.findPasswordResetToken).mockResolvedValue({
      ...mockResetToken,
      used: true,
    });

    await expect(authService.resetPassword('used-token', 'new-password')).rejects.toThrow(UnauthorizedError);
  });

  it('throws UnauthorizedError for expired token', async () => {
    vi.mocked(authRepository.findPasswordResetToken).mockResolvedValue({
      ...mockResetToken,
      expiresAt: new Date(Date.now() - 86400000),
    });

    await expect(authService.resetPassword('expired-token', 'new-password')).rejects.toThrow(UnauthorizedError);
  });

  it('throws UnauthorizedError for non-existent token', async () => {
    vi.mocked(authRepository.findPasswordResetToken).mockResolvedValue(null);

    await expect(authService.resetPassword('ghost-token', 'new-password')).rejects.toThrow(UnauthorizedError);
  });

  it('throws NotFoundError if user associated with token is missing', async () => {
    vi.mocked(authRepository.findPasswordResetToken).mockResolvedValue(mockResetToken);
    vi.mocked(hashPassword).mockResolvedValue('$2a$12$newhash');
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);

    await expect(authService.resetPassword('reset-token-abc', 'new-password')).rejects.toThrow(NotFoundError);
  });
});

describe('authService.getProfile', () => {
  it('returns user without password', async () => {
    vi.mocked(authRepository.findUserById).mockResolvedValue(mockUser);

    const result = await authService.getProfile('user-1');

    expect(result).not.toHaveProperty('password');
    expect(result.email).toBe('test@example.com');
    expect(authRepository.findUserById).toHaveBeenCalledWith('user-1');
  });

  it('throws NotFoundError for missing user', async () => {
    vi.mocked(authRepository.findUserById).mockResolvedValue(null);

    await expect(authService.getProfile('missing-id')).rejects.toThrow(NotFoundError);
  });
});

describe('authService.handleOAuth', () => {
  const profile = { sub: 'google-sub-123', email: 'test@example.com', name: 'Test User' };

  it('links existing account for returning OAuth user', async () => {
    vi.mocked(authRepository.findAccount).mockResolvedValue(mockAccount as any);
    vi.mocked(signAccessToken).mockReturnValue('access-token-1');
    vi.mocked(signRefreshToken).mockReturnValue('refresh-token-1');
    vi.mocked(authRepository.createSession).mockResolvedValue(mockSession as any);

    const result = await authService.handleOAuth('google', profile);

    expect(result.isNew).toBe(false);
    expect(result.accessToken).toBe('access-token-1');
    expect(result.user).not.toHaveProperty('password');
  });

  it('creates account + user for new OAuth login', async () => {
    vi.mocked(authRepository.findAccount).mockResolvedValue(null);
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
    vi.mocked(authRepository.createUser).mockResolvedValue(mockUser);
    vi.mocked(authRepository.createAccount).mockResolvedValue(mockAccount as any);
    vi.mocked(signAccessToken).mockReturnValue('access-token-1');
    vi.mocked(signRefreshToken).mockReturnValue('refresh-token-1');
    vi.mocked(authRepository.createSession).mockResolvedValue(mockSession as any);

    const result = await authService.handleOAuth('google', profile);

    expect(result.isNew).toBe(true);
    expect(authRepository.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'Test User',
      password: '',
    });
    expect(authRepository.createAccount).toHaveBeenCalled();
  });

  it('links existing email for known user', async () => {
    vi.mocked(authRepository.findAccount).mockResolvedValue(null);
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUser);
    vi.mocked(authRepository.createAccount).mockResolvedValue(mockAccount as any);
    vi.mocked(signAccessToken).mockReturnValue('access-token-1');
    vi.mocked(signRefreshToken).mockReturnValue('refresh-token-1');
    vi.mocked(authRepository.createSession).mockResolvedValue(mockSession as any);

    const result = await authService.handleOAuth('google', profile);

    expect(result.isNew).toBe(true);
    expect(authRepository.createUser).not.toHaveBeenCalled();
    expect(authRepository.createAccount).toHaveBeenCalled();
  });

  it('handles OAuth without email (empty string is falsy)', async () => {
    const noEmailProfile = { sub: 'google-sub-456', email: '', name: 'No Email User' };
    vi.mocked(authRepository.findAccount).mockResolvedValue(null);
    vi.mocked(authRepository.createUser).mockResolvedValue({ ...mockUser, email: '' });
    vi.mocked(authRepository.createAccount).mockResolvedValue(mockAccount as any);
    vi.mocked(signAccessToken).mockReturnValue('access-token-1');
    vi.mocked(signRefreshToken).mockReturnValue('refresh-token-1');
    vi.mocked(authRepository.createSession).mockResolvedValue(mockSession as any);

    const result = await authService.handleOAuth('google', noEmailProfile);

    expect(result.isNew).toBe(true);
    expect(authRepository.findUserByEmail).not.toHaveBeenCalled();
    expect(authRepository.createUser).toHaveBeenCalledWith({
      email: '',
      name: 'No Email User',
      password: '',
    });
  });
});
