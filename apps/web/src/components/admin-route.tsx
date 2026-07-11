import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@lumora/shared';
import { Skeleton } from '@lumora/ui';

export function AdminRoute() {
  const { user, isLoading, isAuthenticated } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-full max-w-sm space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}
