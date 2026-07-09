import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/layouts/root-layout';
import { AuthLayout } from '@/layouts/auth-layout';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import { ProtectedRoute } from '@/components/protected-route';
import { AdminRoute } from '@/components/admin-route';
import { LoadingScreen } from '@/components/loading-screen';
import LandingPage from '@/pages/landing';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import ForgotPasswordPage from '@/pages/forgot-password';
import ResetPasswordPage from '@/pages/reset-password';
import AuthCallbackPage from '@/pages/auth/callback';

const DashboardPage = lazy(() => import('@/pages/dashboard'));
const BlogPage = lazy(() => import('@/pages/dashboard/blog'));
const BlogCreatePage = lazy(() => import('@/pages/dashboard/blog-create'));
const MediaPage = lazy(() => import('@/pages/dashboard/media'));
const NotificationsPage = lazy(() => import('@/pages/dashboard/notifications'));
const SettingsPage = lazy(() => import('@/pages/dashboard/settings'));
const AdminUsersPage = lazy(() => import('@/pages/admin/users'));
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/analytics'));
const AdminLogsPage = lazy(() => import('@/pages/admin/logs'));

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'auth/callback', element: <AuthCallbackPage /> },
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
          { path: 'reset-password', element: <ResetPasswordPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                path: 'dashboard',
                element: (
                  <Lazy>
                    <DashboardPage />
                  </Lazy>
                ),
              },
              {
                path: 'dashboard/blog',
                element: (
                  <Lazy>
                    <BlogPage />
                  </Lazy>
                ),
              },
              {
                path: 'dashboard/blog/new',
                element: (
                  <Lazy>
                    <BlogCreatePage />
                  </Lazy>
                ),
              },
              {
                path: 'dashboard/blog/:id/edit',
                element: (
                  <Lazy>
                    <BlogCreatePage />
                  </Lazy>
                ),
              },
              {
                path: 'dashboard/media',
                element: (
                  <Lazy>
                    <MediaPage />
                  </Lazy>
                ),
              },
              {
                path: 'dashboard/notifications',
                element: (
                  <Lazy>
                    <NotificationsPage />
                  </Lazy>
                ),
              },
              {
                path: 'dashboard/settings',
                element: (
                  <Lazy>
                    <SettingsPage />
                  </Lazy>
                ),
              },
              {
                element: <AdminRoute />,
                children: [
                  {
                    path: 'admin/users',
                    element: (
                      <Lazy>
                        <AdminUsersPage />
                      </Lazy>
                    ),
                  },
                  {
                    path: 'admin/analytics',
                    element: (
                      <Lazy>
                        <AdminAnalyticsPage />
                      </Lazy>
                    ),
                  },
                  {
                    path: 'admin/logs',
                    element: (
                      <Lazy>
                        <AdminLogsPage />
                      </Lazy>
                    ),
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: '*',
        element: (
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-semibold">404</h1>
              <p className="text-text-secondary mt-2">Page not found</p>
            </div>
          </div>
        ),
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
