import type { Request, Response, NextFunction } from 'express';
import { userRepository } from './user.repository';
import { sendSuccess } from '@/utils/response';
import { NotFoundError } from '@/utils/errors';
import { prisma } from '@lumora/database';

export const userController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: (req as any).user!.id },
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
      if (!user) throw new NotFoundError('User');
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.updateUser((req as any).user!.id, req.body);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },
};
