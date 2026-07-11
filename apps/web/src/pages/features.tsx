import { Check, Zap, Database, Globe, Layers, PenTool, Users, BarChart, Lock, Cloud } from 'lucide-react';
import { SEO } from '@/components/seo';
import { Link } from 'react-router-dom';

const featureCategories = [
  {
    category: 'Content Creation',
    icon: PenTool,
    features: [
      {
        title: 'Rich Text Editor',
        description: 'Full-featured editor with markdown support, real-time preview, and collaborative editing.',
        icon: PenTool,
      },
      {
        title: 'Media Management',
        description: 'Drag-and-drop uploads, automatic optimization, CDN delivery, and folder organization.',
        icon: Cloud,
      },
      {
        title: 'Content Blocks',
        description: 'Reusable content blocks, embeds, callouts, and dynamic components for rich layouts.',
        icon: Layers,
      },
      {
        title: 'Version History',
        description: 'Complete revision history with diff view, rollback, and branch-based drafting.',
        icon: Database,
      },
    ],
  },
  {
    category: 'Publishing & SEO',
    icon: Globe,
    features: [
      {
        title: 'SEO Optimization',
        description: 'Built-in SEO analysis, meta tags, structured data, and sitemap generation.',
        icon: Globe,
      },
      {
        title: 'Custom Domains',
        description: 'Connect your own domain with automatic SSL, DNS management, and CDN.',
        icon: Globe,
      },
      {
        title: 'Scheduling & Automation',
        description: 'Schedule posts, set up recurring publications, and automate social sharing.',
        icon: Zap,
      },
      {
        title: 'Analytics Dashboard',
        description: 'Real-time views, engagement metrics, audience insights, and exportable reports.',
        icon: BarChart,
      },
    ],
  },
  {
    category: 'Collaboration & Security',
    icon: Users,
    features: [
      {
        title: 'Team Workspaces',
        description: 'Role-based access, shared workspaces, and team-wide content libraries.',
        icon: Users,
      },
      {
        title: 'Review Workflows',
        description: 'Approval chains, comments, suggestions, and editorial calendars.',
        icon: Check,
      },
      {
        title: 'Enterprise Security',
        description: 'SSO/SAML, 2FA, audit logs, data encryption, and compliance certifications.',
        icon: Lock,
      },
      {
        title: 'API & Integrations',
        description: 'REST/GraphQL API, webhooks, Zapier, and custom webhook endpoints.',
        icon: Zap,
      },
    ],
  },
];

const stats = [
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '< 100ms', label: 'Global Latency' },
  { value: '100+', label: 'Integrations' },
  { value: '50K+', label: 'Active Creators' },
];

export default function FeaturesPage() {
  return (
    <>
      <SEO
        title="Features | Lumora"
        description="Discover powerful features for content creation, publishing, collaboration, and analytics. Built for modern creators and teams."
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
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-medium text-white/80">Everything You Need to Create & Scale</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Features That
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Scale With You
            </span>
          </h1>

          <p className="mb-12 max-w-2xl text-lg leading-relaxed text-white/70">
            From solo creators to enterprise teams. Powerful features that grow with your ambitions.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            >
              Start Free
              <svg
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-all hover:border-white/30 hover:bg-white/10"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative border-y border-white/10 bg-black py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, _index) => (
              <div key={stat.label} className="text-center">
                <div className="mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl lg:text-5xl">
                  {stat.value}
                </div>
                <p className="text-sm text-white/70 sm:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      {featureCategories.map((category, catIndex) => (
        <section key={category.category} className="relative bg-gradient-to-b from-gray-950 to-black py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span className="font-medium text-white/80">{category.category}</span>
              </div>
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">{category.category}</h2>
              <p className="mx-auto max-w-2xl text-lg text-white/70">
                Powerful tools designed for modern content teams
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {category.features.map((feature, featIndex) => (
                <article
                  key={feature.title}
                  className="to-white/2 group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 p-8 transition-all duration-500 hover:scale-[1.02] hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                  style={{ transitionDelay: `${(catIndex * 4 + featIndex) * 50}ms` }}
                >
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 transition-transform group-hover:scale-110">
                    <feature.icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>

                  <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <svg className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Stats */}
      <section className="relative bg-gradient-to-b from-gray-950 to-black py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Trusted by Creators Worldwide</h2>
            <p className="mx-auto max-w-2xl text-lg text-white/70">
              Join thousands of creators who trust Lumora to power their content
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, _index) => (
              <div key={stat.label} className="text-center">
                <div className="mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl lg:text-5xl">
                  {stat.value}
                </div>
                <p className="text-sm text-white/70 sm:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-black py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 p-12 lg:p-16">
            <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Ready to Experience the Difference?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/70">
              Join thousands of creators who trust Lumora to power their content. Start free, scale infinitely.
            </p>
            <Link
              to="/register"
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
