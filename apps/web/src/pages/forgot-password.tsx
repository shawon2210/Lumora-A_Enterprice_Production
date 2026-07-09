import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@lumora/validators';
import { useForgotPassword } from '@/hooks';
import { Button } from '@lumora/ui';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await forgotPasswordMutation.mutateAsync({ email: data.email });
      setSubmitted(true);
    } catch (err: any) {
      // error is surfaced via mutation state
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(12,142,233,0.12),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(124,197,252,0.08),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="text-2xl italic text-white"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Lumora
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-white">Reset your password</h1>
          <p className="mt-2 text-sm text-white/60">
            {submitted
              ? 'Check your email for a reset link'
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {/* Success */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex flex-col items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-6 text-center"
          >
            <CheckCircle className="h-10 w-10 text-emerald-400" />
            <p className="text-sm text-emerald-300">
              If an account with that email exists, we've sent a password reset link.
            </p>
          </motion.div>
        )}

        {/* Error */}
        {forgotPasswordMutation.isError && !submitted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {(forgotPasswordMutation.error as any)?.message || 'Something went wrong'}
          </motion.div>
        )}

        {/* Form */}
        {!submitted && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/80">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  className="focus:border-primary-500/50 focus:ring-primary-500/20 w-full rounded-xl border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-all focus:ring-1"
                  placeholder="you@example.com"
                />
              </div>
              {form.formState.errors.email && (
                <p className="mt-1 text-xs text-red-400">{form.formState.errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl bg-white py-2.5 text-sm font-medium text-neutral-900 transition-all hover:bg-white/90"
              disabled={form.formState.isSubmitting || forgotPasswordMutation.isPending}
            >
              {form.formState.isSubmitting ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
        )}

        {/* Back to login */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white/60"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
