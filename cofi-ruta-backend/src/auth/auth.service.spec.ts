import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

jest.mock('@nestjs/jwt', () => {
  return {
    JwtService: class MockJwtService {
      signAsync = jest.fn();
      verifyAsync = jest.fn();
    },
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      account: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      session: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn().mockImplementation((payload, opts) => {
        return Promise.resolve(`token_${payload.sub}_${opts.expiresIn}`);
      }),
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
    it('should throw ConflictException if email is already registered', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@cofi.com',
      });

      await expect(
        service.register({
          email: 'test@cofi.com',
          password: 'password123',
          fullName: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user, session, and return tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'new@cofi.com',
        fullName: 'New User',
        avatarUrl: null,
        role: 'USER',
        createdAt: new Date(),
      });
      prisma.session.create.mockResolvedValue({ id: 's1' });

      const result = await service.register({
        email: 'new@cofi.com',
        password: 'securePassword123',
        fullName: 'New User',
      });

      expect(result.user.email).toBe('new@cofi.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(prisma.session.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@cofi.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const hash = await bcrypt.hash('realpassword', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@cofi.com',
        passwordHash: hash,
      });

      await expect(
        service.login({ email: 'user@cofi.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens on valid credentials', async () => {
      const hash = await bcrypt.hash('mypassword', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@cofi.com',
        fullName: 'Cofi User',
        avatarUrl: null,
        role: 'USER',
        passwordHash: hash,
        createdAt: new Date(),
      });
      prisma.session.create.mockResolvedValue({ id: 's1' });

      const result = await service.login({
        email: 'user@cofi.com',
        password: 'mypassword',
      });

      expect(result.user.id).toBe('u1');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('refreshTokens', () => {
    it('should throw UnauthorizedException if token verification fails', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refreshTokens('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should rotate session and return new tokens', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'u1',
        email: 'test@cofi.com',
        role: 'USER',
      });
      prisma.session.findFirst.mockResolvedValue({
        id: 's1',
        userId: 'u1',
        userAgent: 'test-agent',
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@cofi.com',
        role: 'USER',
      });
      prisma.session.update.mockResolvedValue({ id: 's1' });

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(prisma.session.update).toHaveBeenCalled();
    });
  });

  describe('googleLogin', () => {
    it('should return user with google avatarUrl and JWT tokens', async () => {
      prisma.account.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'u-google',
        email: 'carlos@cofi.com',
        fullName: 'Carlos Morales',
        avatarUrl: 'https://lh3.googleusercontent.com/a/carlos',
        role: 'USER',
        createdAt: new Date(),
      });
      prisma.account.create.mockResolvedValue({ id: 'acct-1' });
      prisma.session.create.mockResolvedValue({ id: 's-google' });

      const result = await service.googleLogin({
        googleId: 'google-123',
        email: 'carlos@cofi.com',
        fullName: 'Carlos Morales',
        avatarUrl: 'https://lh3.googleusercontent.com/a/carlos',
      });

      expect(result.user.id).toBe('u-google');
      expect(result.user.avatarUrl).toBe(
        'https://lh3.googleusercontent.com/a/carlos',
      );
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(prisma.account.create).toHaveBeenCalledWith({
        data: {
          userId: 'u-google',
          provider: 'google',
          providerAccountId: 'google-123',
        },
      });
    });

    it('should link existing google account and return its avatarUrl', async () => {
      prisma.account.findUnique.mockResolvedValue({
        id: 'acct-1',
        userId: 'u-google',
        user: {
          id: 'u-google',
          email: 'carlos@cofi.com',
          fullName: 'Carlos Morales',
          avatarUrl: 'https://lh3.googleusercontent.com/a/carlos',
          role: 'USER',
          createdAt: new Date(),
        },
      });
      prisma.session.create.mockResolvedValue({ id: 's-google' });

      const result = await service.googleLogin({
        googleId: 'google-123',
        email: 'carlos@cofi.com',
        fullName: 'Carlos Morales',
        avatarUrl: 'https://lh3.googleusercontent.com/a/carlos',
      });

      expect(result.user.id).toBe('u-google');
      expect(result.user.avatarUrl).toBe(
        'https://lh3.googleusercontent.com/a/carlos',
      );
      expect(result.accessToken).toBeDefined();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile including avatarUrl', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@cofi.com',
        fullName: 'Profile User',
        avatarUrl: 'https://lh3.googleusercontent.com/a/user',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        accounts: [],
        duoAsUserA: [],
        duoAsUserB: [],
      });

      const profile = await service.getProfile('u1');
      expect(profile.id).toBe('u1');
      expect(profile.avatarUrl).toBe(
        'https://lh3.googleusercontent.com/a/user',
      );
      expect(profile.fullName).toBe('Profile User');
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('logout', () => {
    it('should revoke active session', async () => {
      prisma.session.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.logout('some-refresh-token');
      expect(result.message).toBe('Successfully logged out');
      expect(prisma.session.updateMany).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile if found', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@cofi.com',
        fullName: 'Profile User',
      });

      const profile = await service.getProfile('u1');
      expect(profile.id).toBe('u1');
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
