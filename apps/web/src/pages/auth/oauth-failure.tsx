import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';
import { SEO } from '@/components/seo';

export default function OAuthFailurePage() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error') || 'Authentication failed';

  return (
    <>
      <SEO title="Sign In Failed | Lumora" />
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.12),transparent_50%)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card w-full max-w-md p-8 text-center"
        >
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <h1 className="text-2xl font-semibold text-white">Sign in failed</h1>
          <p className="mt-2 text-sm text-white/60">{error}</p>
          <div className="mt-8">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-medium text-neutral-900 transition-all hover:bg-white/90"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
