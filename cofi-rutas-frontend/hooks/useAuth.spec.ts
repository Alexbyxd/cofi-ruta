import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { useAuth } from './useAuth';
import { authService } from '@/services/auth.service';
import type { AuthUser, AuthResponse } from '@/types/auth';

vi.mock('@/services/auth.service', () => ({
  authService: {
    saveSession: vi.fn(),
    clearSession: vi.fn(),
    getSessionUser: vi.fn(),
    getAccessToken: vi.fn(() => 'access-token-123'),
  },
}));

const mockUser: AuthUser = {
  id: 'u1',
  email: 'carlos@cofi.com',
  fullName: 'Carlos Morales',
  avatarUrl: 'https://lh3.googleusercontent.com/a/carlos',
};

const mockSession: AuthResponse = {
  accessToken: 'access-token-123',
  refreshToken: 'refresh-token-456',
  user: mockUser,
};

function renderWithAuth() {
  let captured: ReturnType<typeof useAuth> | null = null;

  const Probe = () => {
    captured = useAuth();
    return React.createElement('div');
  };

  ReactDOMServer.renderToString(React.createElement(Probe));
  return captured!;
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load the session user from localStorage on init', () => {
    vi.mocked(authService.getSessionUser).mockReturnValue(mockUser);
    vi.mocked(authService.getAccessToken).mockReturnValue('access-token-123');

    const hooks = renderWithAuth();

    expect(authService.getSessionUser).toHaveBeenCalled();
    expect(hooks.user?.fullName).toBe('Carlos Morales');
    expect(hooks.isAuthenticated).toBe(true);
    expect(hooks.getAccessToken()).toBe('access-token-123');
  });

  it('should report not authenticated when no session exists', () => {
    vi.mocked(authService.getSessionUser).mockReturnValue(null);
    vi.mocked(authService.getAccessToken).mockReturnValue(null);

    const hooks = renderWithAuth();

    expect(hooks.user).toBeNull();
    expect(hooks.isAuthenticated).toBe(false);
  });

  it('login should call authService.saveSession and set the user', () => {
    vi.mocked(authService.getSessionUser).mockReturnValue(null);
    vi.mocked(authService.getAccessToken).mockReturnValue(null);

    const hooks = renderWithAuth();
    hooks.login(mockSession);

    expect(authService.saveSession).toHaveBeenCalledWith(mockSession);
  });

  it('logout should call authService.clearSession', () => {
    vi.mocked(authService.getSessionUser).mockReturnValue(mockUser);
    vi.mocked(authService.getAccessToken).mockReturnValue('access-token-123');

    const hooks = renderWithAuth();
    hooks.logout();

    expect(authService.clearSession).toHaveBeenCalled();
  });

  it('should expose login and logout as functions', () => {
    vi.mocked(authService.getSessionUser).mockReturnValue(null);
    vi.mocked(authService.getAccessToken).mockReturnValue(null);

    const hooks = renderWithAuth();

    expect(typeof hooks.login).toBe('function');
    expect(typeof hooks.logout).toBe('function');
  });
});
