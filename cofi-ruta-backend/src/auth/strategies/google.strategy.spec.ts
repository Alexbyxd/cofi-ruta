import { GoogleStrategy, GoogleOAuthProfile } from './google.strategy';
import { AuthService } from '../auth.service';

// Mock de passport-google-oauth20 sin invocar el constructor real de Strategy.
jest.mock('passport-google-oauth20', () => ({
  Strategy: jest.fn(),
}));

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let authService: Partial<AuthService>;

  const mockDone: jest.Mock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockDone.mockReset();

    authService = {
      googleLogin: jest.fn(),
    };

    strategy = new GoogleStrategy(authService as AuthService);
  });

  describe('validate', () => {
    const profile: GoogleOAuthProfile = {
      id: 'google-123',
      emails: [{ value: 'carlos@cofi.com' }],
      displayName: 'Carlos Morales',
      photos: [{ value: 'https://example.com/avatar.jpg' }],
    };

    it('should call authService.googleLogin and pass result to done', async () => {
      const expectedResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'u1',
          email: 'carlos@cofi.com',
          fullName: 'Carlos Morales',
          avatarUrl: 'https://example.com/avatar.jpg',
          role: 'USER',
          createdAt: new Date().toISOString(),
        },
      };
      (authService.googleLogin as jest.Mock).mockResolvedValue(expectedResult);

      await strategy.validate(
        'access-token',
        'refresh-token',
        profile,
        mockDone,
      );

      expect(authService.googleLogin).toHaveBeenCalledWith({
        googleId: 'google-123',
        email: 'carlos@cofi.com',
        fullName: 'Carlos Morales',
        avatarUrl: 'https://example.com/avatar.jpg',
      });
      expect(mockDone).toHaveBeenCalledWith(null, expectedResult);
    });

    it('should pass empty strings when profile lacks emails or displayName', async () => {
      (authService.googleLogin as jest.Mock).mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
        user: { id: 'u1', email: '', fullName: '', role: 'USER' },
      });

      await strategy.validate(
        'access-token',
        'refresh-token',
        { id: 'google-456' },
        mockDone,
      );

      expect(authService.googleLogin).toHaveBeenCalledWith({
        googleId: 'google-456',
        email: '',
        fullName: '',
        avatarUrl: undefined,
      });
      expect(mockDone).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ accessToken: 'at' }),
      );
    });

    it('should pass error to done when googleLogin throws', async () => {
      const error = new Error('Usuario ya vinculado');
      (authService.googleLogin as jest.Mock).mockRejectedValue(error);

      await strategy.validate(
        'access-token',
        'refresh-token',
        profile,
        mockDone,
      );

      expect(mockDone).toHaveBeenCalledWith(error, false);
    });

    it('should call done with error and false when googleLogin fails', async () => {
      const error = new Error('Fallo de Google');
      (authService.googleLogin as jest.Mock).mockRejectedValue(error);

      await strategy.validate(
        'access-token',
        'refresh-token',
        profile,
        mockDone,
      );

      expect(mockDone).toHaveBeenCalledWith(error, false);
    });
  });
});
