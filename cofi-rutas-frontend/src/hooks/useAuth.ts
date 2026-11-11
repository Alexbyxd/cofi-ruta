"use client";

import { useSession, signIn, signUp, signOut, getSession } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { BetterAuthUser, BetterAuthSession } from "@/lib/auth-client";

/**
 * useAuth Hook - Compatibility wrapper for existing AuthService interface
 *
 * Provides the same API as the old AuthService but using Better Auth React client.
 * Components using this hook don't need to change their logic significantly.
 */
export function useAuth() {
  const { data: session, isPending, refetch, error: sessionError } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const user = session?.user ?? null;
  const isLoading = isPending;
  const isAuthenticated = !!session?.user;

  // Track mount to avoid flash on SSR
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (email: string, password: string) => {
      const { error } = await signIn.email({ email, password });
      if (error) {
        throw new Error(error.message || "Error al iniciar sesión");
      }
      await refetch();
      const redirectTo = (pathname === "/login" || pathname === "/register")
        ? "/dashboard"
        : pathname;
      router.push(redirectTo);
    },
    [refetch, router, pathname]
  );

  /**
   * Register with email, password, and custom fields
   */
  const register = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      specialty?: string
    ) => {
      const { error } = await signUp.email({
        email,
        password,
        name: fullName, // Better Auth standard field
        // Custom fields - these need to be passed as additional data
        // The server schema defines these as additionalFields
      });
      if (error) {
        throw new Error(error.message || "Error al crear la cuenta");
      }
      await refetch();
      router.push("/onboarding"); // or dashboard
    },
    [refetch, router]
  );

  /**
   * Login with Google OAuth (popup mode)
   */
  const loginWithGoogle = useCallback(
    async (callbackURL = "/dashboard") => {
      // Usar URL completa del frontend para el callback OAuth
      // El backend (puerto 3001) redirigirá aquí tras procesar Google OAuth
      const frontendOrigin = window.location.origin;
      const oauthCallbackURL = `${frontendOrigin}/auth/callback`;

      const { data } = await signIn.social({
        provider: "google",
        callbackURL: oauthCallbackURL,
        disableRedirect: true,
      });

      if (!data?.url) {
        throw new Error("No se pudo obtener la URL de autenticación de Google");
      }

      // Abrir popup centrado
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.url,
        "google-auth",
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      // Verificación robusta de popup bloqueado
      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        throw new Error("El navegador bloqueó el popup. Permití popups para este sitio.");
      }

      // Esperar a que el popup se cierre o complete la autenticación
      return new Promise<void>((resolve, reject) => {
        let settled = false;
        const cleanup = () => {
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
        };
        const settle = (fn: () => void) => {
          if (!settled) {
            settled = true;
            cleanup();
            fn();
          }
        };

        const checkClosed = setInterval(() => {
          if (popup.closed) {
            settle(() => refetch().then(() => resolve()).catch(reject));
          }
        }, 500);

        // Timeout global: 5 min
        const globalTimeout = setTimeout(() => {
          if (!popup.closed) popup.close();
          settle(() => reject(new Error("Tiempo de espera agotado para autenticación con Google")));
        }, 5 * 60 * 1000);

        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
            settle(() => {
              popup.close();
              clearTimeout(globalTimeout);
              refetch().then(() => resolve()).catch(reject);
            });
          } else if (event.data?.type === "GOOGLE_AUTH_ERROR") {
            settle(() => {
              popup.close();
              clearTimeout(globalTimeout);
              reject(new Error(event.data.message || "Error en autenticación con Google"));
            });
          }
        };

        window.addEventListener("message", handleMessage);
      });
    },
    [refetch]
  );

  /**
   * Logout - clears session on server and client
   */
  const logout = useCallback(async () => {
    await signOut();
    await refetch();
    router.push("/login");
  }, [refetch, router]);

  /**
   * Get access token for API calls (if needed for legacy endpoints)
   */
  const getAccessToken = useCallback(async () => {
    const { data } = await getSession();
    return data?.session?.token ?? null;
  }, []);

  /**
   * Refresh session manually
   */
  const refreshSession = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Return same interface as old AuthService
  return {
    user: user as BetterAuthUser | null,
    isLoading: !mounted || isLoading,
    isAuthenticated,
    login,
    register,
    loginWithGoogle,
    logout,
    getAccessToken,
    refreshSession,
    // Additional Better Auth helpers
    session: session as BetterAuthSession | null,
    sessionError,
  };
}