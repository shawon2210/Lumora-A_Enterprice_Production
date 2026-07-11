import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Features', path: '/features' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Community', path: '/community' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  return (
    <>
      <nav className="flex items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-xl italic text-white sm:text-2xl"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Lumora
        </Link>

        <div className="hidden items-center md:flex">
          <div className="liquid-glass flex items-center gap-1 rounded-full px-2 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={isLanding ? `/#${link.label.toLowerCase().replace(/\s+/g, '-')}` : link.path}
                className="rounded-full px-4 py-2 text-sm text-white/90 transition-colors hover:text-white"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/register"
              className="rounded-full bg-white px-5 py-2 text-sm text-black transition-colors hover:bg-white/90"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              Get Started
            </Link>
          </div>
        </div>

        <button
          className="liquid-glass relative flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`absolute transition-all duration-300 ease-in-out ${
              mobileMenuOpen ? 'rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'
            }`}
          >
            <Menu className="h-5 w-5 text-white" />
          </span>
          <span
            className={`absolute transition-all duration-300 ease-in-out ${
              mobileMenuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0'
            }`}
          >
            <X className="h-5 w-5 text-white" />
          </span>
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
            {navLinks.map((link, i) => (
              <Link
                key={link.path}
                to={isLanding ? `/#${link.label.toLowerCase().replace(/\s+/g, '-')}` : link.path}
                className="animate-menu-slide-up text-3xl text-white"
                style={{
                  fontFamily: 'system-ui, sans-serif',
                  animationDelay: `${(i + 2) * 50}ms`,
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/register"
              className="animate-menu-scale-in rounded-full bg-white px-8 py-3 text-lg text-black transition-colors hover:bg-white/90"
              style={{
                fontFamily: 'system-ui, sans-serif',
                animationDelay: '300ms',
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
