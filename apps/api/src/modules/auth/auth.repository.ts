import { prisma } from '@lumora/database';
import type { Prisma } from '@prisma/client';

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  createUser(data: { email: string; name: string; password: string }) {
    return prisma.user.create({ data });
  },

  createSession(userId: string, token: string, refreshToken: string, expiresAt: Date) {
    return prisma.session.create({
      data: { userId, token, refreshToken, expiresAt },
      include: { user: true },
    });
  },

  findSessionByToken(token: string) {
    return prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  findSessionByRefreshToken(refreshToken: string) {
    return prisma.session.findFirst({
      where: { refreshToken },
      include: { user: true },
    });
  },

  deleteSession(token: string) {
    return prisma.session.delete({ where: { token } });
  },

  deleteUserSessions(userId: string) {
    return prisma.session.deleteMany({ where: { userId } });
  },

  createPasswordResetToken(email: string, token: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });
  },

  findPasswordResetToken(token: string) {
    return prisma.passwordResetToken.findUnique({ where: { token } });
  },

  markResetTokenUsed(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { used: true },
    });
  },

  findAccount(provider: string, providerAccountId: string) {
    return prisma.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      include: { user: true },
    });
  },

  createAccount(data: Prisma.AccountCreateInput) {
    return prisma.account.create({ data, include: { user: true } });
  },

  createEmailVerificationToken(userId: string, token: string, expiresAt: Date) {
    return prisma.emailVerificationToken.create({
      data: { userId, token, expiresAt },
    });
  },

  updateUserPassword(id: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  },

  verifyEmail(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  },
};
