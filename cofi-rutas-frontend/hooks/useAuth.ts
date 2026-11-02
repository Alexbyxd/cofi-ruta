'use client';

import { useState, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import type { AuthUser, AuthResponse } from '@/types/auth';

/**
 * Hook de autenticación para CofiRutas.
 * Gestiona la sesión de usuario persistida en localStorage y expone
 * operaciones de login, logout y consulta del usuario autenticado.
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() =>
    authService.getSessionUser(),
  );

  const login = useCallback(
    (session: AuthResponse) => {
      authService.saveSession(session);
      setUser(session.user);
    },
    [],
  );

  const logout = useCallback(() => {
    authService.clearSession();
    setUser(null);
  }, []);

  const isAuthenticated = !!user && !!authService.getAccessToken();

  return {
    user,
    isAuthenticated,
    login,
    logout,
    getAccessToken: authService.getAccessToken,
  };
}

export type UseAuthReturn = ReturnType<typeof useAuth>;
