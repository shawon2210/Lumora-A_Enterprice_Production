import { api } from './api-client';
import type { User } from '@lumora/shared';

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const authService = {
  async register(input: RegisterInput): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/register', input);
  },

  async login(input: LoginInput): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/login', input);
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      useAuthStore.getState().logout();
    }
  },

  async getMe(): Promise<User> {
    return api.get<User>('/auth/me');
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },
};

import { useAuthStore } from '@/store/auth-store';
