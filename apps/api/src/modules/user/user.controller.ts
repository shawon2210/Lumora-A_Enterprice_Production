import type { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { sendSuccess } from '@/utils/response';

export const userController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.id);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },
};
