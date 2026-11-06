import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_TTL_SECONDS,
  BCRYPT_ROUNDS,
  REFRESH_TOKEN_TTL_MS,
  accessTokenSecret,
} from './auth.constants';
import { authErrors } from './auth.errors';
import type {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
} from './dto/auth.dto';

export interface SessionMeta {
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface GoogleLoginProfile {
  googleId: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
  avatarUrl?: string;
}

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const publicUserSelect = {
  id: true,
  email: true,
  fullName: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

function toPublicUser(user: PublicUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private createRefreshToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  private async issueSession(
    userId: string,
    meta: SessionMeta,
  ): Promise<{ sessionId: string; refreshToken: string }> {
    const refreshToken = this.createRefreshToken();
    const now = new Date();

    const session = await this.prisma.session.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        userAgent: meta.userAgent ?? null,
        ipAddress: meta.ipAddress ?? null,
        expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS),
        lastUsedAt: now,
      },
    });

    return { sessionId: session.id, refreshToken };
  }

  private async buildAuthResponse(
    user: PublicUser,
    sessionId: string,
    refreshToken: string,
  ) {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        sid: sessionId,
      },
      { secret: accessTokenSecret(), expiresIn: ACCESS_TOKEN_EXPIRES_IN },
    );

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  async register(dto: RegisterDto, meta: SessionMeta = {}) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      throw authErrors.emailAlreadyRegistered();
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    let user: PublicUser;
    try {
      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName: dto.fullName,
          avatarUrl: dto.avatarUrl ?? null,
        },
        select: publicUserSelect,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw authErrors.emailAlreadyRegistered();
      }
      throw error;
    }

    const { sessionId, refreshToken } = await this.issueSession(user.id, meta);

    return this.buildAuthResponse(user, sessionId, refreshToken);
  }

  async login(dto: LoginDto, meta: SessionMeta = {}) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user?.passwordHash) {
      throw authErrors.invalidCredentials();
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw authErrors.invalidCredentials();
    }

    if (!user.isActive) {
      throw authErrors.accountInactive();
    }

    const { sessionId, refreshToken } = await this.issueSession(user.id, meta);

    return this.buildAuthResponse(toPublicUser(user), sessionId, refreshToken);
  }

  async refreshTokens(refreshToken: string, meta: SessionMeta = {}) {
    const session = await this.prisma.session.findFirst({
      where: {
        tokenHash: this.hashToken(refreshToken),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!session?.user) {
      throw authErrors.invalidRefreshToken();
    }

    if (!session.user.isActive) {
      throw authErrors.accountInactive();
    }

    const nextToken = this.createRefreshToken();
    const now = new Date();

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        tokenHash: this.hashToken(nextToken),
        expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS),
        lastUsedAt: now,
        userAgent: meta.userAgent ?? session.userAgent,
        ipAddress: meta.ipAddress ?? session.ipAddress,
      },
    });

    return this.buildAuthResponse(
      toPublicUser(session.user),
      session.id,
      nextToken,
    );
  }

  async logout(refreshToken: string) {
    const result = await this.prisma.session.updateMany({
      where: { tokenHash: this.hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Sesión cerrada', revoked: result.count };
  }

  async logoutAll(userId: string) {
    const result = await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return {
      message: 'Todas las sesiones fueron cerradas',
      revoked: result.count,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...publicUserSelect,
        isActive: true,
        accounts: {
          select: { provider: true, createdAt: true },
        },
        duoAsUserA: {
          where: { status: 'ACTIVE' },
          include: {
            userB: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                email: true,
              },
            },
          },
        },
        duoAsUserB: {
          where: { status: 'ACTIVE' },
          include: {
            userA: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                email: true,
              },
            },
          },
        },
        merchantStaff: {
          select: {
            role: true,
            coffeeShop: {
              select: { id: true, name: true, slug: true, status: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<PublicUser> {
    const data: Prisma.UserUpdateInput = {};

    if (dto.fullName !== undefined) {
      data.fullName = dto.fullName;
    }

    if (dto.avatarUrl !== undefined) {
      data.avatarUrl = dto.avatarUrl;
    }

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data,
        select: publicUserSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw authErrors.userNotFound();
      }
      throw error;
    }
  }

  async changePassword(
    userId: string,
    currentSessionId: string,
    dto: ChangePasswordDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      throw authErrors.userNotFound();
    }

    if (!user.passwordHash) {
      throw authErrors.passwordNotSet();
    }

    const matches = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!matches) {
      throw authErrors.wrongPassword();
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      this.prisma.session.updateMany({
        where: {
          userId,
          revokedAt: null,
          id: { not: currentSessionId },
        },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Contraseña actualizada' };
  }

  async getSessions(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
      },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const result = await this.prisma.session.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    if (result.count === 0) {
      throw authErrors.sessionNotFound();
    }

    return { message: 'Sesión revocada' };
  }

  async googleLogin(profile: GoogleLoginProfile, meta: SessionMeta = {}) {
    const account = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: profile.googleId,
        },
      },
      include: { user: true },
    });

    let user = account?.user ?? null;

    if (!user) {
      if (!profile.emailVerified) {
        throw authErrors.googleEmailNotVerified();
      }

      const email = profile.email.toLowerCase().trim();
      user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            fullName: profile.fullName || email,
            avatarUrl: profile.avatarUrl ?? null,
          },
        });
      }

      try {
        await this.prisma.account.create({
          data: {
            userId: user.id,
            provider: 'google',
            providerAccountId: profile.googleId,
          },
        });
      } catch (error) {
        // Otra petición pudo haber vinculado la cuenta en paralelo.
        if (!isUniqueConstraintError(error)) {
          throw error;
        }
      }
    }

    if (!user.isActive) {
      throw authErrors.accountInactive();
    }

    const { sessionId, refreshToken } = await this.issueSession(user.id, meta);

    return this.buildAuthResponse(toPublicUser(user), sessionId, refreshToken);
  }
}
