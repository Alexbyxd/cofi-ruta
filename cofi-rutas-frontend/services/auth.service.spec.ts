import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import type { AuthResponse } from '../types/auth';

describe('AuthService', () => {
  let service: AuthService;
  const mockBaseUrl = 'http://test-api:3001/api/v1';

  let storageStore: Record<string, string> = {};

  const mockLocalStorage = {
    getItem: vi.fn((key: string) => storageStore[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      storageStore[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storageStore[key];
    }),
    clear: vi.fn(() => {
      storageStore = {};
    }),
  };

  beforeEach(() => {
    storageStore = {};
    vi.stubGlobal('window', globalThis);
    vi.stubGlobal('localStorage', mockLocalStorage);
    service = new AuthService(mockBaseUrl);
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should successfully login and return auth response', async () => {
      const mockResponse: AuthResponse = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        user: {
          id: 'user-1',
          email: 'carlos@test.com',
          fullName: 'Carlos Morales',
        },
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as unknown as Response);

      const result = await service.login({
        email: 'carlos@test.com',
        password: 'Password123!',
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api:3001/api/v1/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('should throw an error with message from api when response is not ok', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Credenciales inválidas' }),
      } as unknown as Response);

      await expect(
        service.login({
          email: 'wrong@test.com',
          password: 'wrong',
        }),
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('should format array error messages properly', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: ['El email no es válido', 'La contraseña es muy corta'],
        }),
      } as unknown as Response);

      await expect(
        service.login({
          email: 'bad',
          password: '123',
        }),
      ).rejects.toThrow('El email no es válido, La contraseña es muy corta');
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockResponse: AuthResponse = {
        accessToken: 'access-reg-123',
        refreshToken: 'refresh-reg-456',
        user: {
          id: 'user-reg-1',
          email: 'laura@test.com',
          fullName: 'Laura Morales',
        },
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as unknown as Response);

      const result = await service.register({
        email: 'laura@test.com',
        password: 'Password123!',
        fullName: 'Laura Morales',
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api:3001/api/v1/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'laura@test.com',
            password: 'Password123!',
            fullName: 'Laura Morales',
          }),
        }),
      );
    });
  });

  describe('session storage operations', () => {
    const mockSession: AuthResponse = {
      accessToken: 'token-xyz',
      refreshToken: 'refresh-xyz',
      user: {
        id: 'user-storage',
        email: 'storage@cofi.com',
        fullName: 'Cafetero Oruro',
      },
    };

    it('should save session items into localStorage', () => {
      service.saveSession(mockSession);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessToken', 'token-xyz');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-xyz');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(mockSession.user),
      );
    });

    it('should retrieve session user and access token', () => {
      service.saveSession(mockSession);

      expect(service.getSessionUser()).toEqual(mockSession.user);
      expect(service.getAccessToken()).toBe('token-xyz');
    });

    it('should clear session from localStorage', () => {
      service.saveSession(mockSession);
      service.clearSession();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('registerWithGoogle', () => {
    it('should post the signup token and return the auth response', async () => {
      const mockResponse: AuthResponse = {
        accessToken: 'access-google',
        refreshToken: 'refresh-google',
        user: {
          id: 'google-user',
          email: 'carlos@cofi.com',
          fullName: 'Carlos Morales',
          role: 'USER',
        },
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as unknown as Response);

      const result = await service.registerWithGoogle('signup-token-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api:3001/api/v1/auth/google/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ signupToken: 'signup-token-123' }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should surface the specific field validation message', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          statusCode: 400,
          message: 'La validación falló',
          errors: [
            { field: 'email', message: 'Dirección de correo inválida' },
          ],
        }),
      } as unknown as Response);

      await expect(
        service.registerWithGoogle('bad-token'),
      ).rejects.toThrow('Dirección de correo inválida');
    });

    it('should keep the backend message for invalid credentials', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          statusCode: 401,
          code: 'INVALID_CREDENTIALS',
          message: 'Correo o contraseña incorrectos',
        }),
      } as unknown as Response);

      await expect(
        service.login({ email: 'x@cofi.com', password: 'mala' }),
      ).rejects.toThrow('Correo o contraseña incorrectos');
    });
  });
});
