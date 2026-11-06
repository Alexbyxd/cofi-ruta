import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { accessTokenSecret } from '../auth.constants';
import { authErrors } from '../auth.errors';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  sid: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  createdAt: Date;
  sessionId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: accessTokenSecret(),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload.sid) {
      throw authErrors.sessionExpired();
    }

    const session = await this.prisma.session.findFirst({
      where: {
        id: payload.sid,
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    if (!session) {
      throw authErrors.sessionExpired();
    }

    if (!session.user.isActive) {
      throw authErrors.accountInactive();
    }

    return {
      id: session.user.id,
      email: session.user.email,
      fullName: session.user.fullName,
      avatarUrl: session.user.avatarUrl,
      role: session.user.role,
      createdAt: session.user.createdAt,
      sessionId: session.id,
    };
  }
}
