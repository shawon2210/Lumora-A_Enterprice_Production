import { Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/providers/theme-provider';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { Toaster } from '@lumora/ui';

export function RootLayout() {
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark">
        <QueryProvider>
          <AuthProvider>
            <Outlet />
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
