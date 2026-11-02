import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

export interface GoogleProfile {
  googleId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface GoogleOAuthProfile {
  id: string;
  emails?: { value: string }[];
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
    const googleProfile: GoogleProfile = {
      googleId: profile.id,
      email: profile.emails?.[0]?.value || '',
      fullName: profile.displayName || '',
      avatarUrl: profile.photos?.[0]?.value,
    };

    try {
      const result = await this.authService.googleLogin(googleProfile);
      done(null, result);
    } catch (err) {
      done(err as Error, false);
    }
  }
}
