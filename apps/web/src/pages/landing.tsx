import { useState, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { SEO } from '@/components/seo';

const videoUrls = [
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4',
];

const videoLabels = ['Golden Hour', 'Still Water', 'Deep Woods', 'Quiet Dawn'];
const navLinks = ['How It Works', 'Features', 'Pricing', 'Community'];

export default function LandingPage() {
  const [activeVideo, setActiveVideo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleVideoSwitch = useCallback(
    (index: number) => {
      if (index === activeVideo || isTransitioning) return;
      setIsTransitioning(true);
      setActiveVideo(index);
      setTimeout(() => setIsTransitioning(false), 1000);
    },
    [activeVideo, isTransitioning],
  );

  const isDarkMode = activeVideo === 2;

  const heroTextClass = isDarkMode ? 'text-[#182C41]' : 'text-white';
  const heroSubTextClass = isDarkMode ? 'text-[#182C41]/80' : 'text-white/80';
  const heroMutedTextClass = isDarkMode ? 'text-[#182C41]/50' : 'text-white/50';
  const heroHoverTextClass = isDarkMode ? 'hover:text-[#182C41]/80' : 'hover:text-white/80';
  const heroActiveBorder = isDarkMode ? 'border-[#182C41]' : 'border-white';
  const inputTextClass = isDarkMode ? 'text-[#182C41]' : 'text-white';
  const inputPlaceholderClass = isDarkMode ? 'placeholder-[#182C41]/50' : 'placeholder-white/50';

  return (
    <>
      <SEO />
      <section className="relative h-screen w-full overflow-hidden bg-black">
        {/* Video Layer */}
        <div className="absolute inset-0 z-0">
          {videoUrls.map((url, index) => (
            <video
              key={url}
              src={url}
              autoPlay
              muted
              loop
              playsInline
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
                index === activeVideo ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>

        {/* PNG Overlay */}
        <div className="pointer-events-none absolute inset-0 z-[1]">
          <img
            src="https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png"
            alt=""
            className="animate-train-bob absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* Content Layer */}
        <div className="relative z-[2] flex h-full flex-col px-4 sm:px-6 lg:px-8">
          {/* Navigation */}
          <nav className="flex items-center justify-between py-6">
            {/* Logo */}
            <div className="text-xl italic text-white sm:text-2xl" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Lumora
            </div>

            {/* Desktop Nav */}
            <div className="hidden items-center md:flex">
              <div className="liquid-glass flex items-center gap-1 rounded-full px-2 py-2">
                {navLinks.map((link) => (
                  <a
                    key={link}
                    href="#{link.toLowerCase().replace(' ', '-')}"
                    className="rounded-full px-4 py-2 text-sm text-white/90 transition-colors hover:text-white"
                    style={{ fontFamily: 'system-ui, sans-serif' }}
                  >
                    {link}
                  </a>
                ))}
                <button
                  className="rounded-full bg-white px-5 py-2 text-sm text-black transition-colors hover:bg-white/90"
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="liquid-glass relative flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span
                className={`absolute transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? 'rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'
                }`}
              >
                <Menu className="h-5 w-5 text-white" />
              </span>
              <span
                className={`absolute transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0'
                }`}
              >
                <X className="h-5 w-5 text-white" />
              </span>
            </button>
          </nav>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
                {navLinks.map((link, i) => (
                  <a
                    key={link}
                    href="#{link.toLowerCase().replace(' ', '-')}"
                    className="animate-menu-slide-up text-3xl text-white"
                    style={{
                      fontFamily: 'system-ui, sans-serif',
                      animationDelay: `${(i + 2) * 50}ms`,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                    }}
                  >
                    {link}
                  </a>
                ))}
                <button
                  className="animate-menu-scale-in rounded-full bg-white px-8 py-3 text-lg text-black"
                  style={{
                    fontFamily: 'system-ui, sans-serif',
                    animationDelay: '300ms',
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </button>
              </div>
            </div>
          )}

          {/* Hero Content */}
          <div className="-mt-16 flex flex-1 flex-col items-center justify-center text-center">
            {/* Badge */}
            <div
              className={`liquid-glass mb-6 rounded-full px-5 py-2.5 transition-colors duration-700 ${heroTextClass}`}
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              <span className="text-sm sm:text-base">Over 10,000 minds already finding their clarity</span>
            </div>

            {/* Heading */}
            <h1
              className={`mb-6 max-w-4xl text-4xl font-normal leading-[1.1] transition-colors duration-700 sm:text-5xl md:text-7xl lg:text-[5.5rem] ${heroTextClass}`}
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Clarity in an Endlessly
              <br />
              Noisy Universe
            </h1>

            {/* Subtext */}
            <p
              className={`mb-8 max-w-xl text-sm leading-relaxed transition-colors duration-700 sm:text-base ${heroSubTextClass}`}
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              Rise above the chaos of pings, infinite scrolling, and relentless demands. Discover how to protect your
              presence and create with intention.
            </p>

            {/* Email Input */}
            <div className="liquid-glass mb-8 flex w-full max-w-[320px] items-center rounded-full p-1.5 sm:max-w-sm">
              <input
                type="email"
                placeholder="Your Best Email"
                className={`flex-1 bg-transparent ${inputTextClass} ${inputPlaceholderClass} px-4 py-2 text-sm outline-none`}
                style={{ fontFamily: 'system-ui, sans-serif' }}
              />
              <button
                className="whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-sm text-black transition-colors hover:bg-white/90"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                Get Early Access
              </button>
            </div>

            {/* Video Switcher */}
            <div className="flex items-center gap-2 sm:gap-4">
              {videoLabels.map((label, index) => (
                <button
                  key={label}
                  onClick={() => handleVideoSwitch(index)}
                  className={`border-b-2 pb-1 text-sm transition-all duration-300 sm:text-base ${
                    index === activeVideo
                      ? `${heroTextClass} ${heroActiveBorder} opacity-100`
                      : `${heroMutedTextClass} border-transparent ${heroHoverTextClass}`
                  }`}
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                  disabled={isTransitioning}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Stats */}
          <div
            className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 pb-6 text-xs text-white/70 sm:text-sm"
            style={{ fontFamily: 'system-ui, sans-serif' }}
          >
            <span>60+ Deep Sessions</span>
            <span className="hidden sm:inline">|</span>
            <span>12,000+ Creators</span>
            <span className="hidden sm:inline">|</span>
            <span>4.8 User Satisfaction</span>
            <span className="hidden sm:inline">|</span>
            <span>Intentional-First Design</span>
          </div>

          {/* Features Section */}
          <section id="features" className="relative bg-black/50 px-4 py-20">
            <div className="container mx-auto max-w-7xl">
              <h2 className="mb-16 text-center text-5xl font-bold">Features</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Feature Cards */}
                <div className="liquid-glass rounded-xl p-6 transition-transform hover:scale-105">
                  <h3 className="mb-4 text-2xl font-semibold">Blog Management</h3>
                  <p className="text-white/70">
                    Create, read, update, and delete blog posts with tagging and categorization.
                  </p>
                </div>
                <div className="liquid-glass rounded-xl p-6 transition-transform hover:scale-105">
                  <h3 className="mb-4 text-2xl font-semibold">Media Upload</h3>
                  <p className="text-white/70">
                    Cloud-based file uploads with folder organization and Cloudinary integration.
                  </p>
                </div>
                <div className="liquid-glass rounded-xl p-6 transition-transform hover:scale-105">
                  <h3 className="mb-4 text-2xl font-semibold">User Auth</h3>
                  <p className="text-white/70">Secure JWT-based authentication with httpOnly cookies and OAuth.</p>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="relative bg-black/30 px-4 py-20">
            <div className="container mx-auto max-w-7xl">
              <h2 className="mb-16 text-center text-5xl font-bold">How It Works</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* How It Works Cards */}
                <div className="liquid-glass rounded-xl p-6 transition-transform hover:scale-105">
                  <h3 className="mb-4 text-2xl font-semibold">1. Sign Up</h3>
                  <p className="text-white/70">Register with your email or using OAuth providers to get started.</p>
                </div>
                <div className="liquid-glass rounded-xl p-6 transition-transform hover:scale-105">
                  <h3 className="mb-4 text-2xl font-semibold">2. Create Content</h3>
                  <p className="text-white/70">Write and manage your blog posts and media files with ease.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="relative bg-black/50 px-4 py-20">
            <div className="container mx-auto max-w-7xl">
              <h2 className="mb-16 text-center text-5xl font-bold">Pricing</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Pricing Cards */}
                <div className="liquid-glass rounded-xl p-6 transition-transform hover:scale-105">
                  <h3 className="mb-4 text-2xl font-semibold">Free</h3>
                  <p className="my-4 text-4xl font-bold">$0</p>
                  <p className="text-white/70">Basic features for getting started.</p>
                </div>
                <div className="liquid-glass rounded-xl border-2 border-white/20 p-6 transition-transform hover:scale-105">
                  <h3 className="mb-4 text-2xl font-semibold">Pro</h3>
                  <p className="my-4 text-4xl font-bold">$19</p>
                  <p className="text-white/70">Advanced features for power users.</p>
                </div>
                <div className="liquid-glass rounded-xl p-6 transition-transform hover:scale-105">
                  <h3 className="mb-4 text-2xl font-semibold">Enterprise</h3>
                  <p className="my-4 text-4xl font-bold">$99</p>
                  <p className="text-white/70">Full suite for organizations.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Community Section */}
          <section id="community" className="relative bg-black/30 px-4 py-20">
            <div className="container mx-auto max-w-7xl">
              <h2 className="mb-16 text-center text-5xl font-bold">Community</h2>
              <div className="mx-auto max-w-3xl">
                <p className="mb-8 text-center text-lg text-white/70">
                  Join our vibrant community of creators, developers, and thinkers. Share your work, get feedback, and
                  grow together.
                </p>
                <div className="flex justify-center">
                  <div className="liquid-glass rounded-xl p-8">
                    <h3 className="mb-4 text-2xl font-semibold">Get Started Today</h3>
                    <button className="rounded-full bg-white px-8 py-3 text-lg text-black transition-colors hover:bg-white/90">
                      Join Community
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
