'use client';

import { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';
import { loginFormSchema, registerFormSchema } from '@/lib/auth-validation';
import { useAuth } from '@/hooks/useAuth';
import type {
  AuthMode,
  CoffeeSpecialty,
  AuthFormState,
  GoogleSignupDraft,
} from '@/types/auth';

const GOOGLE_SIGNUP_STORAGE_KEY = 'cofi_google_signup';

function readGoogleSignupDraft(): GoogleSignupDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(GOOGLE_SIGNUP_STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as GoogleSignupDraft;
    return draft?.signupToken ? draft : null;
  } catch {
    sessionStorage.removeItem(GOOGLE_SIGNUP_STORAGE_KEY);
    return null;
  }
}

function clearGoogleSignupDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(GOOGLE_SIGNUP_STORAGE_KEY);
  } catch {
    // sessionStorage puede no estar disponible en modo privado.
  }
}

export interface UseAuthFormOptions {
  onSuccess?: (mode: AuthMode) => void;
}

interface UseAuthReturn {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, specialty?: string) => Promise<void>;
  loginWithGoogle: (callbackURL?: string) => Promise<void>;
  isLoading: boolean;
}

export function useAuthForm(options: UseAuthFormOptions = {}) {
  const { login, register, loginWithGoogle, isLoading: authLoading } = useAuth() as UseAuthReturn;

  const [state, setState] = useState<AuthFormState>({
    mode: 'login',
    email: '',
    password: '',
    fullName: '',
    specialty: 'Submarino',
    showPassword: false,
    loading: false,
    feedback: null,
    googleSignup: null,
  });

  useEffect(() => {
    const draft = readGoogleSignupDraft();
    if (draft) {
      setState((prev) => ({ ...prev, googleSignup: draft }));
    }
  }, []);

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

  const handleGoogleLogin = useCallback(() => {
    loginWithGoogle();
  }, [loginWithGoogle]);

  const handleGoogleSignupConfirm = useCallback(async () => {
    if (!state.googleSignup) return;

    setState((prev) => ({ ...prev, loading: true, feedback: null }));

    try {
      clearGoogleSignupDraft();
      
      setState((prev) => ({
        ...prev,
        googleSignup: null,
        feedback: {
          type: 'info',
          message: 'Usá el botón "Continuar con Google" para iniciar sesión o registrarte.',
        },
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo procesar el registro con Google';
      clearGoogleSignupDraft();
      setState((prev) => ({
        ...prev,
        googleSignup: null,
        feedback: { type: 'error', message },
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [state.googleSignup, options]);

  const handleGoogleSignupCancel = useCallback(() => {
    clearGoogleSignupDraft();
    setState((prev) => ({
      ...prev,
      googleSignup: null,
      feedback: {
        type: 'info',
        message: 'No creamos ninguna cuenta. Podés registrarte con tu correo cuando quieras.',
      },
    }));
  }, []);

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
          const firstError = err.issues[0]?.message || 'Verifica los campos ingresados';
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
          await register(state.email, state.password, state.fullName, state.specialty);
          
          const successMessage = `¡Cuenta CofiDúo creada! Sellando tu primer pasaporte en Oruro para ${state.fullName}...`;
          setState((prev) => ({
            ...prev,
            feedback: { type: 'success', message: successMessage },
          }));
        } else {
          await login(state.email, state.password);
          
          setState((prev) => ({
            ...prev,
            feedback: { type: 'success', message: '¡Hola de nuevo! Extrayendo espresso...' },
          }));
        }

        options.onSuccess?.(state.mode);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error de conexión con el servidor de CofiRutas';
        setState((prev) => ({
          ...prev,
          feedback: { type: 'error', message },
        }));
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [state.mode, state.email, state.password, state.fullName, state.specialty, login, register, options],
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
    handleGoogleSignupConfirm,
    handleGoogleSignupCancel,
    isAuthLoading: authLoading,
  };
}