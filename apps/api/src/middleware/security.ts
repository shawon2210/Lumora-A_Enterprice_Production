import type { Request, Response, NextFunction } from 'express';

// Enhanced security headers middleware
export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; frame-ancestors 'none';",
    );
  }

  // HTTP Strict Transport Security (1 year)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
  );

  next();
}