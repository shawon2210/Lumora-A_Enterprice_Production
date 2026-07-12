export const navigationLinks = [
  { label: 'How It Works', href: '/how-it-works', id: 'how-it-works' },
  { label: 'Features', href: '/features', id: 'features' },
  { label: 'Pricing', href: '/pricing', id: 'pricing' },
  { label: 'Community', href: '/community', id: 'community' },
] as const;

export type NavigationLink = (typeof navigationLinks)[number];
