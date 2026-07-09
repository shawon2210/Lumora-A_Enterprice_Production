import { useApiQuery, useApiMutation, useApiMutationWithUrl } from './use-api';
import type { Notification, PaginationMeta } from '@lumora/shared';

interface NotificationsResponse {
  notifications: Notification[];
  meta: PaginationMeta;
  unreadCount: number;
}

export function useNotifications(params?: { page?: number }) {
  return useApiQuery<NotificationsResponse>(['notifications'], '/user/notifications', {
    params: params as Record<string, string | number | undefined>,
  });
}

export function useUnreadCount() {
  return useApiQuery<{ count: number }>(['notifications', 'unread'], '/user/notifications/unread', {
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  return useApiMutationWithUrl<void, { id: string }>(
    'put',
    (vars) => `/user/notifications/${vars.id}/read`,
  );
}

export function useMarkAllNotificationsRead() {
  return useApiMutation<void>('put', '/user/notifications/read-all');
}
