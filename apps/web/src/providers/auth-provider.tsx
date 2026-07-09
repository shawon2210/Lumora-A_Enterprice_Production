import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/services/api-client';
import type { User } from '@lumora/shared';

export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const token = localStorage.getItem('lumora_access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get<User>('/auth/me')
      .then((user) => setUser(user))
      .catch(() => {
        localStorage.removeItem('lumora_access_token');
        localStorage.removeItem('lumora_refresh_token');
        setLoading(false);
      });
  }, [setUser, setLoading]);

  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [logout]);

  return <>{children}</>;
}
