import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendMessage } from '@/utils/response';
import { REFRESH_COOKIE_NAME } from '@lumora/shared';
import { config } from '@/config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict' as const,
  path: '/api/v1/auth/refresh',
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: config.session.rememberMeDays * 24 * 60 * 60 * 1000,
      });
      sendSuccess(res, { accessToken: result.accessToken, user: result.user }, undefined, 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const rememberMe = req.body.rememberMe ?? false;
      const result = await authService.login(req.body, rememberMe);
      const maxAge = rememberMe ? config.session.rememberMeDays * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge,
      });
      sendSuccess(res, { accessToken: result.accessToken, user: result.user });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined;
      if (token) {
        await authService.logout(token);
      }
      res.clearCookie(REFRESH_COOKIE_NAME, COOKIE_OPTIONS);
      sendMessage(res, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body.refreshToken;
      if (!refreshToken) {
        return sendMessage(res, 'Refresh token required', 401);
      }
      const result = await authService.refresh(refreshToken);
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);
      sendSuccess(res, { accessToken: result.accessToken, user: result.user });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email);
      sendMessage(res, 'If an account with that email exists, a password reset link has been sent');
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      sendMessage(res, 'Password reset successfully');
    } catch (err) {
      next(err);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.id);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },

  async oauthCallback(req: Request, res: Response) {
    const result = req.user as unknown as { accessToken: string; refreshToken: string };
    if (!result) {
      return res.redirect(`${config.frontendUrl}/login?error=oauth_failed`);
    }
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: config.session.rememberMeDays * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${config.frontendUrl}/auth/callback?accessToken=${result.accessToken}`);
  },
};
