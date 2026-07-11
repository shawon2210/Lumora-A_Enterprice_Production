import { Outlet, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/providers/theme-provider';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@lumora/ui';

export function RootLayout() {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  const isLanding = pathname === '/';

  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark">
        <QueryProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              {!isDashboard && !isLanding && <Header />}
              <div className="flex-1">
                <Outlet />
              </div>
              {!isDashboard && <Footer />}
            </div>
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
