'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

// Página de callback del flujo OAuth2 de Google.
// El backend (GET /auth/google/callback) renderiza un HTML que guarda los
// tokens en sessionStorage y redirige acá. Esta página los lee, guarda la
// sesión en localStorage y redirige al home.
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const accessToken = sessionStorage.getItem('cofi_google_accessToken');
    const refreshToken = sessionStorage.getItem('cofi_google_refreshToken');
    const userJson = sessionStorage.getItem('cofi_google_user');

    if (accessToken && refreshToken && userJson) {
      try {
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
      } catch {
        // Ignora errores de parseo; redirige igual al home.
      }
    }

    router.push('/');
  }, [router]);

  return null;
}
