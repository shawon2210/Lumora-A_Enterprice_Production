import { Link } from 'react-router-dom';
import { navigationLinks } from '@/config/navigation';

export function Footer() {
  return (
    <footer className="border-border-secondary bg-surface-primary/80 border-t backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-4 sm:flex-row sm:justify-between">
        <p className="text-text-tertiary text-xs">&copy; {new Date().getFullYear()} Lumora. All rights reserved.</p>
        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6" aria-label="Footer navigation">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-text-tertiary hover:text-text-primary text-xs transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/register"
          className="bg-primary-500 hover:bg-primary-400 text-text-on-primary rounded-full px-5 py-2 text-xs font-medium transition-colors"
        >
          Get Started
        </Link>
      </div>
    </footer>
  );
}
