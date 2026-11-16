'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';
import { loginFormSchema, registerFormSchema } from '@/lib/auth-validation';
import { useAuth, GoogleEmailMismatchError } from '@/hooks/useAuth';
import type {
  AuthMode,
  CoffeeSpecialty,
  AuthFormState,
  GoogleLinkPrompt,
} from '@/types/auth';

/**
 * Recordamos por email que el usuario dijo "ahora no" para no volver a
 * ofrecerle vincular Google en cada login del mismo navegador.
 */
const LINK_DISMISSED_PREFIX = 'cofi_google_link_dismissed:';

function isLinkDismissed(email: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const key = `${LINK_DISMISSED_PREFIX}${email.trim().toLowerCase()}`;
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function dismissLink(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `${LINK_DISMISSED_PREFIX}${email.trim().toLowerCase()}`;
    window.localStorage.setItem(key, '1');
  } catch {
    // localStorage puede no estar disponible en modo privado.
  }
}

export interface UseAuthFormOptions {
  onSuccess?: (mode: AuthMode) => void;
}

interface UseAuthReturn {
  login: (
    email: string,
    password: string,
    options?: { redirect?: boolean },
  ) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    specialty?: string,
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  isGoogleLinked: () => Promise<boolean>;
  linkGoogle: () => Promise<'linked' | 'cancelled'>;
  switchToGoogle: () => Promise<void>;
  isLoading: boolean;
}

export function useAuthForm(options: UseAuthFormOptions = {}) {
  const {
    login,
    register,
    loginWithGoogle,
    isGoogleLinked,
    linkGoogle,
    switchToGoogle,
    isLoading: authLoading,
  } = useAuth() as UseAuthReturn;

  const [state, setState] = useState<AuthFormState>({
    mode: 'login',
    email: '',
    password: '',
    fullName: '',
    specialty: 'Submarino',
    showPassword: false,
    loading: false,
    feedback: null,
    linkPrompt: null,
  });

  const setMode = useCallback((mode: AuthMode) => {
    setState((prev) => ({ ...prev, mode, feedback: null }));
  }, []);

  const setEmail = useCallback((email: string) => {
    setState((prev) => ({ ...prev, email }));
  }, []);

  const setPassword = useCallback((password: string) => {
    setState((prev) => ({ ...prev, password }));
  }, []);

  const setFullName = useCallback((fullName: string) => {
    setState((prev) => ({ ...prev, fullName }));
  }, []);

  const setSpecialty = useCallback((specialty: CoffeeSpecialty) => {
    setState((prev) => ({ ...prev, specialty }));
  }, []);

  const toggleShowPassword = useCallback(() => {
    setState((prev) => ({ ...prev, showPassword: !prev.showPassword }));
  }, []);

  const dismissFeedback = useCallback(() => {
    setState((prev) => ({ ...prev, feedback: null }));
  }, []);

  const handleForgotPassword = useCallback(() => {
    setState((prev) => ({
      ...prev,
      feedback: {
        type: 'info',
        message: 'Enviamos un enlace de recuperación a tu correo registrado.',
      },
    }));
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, feedback: null }));

    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo iniciar sesión con Google';
      setState((prev) => ({
        ...prev,
        feedback: { type: 'error', message },
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [loginWithGoogle]);

  /** Navigates away from the auth page once the linking offer is resolved. */
  const finishAuth = useCallback(() => {
    options.onSuccess?.('login');
  }, [options]);

  /** The user accepts linking Google to the account they just signed into. */
  const handleLinkGoogleConfirm = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      feedback: null,
      linkPrompt: { kind: 'linking' } satisfies GoogleLinkPrompt,
    }));

    try {
      const result = await linkGoogle();

      if (result === 'cancelled') {
        // Cerrar el popup es una decisión, no un error.
        dismissLink(state.email);
        setState((prev) => ({ ...prev, linkPrompt: null }));
        finishAuth();
        return;
      }

      setState((prev) => ({ ...prev, linkPrompt: null }));
      finishAuth();
    } catch (err: unknown) {
      if (err instanceof GoogleEmailMismatchError) {
        setState((prev) => ({
          ...prev,
          linkPrompt: { kind: 'mismatch' } satisfies GoogleLinkPrompt,
        }));
        return;
      }
      const message =
        err instanceof Error ? err.message : 'No se pudo vincular Google';
      setState((prev) => ({
        ...prev,
        linkPrompt: {
          kind: 'error',
          title: 'No se pudo vincular Google',
          message,
          actionLabel: 'Continuar al dashboard',
        } satisfies GoogleLinkPrompt,
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [linkGoogle, finishAuth, state.email]);

  /** The user declines for now; we stop asking for this email. */
  const handleLinkGoogleDecline = useCallback(() => {
    dismissLink(state.email);
    setState((prev) => ({ ...prev, linkPrompt: null }));
    finishAuth();
  }, [state.email, finishAuth]);

  /**
   * The Google email differs from the account email. Accounts are never
   * merged, so Google wins: close the current session and sign in with Google.
   */
  const handleContinueWithGoogle = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      feedback: null,
      linkPrompt: { kind: 'linking' } satisfies GoogleLinkPrompt,
    }));

    try {
      await switchToGoogle();
      setState((prev) => ({ ...prev, linkPrompt: null }));
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo continuar con Google';
      setState((prev) => ({
        ...prev,
        linkPrompt: {
          kind: 'error',
          title: 'No se pudo continuar con Google',
          message,
          actionLabel: 'Continuar al dashboard',
        } satisfies GoogleLinkPrompt,
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [switchToGoogle]);

  const handleLinkGoogleDismissError = useCallback(() => {
    setState((prev) => ({ ...prev, linkPrompt: null }));
    finishAuth();
  }, [finishAuth]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setState((prev) => ({ ...prev, feedback: null }));

      try {
        if (state.mode === 'register') {
          registerFormSchema.parse({
            email: state.email,
            password: state.password,
            fullName: state.fullName,
          });
        } else {
          loginFormSchema.parse({
            email: state.email,
            password: state.password,
          });
        }
      } catch (err: unknown) {
        if (err instanceof z.ZodError) {
          const firstError =
            err.issues[0]?.message || 'Verifica los campos ingresados';
          setState((prev) => ({
            ...prev,
            feedback: { type: 'error', message: firstError },
          }));
          return;
        }
      }

      setState((prev) => ({ ...prev, loading: true }));

      try {
        if (state.mode === 'register') {
          await register(
            state.email,
            state.password,
            state.fullName,
            state.specialty,
          );

          const successMessage = `¡Cuenta CofiDúo creada! Sellando tu primer pasaporte en Oruro para ${state.fullName}...`;
          setState((prev) => ({
            ...prev,
            feedback: { type: 'success', message: successMessage },
          }));

          options.onSuccess?.(state.mode);
          return;
        }

        // Password login keeps the user here so the optional Google linking
        // offer can run with an active session.
        await login(state.email, state.password, { redirect: false });

        setState((prev) => ({
          ...prev,
          feedback: {
            type: 'success',
            message: '¡Hola de nuevo! Extrayendo espresso...',
          },
        }));

        const alreadyLinked = await isGoogleLinked();
        if (!alreadyLinked && !isLinkDismissed(state.email)) {
          setState((prev) => ({ ...prev, linkPrompt: { kind: 'ask' } }));
          return;
        }

        options.onSuccess?.(state.mode);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Error de conexión con el servidor de CofiRutas';
        setState((prev) => ({
          ...prev,
          feedback: { type: 'error', message },
        }));
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [
      state.mode,
      state.email,
      state.password,
      state.fullName,
      state.specialty,
      login,
      register,
      isGoogleLinked,
      options,
    ],
  );

  return {
    ...state,
    setMode,
    setEmail,
    setPassword,
    setFullName,
    setSpecialty,
    toggleShowPassword,
    dismissFeedback,
    handleSubmit,
    handleForgotPassword,
    handleGoogleLogin,
    handleLinkGoogleConfirm,
    handleLinkGoogleDecline,
    handleContinueWithGoogle,
    handleLinkGoogleDismissError,
    isAuthLoading: authLoading,
  };
}
