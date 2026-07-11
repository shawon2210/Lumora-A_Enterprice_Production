import { useState } from 'react';
import { Check as CheckIcon } from 'lucide-react';
import { SEO } from '@/components/seo';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      'Up to 5 blog posts',
      'Basic editor & media',
      'Custom subdomain',
      'Basic analytics',
      'Community support',
      'SEO basics',
    ],
    cta: 'Start Free',
    popular: false,
    color: 'from-gray-800 to-gray-900',
    border: 'border-white/10',
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For serious creators',
    features: [
      'Unlimited posts & media',
      'Custom domain + SSL',
      'Advanced analytics',
      'SEO optimization tools',
      'Email newsletter',
      'Scheduled publishing',
      'Custom themes',
      'Priority support',
      'API access',
    ],
    cta: 'Get Started',
    popular: true,
    color: 'from-emerald-900/50 to-cyan-900/50',
    border: 'border-emerald-500/30',
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For teams & organizations',
    features: [
      'Everything in Pro',
      'Team workspaces (10+)',
      'SSO/SAML & 2FA',
      'Audit logs & compliance',
      'Dedicated support',
      'Custom SLA',
      'On-premise option',
      'Custom integrations',
      'Account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
    color: 'from-purple-900/50 to-violet-900/50',
    border: 'border-purple-500/30',
  },
];

const faqs = [
  {
    q: 'Can I switch plans later?',
    a: 'Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately, while downgrades take effect at the end of your billing cycle.',
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'Yes! Pro comes with a 14-day free trial. No credit card required to start.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, PayPal, and bank transfers for annual Enterprise plans.',
  },
  {
    q: 'Can I use my own domain?',
    a: 'Yes! Custom domains are included in Pro and Enterprise plans with automatic SSL.',
  },
  {
    q: 'What happens if I exceed my limits?',
    a: "We'll notify you before you hit limits. You can upgrade instantly or we'll pause publishing until the next cycle.",
  },
  {
    q: 'Do you offer discounts for nonprofits/education?',
    a: 'Yes! We offer 50% off Pro for qualified nonprofits and educational institutions. Contact sales for details.',
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  return (
    <>
      <SEO
        title="Pricing | Lumora"
        description="Simple, transparent pricing for creators and teams. Start free, upgrade when you're ready. No hidden fees."
      />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900/50 via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNjAnIGhlaWdodD0nNjAnIHZpZXdCb3g9JzAgMCA2MCA2MCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnPjxnIGZpbGw9JyNmZmZmZmYnIGZpbGwtb3BhY2l0eT0nMC4xJz48cGF0aCBkPSdNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzZ2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNlYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnogLz48L2c+PC9nPjwvc3ZnPg==',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-32">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-medium text-white/80">Simple, Transparent Pricing</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Simple, Transparent
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Pricing</span>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-white/70">
            No hidden fees. No surprise charges. Cancel anytime. All plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="mb-16 flex items-center justify-center gap-4">
            <span className={`${annual ? 'text-white/50' : 'text-white'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full bg-white/10"
              role="switch"
              aria-checked={annual}
              aria-label="Toggle annual billing"
            >
              <div
                className={`inline-block h-5 w-5 transform rounded-full bg-emerald-500 transition-transform ${annual ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <span className={`font-medium ${annual ? 'text-emerald-400' : 'text-white/50'}`}>
              Annual <span className="text-sm text-emerald-400/80">(Save 20%)</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative bg-black py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`group relative rounded-2xl p-8 transition-all duration-500 ${plan.color} ${plan.border} ${
                  plan.popular
                    ? 'shadow-[0_0_60px_rgba(16,185,129,0.15)] ring-2 ring-emerald-500/50'
                    : 'border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-black">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="mb-2 text-2xl font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-white/60">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-white">
                      {annual && plan.price !== '$0'
                        ? `$${Math.round(parseInt(plan.price.slice(1)) * 12 * 0.8)}`
                        : plan.price}
                    </span>
                    <span className="mb-1 self-end text-white/50">
                      {annual && plan.price !== '$0' ? '/year' : plan.period}
                    </span>
                  </div>
                  {plan.name === 'Free' && (
                    <p className="mt-2 text-sm font-medium text-emerald-400">No credit card required</p>
                  )}
                </div>

                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-white/80 transition-colors group-hover:text-white"
                    >
                      <CheckIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.name === 'Enterprise' ? '/contact' : '/auth/register'}
                  className={`block w-full rounded-xl py-4 text-center text-base font-semibold transition-all ${
                    plan.popular
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'border border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative bg-gradient-to-b from-gray-950 to-black py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Frequently Asked Questions</h2>
            <p className="text-lg text-white/70">Everything you need to know about our pricing and plans</p>
          </div>

          <dl className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20"
              >
                <dt className="mb-2 text-lg font-semibold text-white">{faq.q}</dt>
                <dd className="leading-relaxed text-white/70">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-black py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 p-12 lg:p-16">
            <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">Ready to Get Started?</h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/70">
              Start your 14-day free trial. No credit card required. Cancel anytime.
            </p>
            <Link
              to="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            >
              Start Free Trial
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
