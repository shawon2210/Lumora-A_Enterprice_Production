function env(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function envInt(key: string, fallback?: number): number {
  const raw = process.env[key];
  if (raw) return parseInt(raw, 10);
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required environment variable: ${key}`);
}

export const config = {
  nodeEnv: env('NODE_ENV', 'development'),
  port: envInt('PORT', 4000),
  apiPrefix: '/api/v1',
  frontendUrl: env('FRONTEND_URL', 'http://localhost:5173'),
  backendUrl: env('BACKEND_URL', 'http://localhost:4000'),

  jwt: {
    accessSecret: env('JWT_ACCESS_SECRET'),
    refreshSecret: env('JWT_REFRESH_SECRET'),
    accessExpiresIn: env('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: env('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  database: {
    url: env('DATABASE_URL'),
  },

  redis: {
    url: env('REDIS_URL', 'redis://localhost:6379'),
  },

  cors: {
    origin: env('CORS_ORIGIN', 'http://localhost:5173'),
  },

  oauth: {
    google: {
      clientId: env('GOOGLE_CLIENT_ID', ''),
      clientSecret: env('GOOGLE_CLIENT_SECRET', ''),
      callbackUrl: env('GOOGLE_CALLBACK_URL', 'http://localhost:4000/api/v1/auth/google/callback'),
    },
    github: {
      clientId: env('GITHUB_CLIENT_ID', ''),
      clientSecret: env('GITHUB_CLIENT_SECRET', ''),
      callbackUrl: env('GITHUB_CALLBACK_URL', 'http://localhost:4000/api/v1/auth/github/callback'),
    },
  },

  email: {
    resendApiKey: env('RESEND_API_KEY', ''),
    from: env('EMAIL_FROM', 'noreply@lumora.app'),
  },

  cloudinary: {
    cloudName: env('CLOUDINARY_CLOUD_NAME', ''),
    apiKey: env('CLOUDINARY_API_KEY', ''),
    apiSecret: env('CLOUDINARY_API_SECRET', ''),
  },

  rateLimit: {
    windowMs: envInt('RATE_LIMIT_WINDOW_MS', 60000),
    max: envInt('RATE_LIMIT_MAX', 100),
  },

  session: {
    rememberMeDays: envInt('REMEMBER_ME_DAYS', 30),
  },
};
