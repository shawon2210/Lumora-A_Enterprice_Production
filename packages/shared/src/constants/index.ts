export const APP_NAME = 'Lumora';
export const APP_TAGLINE = 'Clarity in an Endlessly Noisy Universe';
export const APP_DESCRIPTION =
  'Rise above the chaos of pings, infinite scrolling, and relentless demands. Discover how to protect your presence and create with intention.';

export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

export const PAGINATION_DEFAULT_PAGE = 1;
export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;

export const TOAST_DURATION = 5000;
export const DEBOUNCE_DELAY = 300;
export const SEARCH_DEBOUNCE_DELAY = 400;

export const SESSION_COOKIE_NAME = 'lumora_session';
export const REFRESH_COOKIE_NAME = 'lumora_refresh';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  BILLING: '/billing',
  BLOG: '/blog',
  CONTACT: '/contact',
  FAQ: '/faq',
  DOCS: '/docs',
  NOT_FOUND: '/404',
} as const;
