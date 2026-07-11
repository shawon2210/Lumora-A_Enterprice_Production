import { Users, MessageCircle, Heart, Share2, Globe, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const communityFeatures = [
  {
    icon: Users,
    title: 'Discussion Forums',
    description:
      'Engage in meaningful discussions with creators worldwide. Ask questions, share insights, and learn from peers.',
  },
  {
    icon: MessageCircle,
    title: 'Live Q&A Sessions',
    description: 'Join weekly live sessions with experts. Ask questions in real-time and get personalized advice.',
  },
  {
    icon: Heart,
    title: 'Creator Showcases',
    description: 'Showcase your work, get feedback, and discover inspiring projects from fellow creators.',
  },
  {
    icon: Share2,
    title: 'Resource Sharing',
    description: 'Share templates, tools, and resources. Access a growing library of community-contributed assets.',
  },
  {
    icon: Globe,
    title: 'Global Events',
    description: 'Participate in virtual meetups, workshops, and hackathons. Network with creators worldwide.',
  },
  {
    icon: Star,
    title: 'Recognition Program',
    description: 'Earn badges, climb leaderboards, and get featured. Your contributions are recognized and rewarded.',
  },
];

const communityStats = [
  { value: '50K+', label: 'Active Members' },
  { value: '500+', label: 'Weekly Discussions' },
  { value: '100+', label: 'Monthly Events' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const testimonials = [
  {
    quote: "Lumora's community completely changed how I approach content creation. The feedback I get is invaluable.",
    author: 'Sarah Chen',
    role: 'Tech Writer & Content Strategist',
    avatar: 'SC',
  },
  {
    quote: "The weekly Q&A sessions alone are worth it. I've learned more in 3 months than in 2 years on my own.",
    author: 'Marcus Johnson',
    role: 'Indie Developer & Blogger',
    avatar: 'MJ',
  },
  {
    quote: 'Found my co-founder here! The community is incredibly supportive and genuinely wants everyone to succeed.',
    author: 'Priya Patel',
    role: 'Startup Founder',
    avatar: 'PP',
  },
];

export default function CommunityPage() {
  return (
    <>
      <title>Community | Lumora</title>
      <meta
        name="description"
        content="Join Lumora's vibrant community of creators. Connect, learn, and grow with 50K+ active members worldwide."
      />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNjAnIGhlaWdodD0nNjAnIHZpZXdCb3g9JzAgMCA2MCA2MCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnPjxnIGZpbGw9JyNmZmZmZmYnIGZpbGwtb3BhY2l0eT0nMC4xJz48cGF0aCBkPSdNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzZ2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNlYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnogLz48L2c+PC9nPjwvc3ZnPg==',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-32">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-4 py-2 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-300">Join 50K+ Creators</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Where Creators
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Connect & Grow
            </span>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-white/70">
            Join a vibrant community of 50K+ creators. Share knowledge, find collaborators, and grow together.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/auth/register"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black"
            >
              Join Free
              <svg
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </Link>
            <Link
              to="#features"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-8 py-4 text-base font-semibold text-emerald-300 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/20"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative border-y border-white/10 bg-black py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {communityStats.map((stat, _index) => (
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

      {/* Community Features */}
      <section className="relative bg-gradient-to-b from-gray-950 to-black py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-4 py-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="font-medium text-emerald-300">Community Features</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Everything You Need to Connect</h2>
            <p className="mx-auto max-w-2xl text-lg text-white/70">
              Powerful community features designed for meaningful connections
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {communityFeatures.map((feature, index) => (
              <article
                key={feature.title}
                className="to-white/2 group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 p-8 transition-all duration-500 hover:scale-[1.02] hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 transition-transform group-hover:scale-110">
                  <feature.icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative bg-gradient-to-b from-gray-950 to-black py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">By the Numbers</h2>
            <p className="mx-auto max-w-2xl text-lg text-white/70">
              A thriving ecosystem of creators helping each other grow
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {communityStats.map((stat, _index) => (
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

      {/* Testimonials */}
      <section className="relative bg-black py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Trusted by Creators Worldwide</h2>
            <p className="mx-auto max-w-2xl text-lg text-white/70">See what our community members have to say</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <article
                key={testimonial.author}
                className="to-white/2 group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 p-8 transition-all duration-500 hover:scale-[1.02] hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-xl font-bold text-white">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.author}</p>
                    <p className="text-sm text-white/60">{testimonial.role}</p>
                  </div>
                </div>
                <p className="mb-6 leading-relaxed text-white/80">"{testimonial.quote}"</p>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Star className="h-5 w-5 fill-current" aria-hidden="true" />
                  <Star className="h-5 w-5 fill-current" aria-hidden="true" />
                  <Star className="h-5 w-5 fill-current" aria-hidden="true" />
                  <Star className="h-5 w-5 fill-current" aria-hidden="true" />
                  <Star className="h-5 w-5 fill-current" aria-hidden="true" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-black py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 p-12 lg:p-16">
            <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">Ready to Join the Community?</h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/70">
              Connect with 50K+ creators, share your journey, and grow together. Your tribe is waiting.
            </p>
            <Link
              to="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black"
            >
              Join Free Today
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
