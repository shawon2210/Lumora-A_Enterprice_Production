import { useApiQuery, useApiMutation } from './use-api';
import type { User } from '@lumora/shared';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export function useMe() {
  return useApiQuery<User>(['auth', 'me'], '/auth/me', {
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLogin() {
  return useApiMutation<AuthResponse, { email: string; password: string }>('post', '/auth/login');
}

export function useRegister() {
  return useApiMutation<AuthResponse, { email: string; password: string; name: string }>(
    'post',
    '/auth/register',
  );
}

export function useLogout() {
  return useApiMutation<void>('post', '/auth/logout');
}

export function useForgotPassword() {
  return useApiMutation<void, { email: string }>('post', '/auth/forgot-password');
}

export function useResetPassword() {
  return useApiMutation<void, { token: string; password: string }>('post', '/auth/reset-password');
}
