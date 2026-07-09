import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Outlet />
    </div>
  );
}
