import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';
import { SEO } from '@/components/seo';

export default function MaintenancePage() {
  return (
    <>
      <SEO title="Maintenance | Lumora" />
      <div className="bg-surface-primary flex min-h-screen flex-col items-center justify-center px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.06),transparent_60%)]" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
            <Wrench className="h-8 w-8 text-amber-400" />
          </div>
          <h1
            className="text-text-primary mb-4 text-4xl font-normal sm:text-6xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Under maintenance
          </h1>
          <p className="text-text-secondary mx-auto mb-6 max-w-md text-base">
            We're performing scheduled maintenance. We'll be back shortly.
          </p>
          <p className="text-text-tertiary text-sm">
            Follow{' '}
            <a
              href="https://twitter.com"
              className="text-primary-400 hover:text-primary-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              @lumora
            </a>{' '}
            for updates.
          </p>
        </motion.div>
      </div>
    </>
  );
}
