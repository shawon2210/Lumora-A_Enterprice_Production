import { notificationsRepository } from './notifications.repository';
import { getPaginationParams, buildPaginationMeta } from '@/utils/pagination';
import { NotFoundError } from '@/utils/errors';

export const notificationsService = {
  async listNotifications(userId: string, query: { page?: string }) {
    const { page, limit, skip } = getPaginationParams({
      page: query.page ? parseInt(query.page, 10) : undefined,
    });
    const [notifications, total, unreadCount] = await Promise.all([
      notificationsRepository.findNotifications({ userId, skip, limit }),
      notificationsRepository.countNotifications(userId),
      notificationsRepository.countUnread(userId),
    ]);
    return { notifications, meta: buildPaginationMeta(total, page, limit), unreadCount };
  },

  async getUnreadCount(userId: string) {
    const count = await notificationsRepository.countUnread(userId);
    return { count };
  },

  async markAsRead(id: string, userId: string) {
    const notification = await notificationsRepository.findNotificationById(id);
    if (!notification) throw new NotFoundError('Notification');
    if (notification.userId !== userId) throw new NotFoundError('Notification');
    return notificationsRepository.markAsRead(id);
  },

  async markAllAsRead(userId: string) {
    await notificationsRepository.markAllAsRead(userId);
  },
};
