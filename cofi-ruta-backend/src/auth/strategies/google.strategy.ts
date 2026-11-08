import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import {
  DomainException,
  type DomainErrorBody,
} from '../../common/errors/domain.exception';

export interface GoogleOAuthProfile {
  id: string;
  emails?: { value: string; verified?: boolean }[];
  displayName?: string;
  photos?: { value: string }[];
}

// GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET son requeridos en runtime para
// que la estrategia funcione. Se validan como opcionales en env.schema para
// no bloquear el arranque cuando Google OAuth no está configurado aún.
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GoogleOAuthProfile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const result = await this.authService.googleLogin({
        googleId: profile.id,
        email: profile.emails?.[0]?.value || '',
        emailVerified: profile.emails?.[0]?.verified === true,
        fullName: profile.displayName || '',
        avatarUrl: profile.photos?.[0]?.value,
      });
      done(null, result);
    } catch (err) {
      if (err instanceof DomainException) {
        const body = err.getResponse() as DomainErrorBody;
        const details = body.details as { signupToken?: string } | undefined;

        if (
          body.code === 'GOOGLE_ACCOUNT_NOT_REGISTERED' &&
          details?.signupToken
        ) {
          done(null, {
            status: 'signup_required',
            signupToken: details.signupToken,
            email: profile.emails?.[0]?.value || '',
            fullName: profile.displayName || '',
            avatarUrl: profile.photos?.[0]?.value ?? null,
          });
          return;
        }
      }

      done(err as Error, false);
    }
  }
}
