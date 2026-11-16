"use client";

import {
  useSession,
  signIn,
  signUp,
  signOut,
  getSession,
  linkSocial,
  listAccounts,
} from "@/lib/auth-client";
import {
  openGooglePopup,
  waitForGooglePopup,
} from "@/lib/google-oauth-popup";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { BetterAuthUser, BetterAuthSession } from "@/lib/auth-client";

/**
 * Thrown when the Google account chosen during linking has a different email
 * than the CofiRutas account. The accounts are never merged in that case.
 */
export class GoogleEmailMismatchError extends Error {
  constructor() {
    super(
      "La cuenta de Google tiene un email distinto al de tu cuenta CofiRutas",
    );
    this.name = "GoogleEmailMismatchError";
  }
}

/**
 * Turns a Better Auth OAuth callback error code into a message the person can
 * act on. The raw codes are English machine values.
 */
function describeGoogleAuthError(
  code: string | undefined,
  fallback: string | undefined,
): string {
  switch (code) {
    case "account_not_linked":
      return "Ese email ya tiene una cuenta con contraseña. Iniciá sesión con tu contraseña y vas a poder vincular Google.";
    case "email_does_not_match":
      return "El email de Google no coincide con el de tu cuenta CofiRutas.";
    case "account_already_linked_to_different_user":
      return "Esa cuenta de Google ya está vinculada a otro usuario.";
    case "access_denied":
      return "Cancelaste el acceso desde Google.";
    default:
      return fallback || "No se pudo completar la autenticación con Google";
  }
}

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
   *
   * `redirect: false` keeps the user on the current page so the caller can run
   * the optional Google linking offer before navigating.
   */
  const login = useCallback(
    async (
      email: string,
      password: string,
      options?: { redirect?: boolean },
    ) => {
      const { error } = await signIn.email({ email, password });
      if (error) {
        throw new Error(error.message || "Error al iniciar sesión");
      }
      await refetch();
      if (options?.redirect === false) return;
      const redirectTo =
        pathname === "/login" || pathname === "/register"
          ? "/dashboard"
          : pathname;
      router.push(redirectTo);
    },
    [refetch, router, pathname],
  );

  /**
   * Register with email, password, and custom fields
   */
  const register = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      specialty?: string,
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
    [refetch, router],
  );

  /**
   * Login with Google OAuth (popup mode)
   */
  const loginWithGoogle = useCallback(async () => {
    const frontendOrigin = window.location.origin;
    const callbackURL = `${frontendOrigin}/auth/callback`;
    const openedAt = Date.now();
    // A session that already existed must not be mistaken for this login, so
    // success is decided by the session ID changing, never by the wall clock.
    const previousSessionId = session?.session?.id ?? null;

    const { data, error } = await signIn.social({
      provider: "google",
      callbackURL,
      // Send OAuth failures (including `account_not_linked`) back to the app
      // instead of leaving the popup on the backend error page.
      errorCallbackURL: callbackURL,
      disableRedirect: true,
    });

    if (error) {
      throw new Error(
        error.message || "No se pudo iniciar sesión con Google",
      );
    }
    if (!data?.url) {
      throw new Error("No se pudo obtener la URL de autenticación de Google");
    }

    const popup = openGooglePopup(data.url);
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      throw new Error(
        "El navegador bloqueó el popup. Permití popups para este sitio.",
      );
    }

    const outcome = await waitForGooglePopup(popup, openedAt);

    if (outcome.kind === "result" && outcome.result.type === "GOOGLE_AUTH_ERROR") {
      if (!popup.closed) popup.close();
      throw new Error(
        describeGoogleAuthError(outcome.result.code, outcome.result.message),
      );
    }

    // The session is the source of truth. Only a session different from the
    // one that existed before this attempt counts, so a pre-existing session
    // cannot fake a successful Google login.
    const { data: sessionData } = await getSession();
    const isFreshSession =
      !!sessionData?.session && sessionData.session.id !== previousSessionId;

    if (sessionData?.session && isFreshSession) {
      if (!popup.closed) popup.close();
      await refetch();
      const redirectTo =
        pathname === "/login" || pathname === "/register"
          ? "/dashboard"
          : pathname;
      router.push(redirectTo);
      return;
    }

    if (!popup.closed) popup.close();

    if (outcome.kind === "timeout") {
      throw new Error("Tiempo de espera agotado para autenticación con Google");
    }
    throw new Error(
      "No se completó la autenticación con Google. Intentá de nuevo.",
    );
  }, [refetch, router, pathname, session?.session?.id]);

  /**
   * Whether the signed-in user already has Google linked.
   */
  const isGoogleLinked = useCallback(async () => {
    try {
      const { data, error } = await listAccounts();
      if (error || !data) return false;
      return data.some((account) => account.providerId === "google");
    } catch {
      // A transient failure must not block the login it follows.
      return false;
    }
  }, []);

  /**
   * Links Google to the signed-in account through a popup.
   *
   * Returns "cancelled" when the user simply closed the popup; throws
   * `GoogleEmailMismatchError` when the chosen Google email differs from the
   * account email.
   */
  const linkGoogle = useCallback(async (): Promise<"linked" | "cancelled"> => {
    const frontendOrigin = window.location.origin;
    const callbackURL = `${frontendOrigin}/auth/callback`;
    const openedAt = Date.now();

    const { data, error } = await linkSocial({
      provider: "google",
      callbackURL,
      errorCallbackURL: callbackURL,
      disableRedirect: true,
    });

    if (error) {
      throw new Error(error.message || "No se pudo vincular Google");
    }
    if (!data?.url) {
      throw new Error("No se pudo obtener la URL de vinculación de Google");
    }

    const popup = openGooglePopup(data.url);
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      throw new Error(
        "El navegador bloqueó el popup. Permití popups para este sitio.",
      );
    }

    const outcome = await waitForGooglePopup(popup, openedAt);

    if (
      outcome.kind === "result" &&
      outcome.result.type === "GOOGLE_AUTH_ERROR"
    ) {
      if (!popup.closed) popup.close();
      if (outcome.result.code === "email_does_not_match") {
        throw new GoogleEmailMismatchError();
      }
      throw new Error(
        describeGoogleAuthError(outcome.result.code, outcome.result.message),
      );
    }

    if (outcome.kind === "timeout") {
      throw new Error("Tiempo de espera agotado para vincular Google");
    }

    // Verify against the server instead of trusting the popup handshake.
    const linked = await isGoogleLinked();
    if (!linked) return "cancelled";

    await refetch();
    return "linked";
  }, [isGoogleLinked, refetch]);

  /**
   * Closes the current session and signs in with Google instead.
   *
   * Used when the linking attempt was rejected because the Google email
   * differs: the Google identity wins, so the user continues as that account.
   */
  const switchToGoogle = useCallback(async () => {
    await signOut();
    await refetch();
    await loginWithGoogle();
  }, [refetch, loginWithGoogle]);

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
    isGoogleLinked,
    linkGoogle,
    switchToGoogle,
    logout,
    getAccessToken,
    refreshSession,
    // Additional Better Auth helpers
    session: session as BetterAuthSession | null,
    sessionError,
  };
}
