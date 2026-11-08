import { Test, TestingModule } from '@nestjs/testing';
import { AuthController, MeController } from './auth.controller';
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
  let meController: MeController;
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
      logout: jest.fn().mockResolvedValue({ message: 'Sesión cerrada' }),
      logoutAll: jest
        .fn()
        .mockResolvedValue({ message: 'Todas las sesiones fueron cerradas' }),
      getMe: jest.fn().mockResolvedValue({ id: 'u1', email: 'test@cofi.com' }),
      updateProfile: jest.fn().mockResolvedValue({ id: 'u1' }),
      changePassword: jest.fn().mockResolvedValue({ message: 'ok' }),
      getSessions: jest.fn().mockResolvedValue([{ id: 's1' }]),
      revokeSession: jest
        .fn()
        .mockResolvedValue({ message: 'Sesión revocada' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, MeController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    meController = module.get<MeController>(MeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(meController).toBeDefined();
  });

  it('should register a new user with request metadata', async () => {
    const dto = {
      email: 'test@cofi.com',
      password: 'password123',
      fullName: 'Test User',
    };
    const res = await controller.register(dto, 'jest-agent', '127.0.0.1');
    expect(res.user.id).toBe('u1');
    expect(authService.register).toHaveBeenCalledWith(dto, {
      userAgent: 'jest-agent',
      ipAddress: '127.0.0.1',
    });
  });

  it('should login with request metadata', async () => {
    const dto = { email: 'test@cofi.com', password: 'password123' };
    const res = await controller.login(dto, 'jest-agent', '127.0.0.1');
    expect(res.accessToken).toBe('at');
    expect(authService.login).toHaveBeenCalledWith(dto, {
      userAgent: 'jest-agent',
      ipAddress: '127.0.0.1',
    });
  });

  it('should refresh tokens', async () => {
    const res = await controller.refresh(
      { refreshToken: 'valid_rt' },
      'jest-agent',
      '127.0.0.1',
    );
    expect(res.accessToken).toBe('new_at');
    expect(authService.refreshTokens).toHaveBeenCalledWith('valid_rt', {
      userAgent: 'jest-agent',
      ipAddress: '127.0.0.1',
    });
  });

  it('should logout the current session', async () => {
    const res = await controller.logout({ refreshToken: 'valid_rt' });
    expect(res.message).toBe('Sesión cerrada');
    expect(authService.logout).toHaveBeenCalledWith('valid_rt');
  });

  it('should logout all sessions of the current user', async () => {
    const res = await controller.logoutAll('u1');
    expect(res.message).toBeTruthy();
    expect(authService.logoutAll).toHaveBeenCalledWith('u1');
  });

  it('should expose the legacy profile alias through getMe', async () => {
    const profile = await controller.getProfile('u1');
    expect(profile.id).toBe('u1');
    expect(authService.getMe).toHaveBeenCalledWith('u1');
  });

  it('should update the current user profile', async () => {
    await meController.updateMe('u1', { fullName: 'Nuevo Nombre' });
    expect(authService.updateProfile).toHaveBeenCalledWith('u1', {
      fullName: 'Nuevo Nombre',
    });
  });

  it('should change the password using the current session id', async () => {
    const dto = { currentPassword: 'actual123', newPassword: 'nueva12345' };
    await meController.changePassword('u1', 's1', dto);
    expect(authService.changePassword).toHaveBeenCalledWith('u1', 's1', dto);
  });

  it('should list sessions of the current user', async () => {
    const res = await meController.getSessions('u1');
    expect(res.data).toHaveLength(1);
    expect(authService.getSessions).toHaveBeenCalledWith('u1');
  });

  it('should revoke one session of the current user', async () => {
    const res = await meController.revokeSession('u1', 's1');
    expect(res.message).toBeTruthy();
    expect(authService.revokeSession).toHaveBeenCalledWith('u1', 's1');
  });

  it('should register a Google account only with an explicit signup token', async () => {
    authService.registerWithGoogle = jest.fn().mockResolvedValue({
      user: { id: 'u1' },
      accessToken: 'at',
      refreshToken: 'rt',
    });

    const res = await controller.googleRegister(
      { signupToken: 'tok-123' },
      'jest-agent',
      '127.0.0.1',
    );

    expect(res.accessToken).toBe('at');
    expect(authService.registerWithGoogle).toHaveBeenCalledWith('tok-123', {
      userAgent: 'jest-agent',
      ipAddress: '127.0.0.1',
    });
  });

  describe('google OAuth callback', () => {
    function mockResponse() {
      const res = {
        set: jest.fn(),
        status: jest.fn(),
        send: jest.fn(),
      };
      res.status.mockReturnValue(res);
      return res;
    }

    it('stores the pending signup draft and escapes script-breaking data', () => {
      const res = mockResponse();

      controller.googleAuthCallback(
        {
          user: {
            status: 'signup_required',
            signupToken: 'tok-123',
            email: 'x@cofi.com',
            fullName: '</script><script>alert(1)</script>',
            avatarUrl: null,
          },
        } as never,
        res as never,
      );

      const html = res.send.mock.calls[0][0] as string;

      expect(html).toContain('cofi_google_signup');
      expect(html).toContain('tok-123');
      expect(html).not.toContain('</script><script>alert(1)');
      expect(html).toContain('\\u003c/script');
    });

    it('stores the session tokens for an authenticated result', () => {
      const res = mockResponse();

      controller.googleAuthCallback(
        {
          user: {
            accessToken: 'at',
            refreshToken: 'rt',
            user: { id: 'u1', email: 'x@cofi.com', fullName: 'X' },
          },
        } as never,
        res as never,
      );

      const html = res.send.mock.calls[0][0] as string;

      expect(html).toContain(
        "sessionStorage.setItem('cofi_google_accessToken'",
      );
      expect(html).toContain('at');
      expect(html).not.toContain('cofi_google_signup');
    });
  });
});
