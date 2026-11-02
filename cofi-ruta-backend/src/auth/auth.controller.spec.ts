import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: () =>
    class MockAuthGuard {
      canActivate() {
        return true;
      }
    },
  PassportStrategy: () => class MockPassportStrategy {},
}));

jest.mock('@nestjs/jwt', () => ({
  JwtService: class MockJwtService {
    signAsync = jest.fn();
    verifyAsync = jest.fn();
  },
}));

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue({
        user: { id: 'u1' },
        accessToken: 'at',
        refreshToken: 'rt',
      }),
      login: jest.fn().mockResolvedValue({
        user: { id: 'u1' },
        accessToken: 'at',
        refreshToken: 'rt',
      }),
      refreshTokens: jest
        .fn()
        .mockResolvedValue({ accessToken: 'new_at', refreshToken: 'new_rt' }),
      logout: jest
        .fn()
        .mockResolvedValue({ message: 'Successfully logged out' }),
      getProfile: jest
        .fn()
        .mockResolvedValue({ id: 'u1', email: 'test@cofi.com' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a new user', async () => {
    const dto = {
      email: 'test@cofi.com',
      password: 'password123',
      fullName: 'Test User',
    };
    const res = await controller.register(dto);
    expect(res.user.id).toBe('u1');
    expect(authService.register).toHaveBeenCalledWith(
      dto,
      undefined,
      undefined,
    );
  });

  it('should login an existing user', async () => {
    const dto = { email: 'test@cofi.com', password: 'password123' };
    const res = await controller.login(dto);
    expect(res.accessToken).toBe('at');
    expect(authService.login).toHaveBeenCalledWith(dto, undefined, undefined);
  });

  it('should refresh tokens', async () => {
    const res = await controller.refresh({ refreshToken: 'valid_rt' });
    expect(res.accessToken).toBe('new_at');
    expect(authService.refreshTokens).toHaveBeenCalledWith(
      'valid_rt',
      undefined,
      undefined,
    );
  });

  it('should logout user', async () => {
    const res = await controller.logout({ refreshToken: 'valid_rt' });
    expect(res.message).toBe('Successfully logged out');
  });

  it('should get current user profile', async () => {
    const profile = await controller.getProfile('u1');
    expect(profile.id).toBe('u1');
    expect(authService.getProfile).toHaveBeenCalledWith('u1');
  });
});
