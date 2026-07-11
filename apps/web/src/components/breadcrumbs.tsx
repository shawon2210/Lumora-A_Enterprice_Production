import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

const labelMap: Record<string, string> = {
  dashboard: 'Dashboard',
  blog: 'Blog',
  media: 'Media',
  notifications: 'Notifications',
  settings: 'Settings',
  admin: 'Admin',
  users: 'Users',
  analytics: 'Analytics',
  logs: 'Audit Logs',
};

export function Breadcrumbs() {
  const { pathname } = useLocation();

  const crumbs = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, i) => {
      const href = '/' + parts.slice(0, i + 1).join('/');
      const label = labelMap[part] || part.charAt(0).toUpperCase() + part.slice(1);
      const isLast = i === parts.length - 1;
      return { href, label, isLast };
    });
  }, [pathname]);

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-xs">
        <li>
          <Link to="/dashboard" className="text-text-tertiary hover:text-text-primary transition-colors">
            Home
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="text-text-tertiary/50 h-3 w-3" />
            {crumb.isLast ? (
              <span className="text-text-primary font-medium" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.href} className="text-text-tertiary hover:text-text-primary transition-colors">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
