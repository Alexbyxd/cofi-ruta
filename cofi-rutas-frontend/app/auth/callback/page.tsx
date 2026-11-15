'use client';

import { useEffect } from 'react';
import { OAUTH_RESULT_STORAGE_KEY } from '@/lib/google-oauth-popup';

/**
 * Página de callback para autenticación OAuth (popup mode)
 *
 * Better Auth redirige aquí tras completar el flujo OAuth en el popup.
 * El resultado se entrega por dos canales porque `window.opener` no siempre
 * sobrevive: el COOP de Google puede cortarlo.
 *
 *   1. `postMessage` a la ventana que abrió el popup (rápido).
 *   2. `localStorage`, que ambas ventanas comparten por ser del mismo origen
 *      (robusto aunque el opener se haya perdido).
 *
 * No usa `useSearchParams` a propósito: con `cacheComponents` ese hook exige
 * un boundary de <Suspense> y rompía la página (y con ella el postMessage).
 * Los parámetros se leen de `window.location` dentro del efecto, que ya es
 * client-only.
 */
export default function AuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const message = params.get('error_description') || error || undefined;

    const result = error
      ? { type: 'GOOGLE_AUTH_ERROR', code: error, message }
      : { type: 'GOOGLE_AUTH_SUCCESS' };

    try {
      window.localStorage.setItem(
        OAUTH_RESULT_STORAGE_KEY,
        JSON.stringify({ ...result, at: Date.now() })
      );
    } catch {
      // localStorage puede no estar disponible; queda el postMessage.
    }

    const opener = window.opener as Window | null;
    if (opener && !opener.closed) {
      opener.postMessage(result, window.location.origin);
    }

    // Cerrar el popup después de un breve delay para permitir que el mensaje
    // se procese y que el opener lea localStorage.
    setTimeout(() => {
      window.close();
    }, 150);
  }, []);

  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center gap-3 px-6 text-espresso-ink">
      <p className="font-[family-name:var(--font-space-grotesk)] text-sm font-black uppercase tracking-wide">
        Completando autenticación…
      </p>
      <p className="font-[family-name:var(--font-dm-sans)] text-xs text-espresso-ink/70">
        Si esta ventana no se cierra sola, podés cerrarla.
      </p>
    </main>
  );
}
