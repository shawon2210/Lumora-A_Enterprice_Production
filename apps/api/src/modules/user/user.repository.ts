import { prisma } from '@lumora/database';

export const userRepository = {
  updateUser(id: string, data: { name?: string; avatar?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        subscription: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
};
