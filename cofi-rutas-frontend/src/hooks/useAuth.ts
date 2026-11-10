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
   * Login with Google OAuth
   */
  const loginWithGoogle = useCallback(
    async (callbackURL = "/dashboard") => {
      await signIn.social({
        provider: "google",
        callbackURL,
      });
    },
    []
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