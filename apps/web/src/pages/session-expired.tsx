import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, LogIn } from 'lucide-react';
import { SEO } from '@/components/seo';
import { useAuthStore } from '@/store/auth-store';

export default function SessionExpiredPage() {
  const logout = useAuthStore((s) => s.logout);

  const handleSignIn = () => {
    logout();
  };

  return (
    <>
      <SEO title="Session Expired | Lumora" />
      <div className="bg-surface-primary flex min-h-screen flex-col items-center justify-center px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.06),transparent_60%)]" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
            <Clock className="h-8 w-8 text-amber-400" />
          </div>
          <h1
            className="text-text-primary mb-4 text-4xl font-normal sm:text-6xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Session expired
          </h1>
          <p className="text-text-secondary mx-auto mb-10 max-w-md text-base">
            Your session has expired for security reasons. Please sign in again to continue.
          </p>
          <Link
            to="/login"
            onClick={handleSignIn}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-medium text-neutral-900 transition-all hover:bg-white/90"
          >
            <LogIn className="h-4 w-4" />
            Sign in again
          </Link>
        </motion.div>
      </div>
    </>
  );
}
