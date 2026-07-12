/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationsService } from '@/modules/notifications/notifications.service';
import { notificationsRepository } from '@/modules/notifications/notifications.repository';
import { getPaginationParams, buildPaginationMeta } from '@/utils/pagination';
import { NotFoundError } from '@/utils/errors';

vi.mock('@/modules/notifications/notifications.repository');
vi.mock('@/utils/pagination');

const mockNotification = {
  id: 'notif-1',
  userId: 'user-1',
  title: 'New comment',
  message: 'Someone commented on your post',
  type: 'COMMENT',
  link: '/blog/my-post',
  read: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockPaginationParams = { page: 1, limit: 20, skip: 0 };
const mockPaginationMeta = {
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('notificationsService.listNotifications', () => {
  it('returns paginated notifications with unread count', async () => {
    vi.mocked(getPaginationParams).mockReturnValue(mockPaginationParams);
    vi.mocked(notificationsRepository.findNotifications).mockResolvedValue([mockNotification] as any);
    vi.mocked(notificationsRepository.countNotifications).mockResolvedValue(1);
    vi.mocked(notificationsRepository.countUnread).mockResolvedValue(1);
    vi.mocked(buildPaginationMeta).mockReturnValue(mockPaginationMeta);

    const result = await notificationsService.listNotifications('user-1', {});

    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0].title).toBe('New comment');
    expect(result.unreadCount).toBe(1);
    expect(result.meta).toEqual(mockPaginationMeta);
  });

  it('passes query params to getPaginationParams', async () => {
    vi.mocked(getPaginationParams).mockReturnValue({ page: 2, limit: 10, skip: 10 });
    vi.mocked(notificationsRepository.findNotifications).mockResolvedValue([]);
    vi.mocked(notificationsRepository.countNotifications).mockResolvedValue(0);
    vi.mocked(notificationsRepository.countUnread).mockResolvedValue(0);
    vi.mocked(buildPaginationMeta).mockReturnValue(mockPaginationMeta);

    await notificationsService.listNotifications('user-1', { page: '2' });

    expect(notificationsRepository.findNotifications).toHaveBeenCalledWith({
      userId: 'user-1',
      skip: 10,
      limit: 10,
    });
  });
});

describe('notificationsService.getUnreadCount', () => {
  it('returns unread count', async () => {
    vi.mocked(notificationsRepository.countUnread).mockResolvedValue(5);

    const result = await notificationsService.getUnreadCount('user-1');

    expect(result).toEqual({ count: 5 });
    expect(notificationsRepository.countUnread).toHaveBeenCalledWith('user-1');
  });
});

describe('notificationsService.markAsRead', () => {
  it('marks notification as read', async () => {
    vi.mocked(notificationsRepository.findNotificationById).mockResolvedValue(mockNotification as any);
    vi.mocked(notificationsRepository.markAsRead).mockResolvedValue({
      ...mockNotification,
      read: true,
    } as any);

    const result = await notificationsService.markAsRead('notif-1', 'user-1');

    expect(notificationsRepository.findNotificationById).toHaveBeenCalledWith('notif-1');
    expect(notificationsRepository.markAsRead).toHaveBeenCalledWith('notif-1');
    expect(result).toBeDefined();
  });

  it('throws NotFoundError if notification not found', async () => {
    vi.mocked(notificationsRepository.findNotificationById).mockResolvedValue(null);

    await expect(notificationsService.markAsRead('missing', 'user-1')).rejects.toThrow(NotFoundError);
    expect(notificationsRepository.markAsRead).not.toHaveBeenCalled();
  });

  it('throws NotFoundError if not owned by user (hide existence)', async () => {
    vi.mocked(notificationsRepository.findNotificationById).mockResolvedValue({
      ...mockNotification,
      userId: 'other-user',
    } as any);

    await expect(notificationsService.markAsRead('notif-1', 'user-1')).rejects.toThrow(NotFoundError);
    expect(notificationsRepository.markAsRead).not.toHaveBeenCalled();
  });
});

describe('notificationsService.markAllAsRead', () => {
  it('marks all notifications as read', async () => {
    vi.mocked(notificationsRepository.markAllAsRead).mockResolvedValue({ count: 3 });

    await notificationsService.markAllAsRead('user-1');

    expect(notificationsRepository.markAllAsRead).toHaveBeenCalledWith('user-1');
  });
});
