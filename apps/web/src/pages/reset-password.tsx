import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { useResetPassword } from '@/hooks';
import { Button } from '@lumora/ui';
import type { ApiClientError } from '@/services/api-client';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    if (!token) return;
    try {
      await resetPasswordMutation.mutateAsync({ token, password: data.password });
      setSubmitted(true);
    } catch {
      // error is surfaced via mutation state
    }
  };

  if (!token) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(12,142,233,0.12),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(124,197,252,0.08),transparent_50%)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card w-full max-w-md p-8 text-center"
        >
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-amber-400" />
          <h1 className="text-2xl font-semibold text-white">Invalid Reset Link</h1>
          <p className="mt-2 text-sm text-white/60">This password reset link is invalid or has expired.</p>
          <div className="mt-6">
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-2.5 text-sm font-medium text-neutral-900 transition-all hover:bg-white/90"
            >
              Request new reset link
            </Link>
          </div>
          <div className="mt-4">
            <Link to="/login" className="text-sm text-white/40 transition-colors hover:text-white/60">
              Back to sign in
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(12,142,233,0.12),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(124,197,252,0.08),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl italic text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Lumora
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-white">Reset your password</h1>
          <p className="mt-2 text-sm text-white/60">
            {submitted ? 'Your password has been reset successfully' : 'Enter your new password below'}
          </p>
        </div>

        {submitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex flex-col items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-6 text-center"
          >
            <CheckCircle className="h-10 w-10 text-emerald-400" />
            <p className="text-sm text-emerald-300">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="mt-2 rounded-xl bg-white px-6 py-2.5 text-sm font-medium text-neutral-900 transition-all hover:bg-white/90"
            >
              Sign in
            </Button>
          </motion.div>
        )}

        {resetPasswordMutation.isError && !submitted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {(resetPasswordMutation.error as ApiClientError)?.message || 'Failed to reset password'}
          </motion.div>
        )}

        {!submitted && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/80">
                New Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...form.register('password')}
                  className="focus:border-primary-500/50 focus:ring-primary-500/20 w-full rounded-xl border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-all focus:ring-1"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="mt-1 text-xs text-red-400">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-white/80">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...form.register('confirmPassword')}
                  className="focus:border-primary-500/50 focus:ring-primary-500/20 w-full rounded-xl border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-all focus:ring-1"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl bg-white py-2.5 text-sm font-medium text-neutral-900 transition-all hover:bg-white/90"
              disabled={form.formState.isSubmitting || resetPasswordMutation.isPending}
            >
              {form.formState.isSubmitting ? 'Resetting...' : 'Reset password'}
            </Button>
          </form>
        )}

        {!submitted && (
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-white/40 transition-colors hover:text-white/60">
              Back to sign in
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
