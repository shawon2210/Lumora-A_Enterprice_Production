import type { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { sendSuccess } from '@/utils/response';

export const adminController = {
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { users, meta } = await adminService.listUsers(
        req.query as { page?: string; limit?: string; search?: string; role?: string },
      );
      sendSuccess(res, { users, meta });
    } catch (err) {
      next(err);
    }
  },

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await adminService.getUser(req.params.id as string);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await adminService.updateRole(req.params.id as string, req.body.role);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await adminService.deleteUser(req.params.id as string);
      sendSuccess(res, { message: 'User deleted' });
    } catch (err) {
      next(err);
    }
  },

  async getAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await adminService.getAnalytics();
      sendSuccess(res, analytics);
    } catch (err) {
      next(err);
    }
  },

  async listAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { logs, meta } = await adminService.listAuditLogs(
        req.query as { page?: string; limit?: string; search?: string; action?: string },
      );
      sendSuccess(res, { logs, meta });
    } catch (err) {
      next(err);
    }
  },
};
