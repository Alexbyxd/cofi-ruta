'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

// Página de callback del flujo OAuth2 de Google.
// El backend (GET /auth/google/callback) renderiza un HTML que guarda datos
// en sessionStorage y redirige acá:
// - Sesión autenticada: guarda los tokens en localStorage y va al dashboard.
// - Cuenta de Google no registrada: deja un pedido de registro pendiente y
//   vuelve al login para pedir consentimiento explícito.
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const signupDraft = sessionStorage.getItem('cofi_google_signup');

      if (signupDraft) {
        router.replace('/login');
        return;
      }

      const accessToken = sessionStorage.getItem('cofi_google_accessToken');
      const refreshToken = sessionStorage.getItem('cofi_google_refreshToken');
      const userJson = sessionStorage.getItem('cofi_google_user');

      if (accessToken && refreshToken && userJson) {
        const user = JSON.parse(userJson);
        authService.saveSession({
          accessToken,
          refreshToken,
          user,
        });

        // Limpia sessionStorage una vez persistida la sesión.
        sessionStorage.removeItem('cofi_google_accessToken');
        sessionStorage.removeItem('cofi_google_refreshToken');
        sessionStorage.removeItem('cofi_google_user');
        router.replace('/dashboard');
        return;
      }
    } catch {
      // sessionStorage no disponible o payload inválido: vuelve al login.
    }

    router.replace('/login');
  }, [router]);

  return null;
}
