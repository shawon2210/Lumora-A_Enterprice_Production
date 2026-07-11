import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Image,
  Bell,
  Settings,
  Users,
  BarChart3,
  ScrollText,
  ChevronLeft,
  Menu,
  LogOut,
  Search,
  Command,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { CommandPalette } from '@/components/command-palette';
import { useCommandPalette } from '@/store/command-palette-store';
import { useUnreadCount, useLogout } from '@/hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@lumora/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@lumora/ui';
const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FileText, label: 'Blog', href: '/dashboard/blog' },
  { icon: Image, label: 'Media', href: '/dashboard/media' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

const adminItems = [
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: ScrollText, label: 'Audit Logs', href: '/admin/logs' },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setOpen } = useCommandPalette();
  const { data: unreadData } = useUnreadCount();
  const logoutMutation = useLogout();
  const unreadCount = unreadData?.count ?? 0;

  const userInitials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    useAuthStore.getState().logout();
    navigate('/login');
  };

  const NavItem = ({
    icon: Icon,
    label,
    href,
    isActive,
  }: {
    icon: typeof Bell;
    label: string;
    href: string;
    isActive: boolean;
  }) => (
    <Link
      to={href}
      onClick={() => setSidebarOpen(false)}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
        isActive
          ? 'bg-primary-500/10 text-primary-400 font-medium'
          : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
      }`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="bg-surface-primary flex h-screen overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-neutral-900"
      >
        Skip to content
      </a>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`border-border-secondary bg-surface-primary fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-border-secondary flex h-16 items-center justify-between border-b px-6">
          <Link
            to="/dashboard"
            className="text-text-primary text-xl italic"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Lumora
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-text-secondary hover:bg-surface-tertiary rounded-lg p-1.5 md:hidden"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {sidebarItems.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={
                item.href === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.href)
              }
            />
          ))}

          {user?.role === 'ADMIN' && (
            <>
              <div className="border-border-secondary my-4 border-t pt-4">
                <p className="text-text-tertiary mb-2 px-3 text-xs font-medium uppercase tracking-wider">Admin</p>
              </div>
              {adminItems.map((item) => (
                <NavItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  isActive={location.pathname.startsWith(item.href)}
                />
              ))}
            </>
          )}
        </nav>

        <div className="border-border-secondary border-t p-4">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="bg-primary-500/20 text-primary-400 text-xs">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-text-primary truncate text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-text-tertiary truncate text-xs">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-border-secondary bg-surface-primary/80 flex h-16 items-center gap-4 border-b px-4 backdrop-blur-xl md:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-text-secondary hover:bg-surface-tertiary rounded-lg p-2 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            onClick={() => setOpen(true)}
            className="border-border-secondary bg-surface-secondary text-text-tertiary hover:text-text-primary hover:border-border-primary relative flex max-w-md flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all"
            aria-label="Open command palette"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span>Search pages and posts...</span>
            <kbd className="border-border-secondary bg-surface-tertiary ml-auto hidden items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-medium md:inline-flex">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Link
              to="/dashboard/notifications"
              className="text-text-secondary hover:bg-surface-tertiary hover:text-text-primary relative rounded-lg p-2 transition-colors"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full outline-none" aria-label="User menu">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={user?.avatar || undefined} />
                    <AvatarFallback className="bg-primary-500/20 text-primary-400 text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name || 'User'}</span>
                    <span className="text-text-tertiary text-xs font-normal">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-error">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
