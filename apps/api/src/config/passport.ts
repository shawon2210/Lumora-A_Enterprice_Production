/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';
import { authService } from '@/modules/auth/auth.service';
import { config } from '@/config/env';

export function configurePassport() {
  if (config.oauth.google.clientId && config.oauth.google.clientSecret) {
    passport.use(
      'google',
      new GoogleStrategy(
        {
          clientID: config.oauth.google.clientId,
          clientSecret: config.oauth.google.clientSecret,
          callbackURL: config.oauth.google.callbackUrl,
        } as any,
        async (accessToken: any, refreshToken: any, profile: any, done: any) => {
          try {
            const result = await authService.handleOAuth('google', {
              sub: String(profile.id),
              email: profile.emails?.[0]?.value || '',
              name: profile.displayName || '',
            });
            return done(null, result);
          } catch (error) {
            return done(error as Error, undefined);
          }
        },
      ),
    );
  }

  if (config.oauth.github.clientId && config.oauth.github.clientSecret) {
    passport.use(
      'github',
      new GithubStrategy(
        {
          clientID: config.oauth.github.clientId,
          clientSecret: config.oauth.github.clientSecret,
          callbackURL: config.oauth.github.callbackUrl,
          passReqToCallback: true,
        } as any,
        async (req: any, accessToken: any, refreshToken: any, profile: any, done: any) => {
          try {
            const result = await authService.handleOAuth('github', {
              sub: String(profile.id),
              email: profile.emails?.[0]?.value || '',
              name: profile.displayName || profile.username || '',
            });
            return done(null, result);
          } catch (error) {
            return done(error as Error, undefined);
          }
        },
      ),
    );
  }

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj: any, done) => {
    done(null, obj);
  });

  return passport;
}
