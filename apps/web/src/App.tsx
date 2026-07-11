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
import NotFoundPage from '@/pages/not-found';

const DashboardPage = lazy(() => import('@/pages/dashboard'));
const BlogPage = lazy(() => import('@/pages/dashboard/blog'));
const BlogCreatePage = lazy(() => import('@/pages/dashboard/blog-create'));
const MediaPage = lazy(() => import('@/pages/dashboard/media'));
const NotificationsPage = lazy(() => import('@/pages/dashboard/notifications'));
const SettingsPage = lazy(() => import('@/pages/dashboard/settings'));

const AdminUsersPage = lazy(() => import('@/pages/admin/users'));
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/analytics'));
const AdminLogsPage = lazy(() => import('@/pages/admin/logs'));

const HowItWorksPage = lazy(() => import('@/pages/how-it-works'));
const FeaturesPage = lazy(() => import('@/pages/features'));
const PricingPage = lazy(() => import('@/pages/pricing'));
const CommunityPage = lazy(() => import('@/pages/community'));
const SearchPage = lazy(() => import('@/pages/search'));
const MaintenancePage = lazy(() => import('@/pages/maintenance'));
const ServerErrorPage = lazy(() => import('@/pages/server-error'));
const UnauthorizedPage = lazy(() => import('@/pages/unauthorized'));
const ForbiddenPage = lazy(() => import('@/pages/forbidden'));
const SessionExpiredPage = lazy(() => import('@/pages/session-expired'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/verify-email'));
const OAuthFailurePage = lazy(() => import('@/pages/auth/oauth-failure'));

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
        path: 'auth/verify-email',
        element: (
          <Lazy>
            <VerifyEmailPage />
          </Lazy>
        ),
      },
      {
        path: 'auth/oauth-failure',
        element: (
          <Lazy>
            <OAuthFailurePage />
          </Lazy>
        ),
      },
      {
        path: 'how-it-works',
        element: (
          <Lazy>
            <HowItWorksPage />
          </Lazy>
        ),
      },
      {
        path: 'features',
        element: (
          <Lazy>
            <FeaturesPage />
          </Lazy>
        ),
      },
      {
        path: 'pricing',
        element: (
          <Lazy>
            <PricingPage />
          </Lazy>
        ),
      },
      {
        path: 'community',
        element: (
          <Lazy>
            <CommunityPage />
          </Lazy>
        ),
      },
      {
        path: 'search',
        element: (
          <Lazy>
            <SearchPage />
          </Lazy>
        ),
      },
      {
        path: 'maintenance',
        element: (
          <Lazy>
            <MaintenancePage />
          </Lazy>
        ),
      },
      {
        path: '500',
        element: (
          <Lazy>
            <ServerErrorPage />
          </Lazy>
        ),
      },
      {
        path: '401',
        element: (
          <Lazy>
            <UnauthorizedPage />
          </Lazy>
        ),
      },
      {
        path: '403',
        element: (
          <Lazy>
            <ForbiddenPage />
          </Lazy>
        ),
      },
      {
        path: 'session-expired',
        element: (
          <Lazy>
            <SessionExpiredPage />
          </Lazy>
        ),
      },
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
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
