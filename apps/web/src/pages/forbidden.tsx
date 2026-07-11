import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { SEO } from '@/components/seo';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <>
      <SEO title="Forbidden | Lumora" />
      <div className="bg-surface-primary flex min-h-screen flex-col items-center justify-center px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.06),transparent_60%)]" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative text-center"
        >
          <p className="mb-4 font-mono text-sm font-medium uppercase tracking-widest text-red-400">403</p>
          <h1
            className="text-text-primary mb-4 text-5xl font-normal sm:text-7xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Forbidden
          </h1>
          <p className="text-text-secondary mx-auto mb-10 max-w-md text-base">
            You don't have permission to access this page.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate(-1)}
              className="border-border-secondary text-text-secondary hover:bg-surface-secondary flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </button>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition-all hover:bg-white/90"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
