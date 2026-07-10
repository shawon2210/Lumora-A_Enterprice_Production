import { config } from '@/config/env';

// Simple email service interface - can be extended with Resend, SendGrid, etc.
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Mock email service for now - in production, use Resend API
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { resendApiKey, from } = config.email;

  if (!resendApiKey) {
    console.warn(
      '[EMAIL] Resend API key not configured — email not sent (dev mode). Set RESEND_API_KEY in production.',
    );
    console.log(`[EMAIL] To: ${options.to}`);
    console.log(`[EMAIL] Subject: ${options.subject}`);
    console.log(`[EMAIL] HTML: ${options.html}`);
    return true;
  }

  // Production: Integrate with Resend API
  try {
    const response = await fetch('https://api.resend.com/v1/email', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send email:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

export function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

export function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const verifyUrl = `${config.frontendUrl}/verify-email?token=${token}`;
  return sendEmail({
    to: email,
    subject: 'Verify Your Email',
    html: `
      <h1>Welcome to Lumora!</h1>
      <p>Please verify your email address:</p>
      <a href="${verifyUrl}">Verify Email</a>
    `,
  });
}
