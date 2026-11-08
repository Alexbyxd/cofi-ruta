import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { DomainException } from '../common/errors/domain.exception';

jest.mock('@nestjs/jwt', () => {
  return {
    JwtService: class MockJwtService {
      signAsync = jest.fn();
      verifyAsync = jest.fn();
    },
  };
});

function codeOf(error: unknown): unknown {
  return (error as DomainException).getResponse()
    ? ((error as DomainException).getResponse() as { code?: string }).code
    : undefined;
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  const publicUser = {
    id: 'u1',
    email: 'test@cofi.com',
    fullName: 'Test User',
    avatarUrl: null,
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      account: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      session: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('access-token'),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('rejects an already registered email with a domain error', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(
        service.register({
          email: 'test@cofi.com',
          password: 'password123',
          fullName: 'Test User',
        }),
      ).rejects.toMatchObject({ code: 'EMAIL_ALREADY_REGISTERED' });
    });

    it('normalizes the email, hashes the password and creates a session', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(publicUser);
      prisma.session.create.mockResolvedValue({ id: 's1' });

      const result = await service.register({
        email: '  Test.User@Example.COM ',
        password: 'password123',
        fullName: 'Test User',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test.user@example.com' },
        select: { id: true },
      });

      const createArgs = prisma.user.create.mock.calls[0][0] as {
        data: { email: string; passwordHash: string };
      };
      expect(createArgs.data.email).toBe('test.user@example.com');
      expect(createArgs.data.passwordHash).toMatch(/^\$2[aby]\$12\$/);
      expect(
        await bcrypt.compare('password123', createArgs.data.passwordHash),
      ).toBe(true);

      expect(prisma.session.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).not.toContain('.');
      expect(result.expiresIn).toBe(900);
    });
  });

  describe('login', () => {
    it('rejects unknown users with INVALID_CREDENTIALS', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const error = await service
        .login({ email: 'unknown@cofi.com', password: 'password123' })
        .catch((caught: unknown) => caught);

      expect(codeOf(error)).toBe('INVALID_CREDENTIALS');
    });

    it('rejects a wrong password with INVALID_CREDENTIALS', async () => {
      const hash = await bcrypt.hash('realpassword', 12);
      prisma.user.findUnique.mockResolvedValue({
        ...publicUser,
        passwordHash: hash,
        isActive: true,
      });

      const error = await service
        .login({ email: 'user@cofi.com', password: 'wrongpassword' })
        .catch((caught: unknown) => caught);

      expect(codeOf(error)).toBe('INVALID_CREDENTIALS');
    });

    it('rejects inactive accounts with ACCOUNT_INACTIVE', async () => {
      const hash = await bcrypt.hash('mypassword', 12);
      prisma.user.findUnique.mockResolvedValue({
        ...publicUser,
        passwordHash: hash,
        isActive: false,
      });

      const error = await service
        .login({ email: 'user@cofi.com', password: 'mypassword' })
        .catch((caught: unknown) => caught);

      expect(codeOf(error)).toBe('ACCOUNT_INACTIVE');
    });

    it('returns tokens on valid credentials', async () => {
      const hash = await bcrypt.hash('mypassword', 12);
      prisma.user.findUnique.mockResolvedValue({
        ...publicUser,
        passwordHash: hash,
        isActive: true,
      });
      prisma.session.create.mockResolvedValue({ id: 's1' });

      const result = await service.login({
        email: 'user@cofi.com',
        password: 'mypassword',
      });

      expect(result.user.id).toBe('u1');
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBeTruthy();
    });
  });

  describe('refreshTokens', () => {
    it('rejects an unknown or expired refresh token', async () => {
      prisma.session.findFirst.mockResolvedValue(null);

      const error = await service
        .refreshTokens('bad-token')
        .catch((caught: unknown) => caught);

      expect(codeOf(error)).toBe('INVALID_REFRESH_TOKEN');
    });

    it('rotates the stored hash and reissues tokens', async () => {
      prisma.session.findFirst.mockResolvedValue({
        id: 's1',
        userId: 'u1',
        userAgent: 'test-agent',
        ipAddress: null,
        user: { ...publicUser, isActive: true },
      });
      prisma.session.update.mockResolvedValue({ id: 's1' });

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).not.toBe('valid-refresh-token');
      expect(prisma.session.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 's1' } }),
      );
    });

    it('rejects inactive users', async () => {
      prisma.session.findFirst.mockResolvedValue({
        id: 's1',
        userId: 'u1',
        user: { ...publicUser, isActive: false },
      });

      const error = await service
        .refreshTokens('valid-refresh-token')
        .catch((caught: unknown) => caught);

      expect(codeOf(error)).toBe('ACCOUNT_INACTIVE');
    });
  });

  describe('logout', () => {
    it('revokes only the matching session', async () => {
      prisma.session.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.logout('some-refresh-token');
      expect(result.revoked).toBe(1);
      expect(prisma.session.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ revokedAt: null }),
        }),
      );
    });
  });

  describe('getMe', () => {
    it('returns the profile with active duo links and merchant memberships', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...publicUser,
        isActive: true,
        accounts: [],
        duoAsUserA: [],
        duoAsUserB: [],
        merchantStaff: [],
      });

      const profile = await service.getMe('u1');
      expect(profile.id).toBe('u1');
      expect(profile.avatarUrl).toBeNull();
    });

    it('throws NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('changePassword', () => {
    it('rejects when the current password does not match', async () => {
      const hash = await bcrypt.hash('realpassword', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        passwordHash: hash,
      });

      const error = await service
        .changePassword('u1', 's1', {
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        })
        .catch((caught: unknown) => caught);

      expect(codeOf(error)).toBe('WRONG_PASSWORD');
    });

    it('hashes the new password and revokes the other sessions', async () => {
      const hash = await bcrypt.hash('realpassword', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        passwordHash: hash,
      });
      prisma.user.update.mockResolvedValue({ id: 'u1' });
      prisma.session.updateMany.mockResolvedValue({ count: 1 });
      prisma.$transaction.mockResolvedValue([]);

      const result = await service.changePassword('u1', 's1', {
        currentPassword: 'realpassword',
        newPassword: 'newpassword123',
      });

      expect(result.message).toBeTruthy();
      expect(prisma.session.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: { not: 's1' } }),
        }),
      );
    });
  });

  describe('googleLogin', () => {
    const googleUser = {
      ...publicUser,
      email: 'carlos@cofi.com',
      fullName: 'Carlos Morales',
      avatarUrl: 'https://lh3.googleusercontent.com/a/carlos',
      isActive: true,
    };

    it('rejects an unverified Google email before creating a user', async () => {
      prisma.account.findUnique.mockResolvedValue(null);

      const error = await service
        .googleLogin({
          googleId: 'google-123',
          email: 'carlos@cofi.com',
          emailVerified: false,
          fullName: 'Carlos Morales',
        })
        .catch((caught: unknown) => caught);

      expect(codeOf(error)).toBe('GOOGLE_EMAIL_NOT_VERIFIED');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('asks for explicit signup instead of creating an unknown verified user', async () => {
      prisma.account.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);

      const error = await service
        .googleLogin({
          googleId: 'google-123',
          email: 'carlos@cofi.com',
          emailVerified: true,
          fullName: 'Carlos Morales',
          avatarUrl: 'https://lh3.googleusercontent.com/a/carlos',
        })
        .catch((caught: unknown) => caught);

      expect(codeOf(error)).toBe('GOOGLE_ACCOUNT_NOT_REGISTERED');
      expect(
        (error as DomainException).getResponse() as {
          details?: { signupToken?: string };
        },
      ).toMatchObject({ details: { signupToken: 'access-token' } });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('links a verified account that already exists locally', async () => {
      prisma.account.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(googleUser);
      prisma.account.create.mockResolvedValue({ id: 'acct-1' });
      prisma.session.create.mockResolvedValue({ id: 's-google' });

      const result = await service.googleLogin({
        googleId: 'google-123',
        email: 'carlos@cofi.com',
        emailVerified: true,
        fullName: 'Carlos Morales',
        avatarUrl: 'https://lh3.googleusercontent.com/a/carlos',
      });

      expect(result.user.id).toBe('u1');
      expect(result.accessToken).toBe('access-token');
      expect(prisma.account.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          provider: 'google',
          providerAccountId: 'google-123',
        },
      });
    });

    it('reuses an already linked account without creating a user', async () => {
      prisma.account.findUnique.mockResolvedValue({
        id: 'acct-1',
        user: googleUser,
      });
      prisma.session.create.mockResolvedValue({ id: 's-google' });

      const result = await service.googleLogin({
        googleId: 'google-123',
        email: 'carlos@cofi.com',
        emailVerified: true,
        fullName: 'Carlos Morales',
      });

      expect(result.user.id).toBe('u1');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('registerWithGoogle', () => {
    const googleUser = {
      ...publicUser,
      email: 'carlos@cofi.com',
      fullName: 'Carlos Morales',
      avatarUrl: 'https://lh3.googleusercontent.com/a/carlos',
      isActive: true,
    };

    const signupPayload = {
      purpose: 'google_signup' as const,
      googleId: 'google-123',
      email: 'carlos@cofi.com',
      fullName: 'Carlos Morales',
      avatarUrl: 'https://lh3.googleusercontent.com/a/carlos',
    };

    it('creates the user, links the Google account and returns tokens', async () => {
      jwtService.verifyAsync.mockResolvedValue(signupPayload);
      prisma.account.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(googleUser);
      prisma.account.create.mockResolvedValue({ id: 'acct-1' });
      prisma.session.create.mockResolvedValue({ id: 's-google' });

      const result = await service.registerWithGoogle('signup-token');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('signup-token', {
        secret: expect.any(String),
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'carlos@cofi.com',
          fullName: 'Carlos Morales',
          avatarUrl: 'https://lh3.googleusercontent.com/a/carlos',
        },
      });
      expect(prisma.account.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          provider: 'google',
          providerAccountId: 'google-123',
        },
      });
      expect(result.user.id).toBe('u1');
      expect(result.accessToken).toBe('access-token');
    });

    it('rejects an invalid or expired signup token without creating users', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      const error = await service
        .registerWithGoogle('bad-token')
        .catch((caught: unknown) => caught);

      expect(codeOf(error)).toBe('GOOGLE_SIGNUP_INVALID');
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(prisma.account.create).not.toHaveBeenCalled();
    });
  });
});
