import { ArrowRight, Check, Zap, Shield, PenTool, Users } from 'lucide-react';
import { SEO } from '@/components/seo';
import { Link } from 'react-router-dom';

const steps = [
  {
    number: '01',
    title: 'Sign Up & Onboard',
    description:
      'Create your account with email or OAuth providers (Google, GitHub). Our guided onboarding helps you set up your profile, preferences, and workspace in minutes.',
    icon: Users,
    details: ['Email/password or OAuth signup', 'Guided profile setup', 'Workspace creation', 'Team invitation flow'],
  },
  {
    number: '02',
    title: 'Create Your First Content',
    description:
      'Start writing immediately with our intuitive editor. Write blog posts, upload media, and organize with tags and categories. Real-time preview shows exactly how it will look.',
    icon: PenTool,
    details: [
      'Rich text editor with markdown support',
      'Drag-and-drop media uploads',
      'Tag & category organization',
      'Auto-save & version history',
    ],
  },
  {
    number: '03',
    title: 'Customize & Publish',
    description:
      'Customize your content layout, SEO settings, and publishing schedule. Preview across devices before going live. Schedule posts or publish immediately.',
    icon: Zap,
    details: ['SEO optimization tools', 'Custom slug & metadata', 'Scheduling & drafts', 'Cross-device preview'],
  },
  {
    number: '04',
    title: 'Analyze & Grow',
    description:
      'Track performance with built-in analytics. See views, engagement, and audience insights. Use data to refine your content strategy and grow your audience.',
    icon: Shield,
    details: ['Real-time analytics dashboard', 'Engagement metrics', 'Audience demographics', 'Exportable reports'],
  },
];

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance with edge caching and CDN delivery worldwide.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with end-to-end encryption and advanced access controls.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Real-time editing, comments, and approval workflows for teams of any size.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <SEO
        title="How It Works | Lumora"
        description="Learn how Lumora helps you create, publish, and grow your content with our streamlined workflow."
      />

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900/50 via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNjAnIGhlaWdodD0nNjAnIHZpZXdCb3g9JzAgMCA2MCA2MCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnPjxnIGZpbGw9JyNmZmZmZmYnIGZpbGwtb3BhY2l0eT0nMC4xJz48cGF0aCBkPSdNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzZ2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNlYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnogLz48L2c+PC9nPjwvc3ZnPg==',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-medium text-white/80">4 Simple Steps to Launch</span>
          </div>

          {/* Title */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            How It Works
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              in 4 Steps
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-12 max-w-2xl text-lg leading-relaxed text-white/70">
            From signup to published content in minutes. Our streamlined workflow gets your ideas live faster than ever.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/auth/register"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            >
              Get Started Free
              <svg
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-all hover:border-white/30 hover:bg-white/10"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="h-6 w-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Steps Section */}
      <section className="relative bg-black py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <article
                key={step.number}
                className="to-white/2 group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 p-8 transition-all duration-500 hover:scale-[1.02] hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Number Badge */}
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-2xl font-bold text-white">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 transition-transform group-hover:scale-110">
                  <step.icon className="h-8 w-8" aria-hidden="true" />
                </div>

                {/* Title */}
                <h3 className="mb-4 text-2xl font-bold text-white">{step.title}</h3>

                {/* Description */}
                <p className="mb-6 leading-relaxed text-white/70">{step.description}</p>

                {/* Details */}
                <ul className="space-y-3">
                  {step.details.map((detail, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-white/70 transition-colors group-hover:text-white/90"
                    >
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" aria-hidden="true" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowRight className="h-8 w-8 text-emerald-400" aria-hidden="true" />
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="relative bg-gradient-to-b from-gray-950 to-black py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Built for Modern Creators</h2>
            <p className="mx-auto max-w-2xl text-lg text-white/70">Powerful features that scale with your growth</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/10 bg-white/5 p-8 transition-all duration-500 hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-transform group-hover:scale-110">
                  <feature.icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-black py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 p-12 lg:p-16">
            <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">Ready to Start Your Journey?</h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/70">
              Join thousands of creators who trust Lumora to power their content. Start free, scale infinitely.
            </p>
            <Link
              to="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            >
              Start Free Today
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
