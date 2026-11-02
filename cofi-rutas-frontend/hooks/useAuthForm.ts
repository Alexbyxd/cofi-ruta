'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';
import { loginFormSchema, registerFormSchema } from '../lib/auth-validation';
import { authService, type IAuthService } from '../services/auth.service';
import type {
  AuthMode,
  CoffeeSpecialty,
  AuthFormState,
} from '../types/auth';

export interface UseAuthFormOptions {
  service?: IAuthService;
  onSuccess?: (mode: AuthMode) => void;
}

export function useAuthForm(options: UseAuthFormOptions = {}) {
  const service = options.service ?? authService;

  const [state, setState] = useState<AuthFormState>({
    mode: 'login',
    email: '',
    password: '',
    fullName: '',
    specialty: 'Submarino',
    showPassword: false,
    loading: false,
    feedback: null,
  });

  const setMode = useCallback((mode: AuthMode) => {
    setState((prev) => ({
      ...prev,
      mode,
      feedback: null,
    }));
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
    setState((prev) => ({
      ...prev,
      feedback: {
        type: 'info',
        message: 'Conectando con Google... Cargando cafeterías de Oruro.',
      },
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setState((prev) => ({ ...prev, feedback: null }));

      // 1. Zod Validation
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

      // 2. Service Call
      try {
        if (state.mode === 'register') {
          const response = await service.register({
            email: state.email,
            password: state.password,
            fullName: state.fullName,
          });
          service.saveSession(response);

          setState((prev) => ({
            ...prev,
            feedback: {
              type: 'success',
              message: `¡Cuenta CofiDúo creada! Sellando tu primer pasaporte en Oruro para ${response.user.fullName}...`,
            },
          }));
        } else {
          const response = await service.login({
            email: state.email,
            password: state.password,
          });
          service.saveSession(response);

          setState((prev) => ({
            ...prev,
            feedback: {
              type: 'success',
              message: `¡Hola de nuevo! Extrayendo espresso para ${response.user.fullName}...`,
            },
          }));
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
    [state.mode, state.email, state.password, state.fullName, service, options],
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
  };
}
