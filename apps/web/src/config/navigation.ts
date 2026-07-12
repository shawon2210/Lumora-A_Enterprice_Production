export const navLinks = [
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Features', path: '/features' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Community', path: '/community' },
] as const;

export type NavigationLink = (typeof navLinks)[number];
