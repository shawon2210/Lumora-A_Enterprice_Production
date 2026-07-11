import { Link } from 'react-router-dom';

const footerLinks = [
  { label: 'How it Works', href: '/how-it-works' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Community', href: '/community' },
];

export function Footer() {
  return (
    <footer className="border-border-secondary bg-surface-primary/80 border-t backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <p className="text-text-tertiary text-xs">&copy; {new Date().getFullYear()} Lumora. All rights reserved.</p>
        <nav className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-text-tertiary hover:text-text-primary text-xs transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
