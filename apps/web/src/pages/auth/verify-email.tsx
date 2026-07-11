import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { SEO } from '@/components/seo';
import { api } from '@/services/api-client';
import type { ApiClientError } from '@/services/api-client';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    api
      .post('/auth/verify-email', { token })
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified successfully.');
      })
      .catch((err: ApiClientError) => {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may have expired.');
      });
  }, [token]);

  return (
    <>
      <SEO title="Verify Email | Lumora" />
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(12,142,233,0.12),transparent_50%)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card w-full max-w-md p-8 text-center"
        >
          <Link to="/" className="text-2xl italic text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Lumora
          </Link>

          <div className="mt-8">
            {status === 'loading' && (
              <>
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-white/40" />
                <h1 className="text-xl font-semibold text-white">Verifying your email...</h1>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
                <h1 className="text-xl font-semibold text-white">Email verified!</h1>
                <p className="mt-2 text-sm text-white/60">{message}</p>
                <div className="mt-8">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-medium text-neutral-900 transition-all hover:bg-white/90"
                  >
                    Sign in
                  </Link>
                </div>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
                <h1 className="text-xl font-semibold text-white">Verification failed</h1>
                <p className="mt-2 text-sm text-white/60">{message}</p>
                <div className="mt-8 flex flex-col items-center gap-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-medium text-neutral-900 transition-all hover:bg-white/90"
                  >
                    Back to sign in
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
