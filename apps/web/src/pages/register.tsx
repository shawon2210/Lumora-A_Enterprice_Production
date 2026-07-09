import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Github } from 'lucide-react';
import { z } from 'zod';
import { registerSchema } from '@lumora/validators';
import { useRegister } from '@/hooks';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@lumora/ui';

const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormInput = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const handleOAuth = (provider: 'google' | 'github') => {
    const baseUrl = import.meta.env.VITE_API_URL || '/api/v1';
    const redirectUri = `${window.location.origin}/auth/callback`;
    window.location.href = `${baseUrl}/auth/${provider}?redirect=${encodeURIComponent(redirectUri)}`;
  };

  const onSubmit = async (data: RegisterFormInput) => {
    try {
      const response = await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setTokens(response.accessToken, response.refreshToken);
      navigate('/dashboard');
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
          <h1 className="mt-6 text-2xl font-semibold text-white">Create your account</h1>
          <p className="mt-2 text-sm text-white/60">Start your journey to clarity</p>
        </div>

        {/* OAuth Buttons */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="glass w-full gap-2 text-white/80 hover:text-white"
            onClick={() => handleOAuth('github')}
          >
            <Github className="h-4 w-4" />
            GitHub
          </Button>
          <Button
            variant="outline"
            className="glass w-full gap-2 text-white/80 hover:text-white"
            onClick={() => handleOAuth('google')}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-neutral-950 px-2 text-white/40">or sign up with email</span>
          </div>
        </div>

        {/* Error */}
        {registerMutation.isError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {(registerMutation.error as any)?.message || 'Registration failed'}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-white/80">
              Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                id="name"
                type="text"
                {...form.register('name')}
                className="focus:border-primary-500/50 focus:ring-primary-500/20 w-full rounded-xl border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-all focus:ring-1"
                placeholder="John Doe"
              />
            </div>
            {form.formState.errors.name && (
              <p className="mt-1 text-xs text-red-400">{form.formState.errors.name.message}</p>
            )}
          </div>

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

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/80">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...form.register('password')}
                className="focus:border-primary-500/50 focus:ring-primary-500/20 w-full rounded-xl border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-all focus:ring-1"
                placeholder="Create a strong password"
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
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium text-white/80"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...form.register('confirmPassword')}
                className="focus:border-primary-500/50 focus:ring-primary-500/20 w-full rounded-xl border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-all focus:ring-1"
                placeholder="Confirm your password"
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
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl bg-white py-2.5 text-sm font-medium text-neutral-900 transition-all hover:bg-white/90"
            disabled={form.formState.isSubmitting || registerMutation.isPending}
          >
            {form.formState.isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
