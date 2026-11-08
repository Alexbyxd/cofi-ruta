import type { AuthResponse, AuthUser } from '../types/auth';

// Valida que la URL de destino esté bajo el mismo host que baseUrl (allowlist)
// para evitar open redirects al navegar a flujos de autenticación.
function navigateTo(url: string, baseUrl: string): void {
  try {
    const target = new URL(url);
    const base = new URL(baseUrl);
    if (target.hostname !== base.hostname) {
      throw new Error('Host de navegación no permitido');
    }
  } catch {
    // Si baseUrl no es una URL válida, no navegamos.
    return;
  }
  window.location.replace(url);
}

interface AuthErrorBody {
  message?: unknown;
  errors?: unknown;
}

/**
 * Extrae el mensaje más útil del cuerpo de error del backend.
 * El `ZodValidationPipe` responde `{ message: 'La validación falló', errors: [{ field, message }] }`,
 * así que se prioriza el mensaje específico del primer campo inválido.
 */
function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') {
    return fallback;
  }

  const body = data as AuthErrorBody;

  if (Array.isArray(body.errors)) {
    const first = body.errors.find(
      (item): item is { message: string } =>
        !!item &&
        typeof item === 'object' &&
        typeof (item as { message?: unknown }).message === 'string' &&
        (item as { message: string }).message.length > 0,
    );
    if (first) {
      return first.message;
    }
  }

  if (Array.isArray(body.message)) {
    return body.message.join(', ');
  }

  if (typeof body.message === 'string' && body.message.length > 0) {
    return body.message;
  }

  return fallback;
}

export interface IAuthService {
  login(credentials: { email: string; password: string }): Promise<AuthResponse>;
  register(credentials: { email: string; password: string; fullName: string }): Promise<AuthResponse>;
  loginWithGoogle(): void;
  registerWithGoogle(signupToken: string): Promise<AuthResponse>;
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
      throw new Error(
        extractErrorMessage(data, 'Error al iniciar sesión'),
      );
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
      throw new Error(extractErrorMessage(data, 'Error al crear la cuenta'));
    }

    return data as AuthResponse;
  }

  loginWithGoogle(): void {
    if (typeof window === 'undefined') return;
    navigateTo(`${this.baseUrl}/auth/google`, this.baseUrl);
  }

  async registerWithGoogle(signupToken: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/google/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signupToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(data, 'Error al crear la cuenta con Google'),
      );
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
