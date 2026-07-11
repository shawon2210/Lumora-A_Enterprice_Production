import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/store/auth-store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setLoading = useAuthStore((s) => s.setLoading);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      try {
        fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
          .then((res) => {
            if (!res.ok) throw new Error('Refresh failed');
            return res.json();
          })
          .then((json) => {
            const token = json.data?.accessToken || json.accessToken;
            if (token) {
              setAccessToken(token);
              return fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
                credentials: 'include',
              });
            }
            throw new Error('No token');
          })
          .then((res) => {
            if (!res.ok) throw new Error('Failed to fetch user');
            return res.json();
          })
          .then((json) => {
            setUser(json.data || json);
          })
          .catch(() => {
            setLoading(false);
          });
      } catch {
        setLoading(false);
      }
    } else {
      fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch user');
          return res.json();
        })
        .then((json) => {
          setUser(json.data || json);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [setUser, setAccessToken, setLoading]);

  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [logout]);

  return <>{children}</>;
}
