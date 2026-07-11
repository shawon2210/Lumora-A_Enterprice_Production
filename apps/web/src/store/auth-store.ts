import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@lumora/shared';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  rememberMe: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setAccessToken: (token: string | null) => void;
  setRememberMe: (remember: boolean) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      accessToken: null,
      rememberMe: false,

      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      setAccessToken: (accessToken) => set({ accessToken }),

      setRememberMe: (rememberMe) => set({ rememberMe }),

      logout: () => {
        set({ user: null, isAuthenticated: false, accessToken: null });
      },

      hydrate: () => {
        const state = useAuthStore.getState();
        if (!state.accessToken) {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'lumora-auth',
      partialize: (state) => ({ rememberMe: state.rememberMe }),
    },
  ),
);
