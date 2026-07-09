import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@lumora/shared';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  rememberMe: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setRememberMe: (remember: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      rememberMe: false,

      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('lumora_access_token', accessToken);
        localStorage.setItem('lumora_refresh_token', refreshToken);
        set({ accessToken, refreshToken });
      },

      setRememberMe: (rememberMe) => set({ rememberMe }),

      logout: () => {
        localStorage.removeItem('lumora_access_token');
        localStorage.removeItem('lumora_refresh_token');
        set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: 'lumora-auth',
      partialize: (state) => ({ rememberMe: state.rememberMe }),
    },
  ),
);
