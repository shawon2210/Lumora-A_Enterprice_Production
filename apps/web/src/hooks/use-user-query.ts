import { useApiQuery, useApiMutation } from './use-api';
import type { User } from '@lumora/shared';

export function useProfile() {
  return useApiQuery<User>(['user', 'profile'], '/user/profile');
}

export function useUpdateProfile() {
  return useApiMutation<User, { name?: string; avatar?: string }>('put', '/user/profile', {
    invalidationKey: ['user'],
  });
}

export function useChangePassword() {
  return useApiMutation<void, { currentPassword: string; newPassword: string }>('put', '/auth/change-password');
}
