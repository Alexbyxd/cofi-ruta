import type { AuthResponse, AuthUser } from '../types/auth';

export interface IAuthService {
  login(credentials: { email: string; password: string }): Promise<AuthResponse>;
  register(credentials: { email: string; password: string; fullName: string }): Promise<AuthResponse>;
  saveSession(session: AuthResponse): void;
  clearSession(): void;
  getSessionUser(): AuthUser | null;
  getAccessToken(): string | null;
}

export class AuthService implements IAuthService {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    const rawUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    this.baseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
  }

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Error al iniciar sesión';
      throw new Error(message);
    }

    return data as AuthResponse;
  }

  async register(credentials: { email: string; password: string; fullName: string }): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Error al crear la cuenta';
      throw new Error(message);
    }

    return data as AuthResponse;
  }

  saveSession(session: AuthResponse): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('accessToken', session.accessToken);
      localStorage.setItem('refreshToken', session.refreshToken);
      localStorage.setItem('user', JSON.stringify(session.user));
    } catch {
      // LocalStorage might be disabled in private mode
    }
  }

  clearSession(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } catch {
      // LocalStorage might be disabled
    }
  }

  getSessionUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? (JSON.parse(userStr) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('accessToken');
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
