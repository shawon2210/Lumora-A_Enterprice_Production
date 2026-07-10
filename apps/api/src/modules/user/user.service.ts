import { userRepository } from './user.repository';
import { NotFoundError } from '@/utils/errors';
import { prisma } from '@lumora/database';

const userSelect = {
  id: true,
  email: true,
  name: true,
  avatar: true,
  role: true,
  subscription: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const userService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });
    if (!user) throw new NotFoundError('User');
    return user;
  },

  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');
    return userRepository.updateUser(userId, data);
  },
};
