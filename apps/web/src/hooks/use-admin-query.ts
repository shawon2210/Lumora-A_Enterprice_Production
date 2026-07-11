import { useApiQuery, useApiMutationWithUrl } from './use-api';
import type { User, PaginationMeta } from '@lumora/shared';

interface UsersResponse {
  users: User[];
  meta: PaginationMeta;
}

interface AuditLogItem {
  id: string;
  user: { name: string; email: string };
  action: string;
  entity: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export function useAdminUsers(params?: { page?: number; limit?: number; search?: string; role?: string }) {
  return useApiQuery<UsersResponse>(['admin', 'users'], '/admin/users', {
    params: params as Record<string, string | number | undefined>,
  });
}

export function useAdminUser(id: string) {
  return useApiQuery<User>(['admin', 'user', id], `/admin/users/${id}`, { enabled: !!id });
}

export function useUpdateUserRole() {
  return useApiMutationWithUrl<User, { id: string; role: string }>('put', (vars) => `/admin/users/${vars.id}`, {
    invalidationKey: ['admin', 'users'],
  });
}

export function useDeleteUser() {
  return useApiMutationWithUrl<void, { id: string }>('delete', (vars) => `/admin/users/${vars.id}`, {
    invalidationKey: ['admin', 'users'],
  });
}

export function useAdminAnalytics() {
  return useApiQuery<{
    totalUsers: number;
    totalPosts: number;
    totalMedia: number;
    activeUsers: number;
    signupsToday: number;
    revenue: number;
  }>(['admin', 'analytics'], '/admin/analytics');
}

export function useAuditLogs(params?: { page?: number; limit?: number; search?: string; severity?: string }) {
  return useApiQuery<{ logs: AuditLogItem[]; meta: PaginationMeta }>(['admin', 'logs'], '/admin/logs', {
    params: params as Record<string, string | number | undefined>,
  });
}
