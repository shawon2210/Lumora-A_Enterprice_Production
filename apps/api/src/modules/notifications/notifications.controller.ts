import type { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service';
import { sendSuccess } from '@/utils/response';

export const notificationsController = {
  async listNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationsService.listNotifications(req.user!.id, req.query as { page?: string });
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationsService.getUnreadCount(req.user!.id);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationsService.markAsRead(req.params.id as string, req.user!.id);
      sendSuccess(res, { message: 'Notification marked as read' });
    } catch (err) {
      next(err);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationsService.markAllAsRead(req.user!.id);
      sendSuccess(res, { message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  },
};
