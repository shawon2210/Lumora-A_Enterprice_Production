import { prisma } from '@lumora/database';

export const notificationsRepository = {
  findNotifications(params: { userId: string; skip: number; limit: number }) {
    return prisma.notification.findMany({
      where: { userId: params.userId },
      skip: params.skip,
      take: params.limit,
      orderBy: { createdAt: 'desc' },
    });
  },

  countNotifications(userId: string) {
    return prisma.notification.count({ where: { userId } });
  },

  countUnread(userId: string) {
    return prisma.notification.count({ where: { userId, read: false } });
  },

  findNotificationById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  },

  markAsRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { read: true } });
  },

  markAllAsRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  },
};
