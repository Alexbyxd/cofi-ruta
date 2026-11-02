'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { loginFormSchema, registerFormSchema } from '../../lib/auth-validation';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (isRegister) {
        registerFormSchema.parse({ email, password, fullName });
      } else {
        loginFormSchema.parse({ email, password });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message || 'Datos inválidos');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/v1/auth/register' : '/api/v1/auth/login';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

      const response = await fetch(`${apiUrl}${endpoint.replace('/api/v1', '')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isRegister
            ? { email, password, fullName }
            : { email, password },
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la autenticación');
      }

      // Store tokens
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setSuccess(
        isRegister
          ? `¡Cuenta creada exitosamente! Bienvenido, ${data.user.fullName}.`
          : `¡Bienvenido de vuelta, ${data.user.fullName}!`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al conectar con el servidor';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC] flex flex-col justify-center items-center p-4 sm:p-6 text-[#1A0F0A]">
      {/* Header Branding */}
      <div className="w-full max-w-md text-center mb-6">
        <div className="inline-block bg-[#6B8E4E] text-white text-xs font-bold px-3 py-1 rounded-full brutal-border -rotate-2 mb-3">
          ✓ ORURO EDITION • 3.735m
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-[family-name:var(--font-space-grotesk)] text-[#1A0F0A]">
          COFI<span className="text-[#DE7C5A]">RUTAS</span>
        </h1>
        <p className="text-sm font-medium text-[#4A2E1B] mt-1">
          Guía & Matcher de Cafeterías y Citas en Oruro
        </p>
      </div>

      {/* Main Brutalist Card */}
      <div className="w-full max-w-md bg-white rounded-lg brutal-border brutal-shadow p-6 sm:p-8">
        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF4EC] rounded-lg brutal-border mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
              setSuccess(null);
            }}
            className={`py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded transition-colors ${
              !isRegister
                ? 'bg-[#E59840] text-[#1A0F0A] brutal-border'
                : 'text-[#4A2E1B] hover:text-[#1A0F0A]'
            }`}
          >
            Ingresar
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
              setSuccess(null);
            }}
            className={`py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded transition-colors ${
              isRegister
                ? 'bg-[#E59840] text-[#1A0F0A] brutal-border'
                : 'text-[#4A2E1B] hover:text-[#1A0F0A]'
            }`}
          >
            Registrarme
          </button>
        </div>

        {/* Feedback Alert */}
        {error && (
          <div className="mb-5 p-3 bg-[#FFDAD6] border-2 border-[#1A0F0A] rounded text-[#93000A] text-xs font-bold flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3 bg-[#D4E8D4] border-2 border-[#1A0F0A] rounded text-[#234A23] text-xs font-bold flex items-center gap-2">
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 font-[family-name:var(--font-space-grotesk)]">
                Nombre Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Laura Morales"
                className="w-full px-3 py-2.5 brutal-input text-sm"
                required={isRegister}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 font-[family-name:var(--font-space-grotesk)]">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.cafe@correo.com"
              className="w-full px-3 py-2.5 brutal-input text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 font-[family-name:var(--font-space-grotesk)]">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 brutal-input text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 brutal-btn-primary mt-2 text-sm disabled:opacity-60"
          >
            {loading
              ? 'Procesando...'
              : isRegister
              ? 'Crear mi Cuenta'
              : 'Ingresar a la Ruta'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-[#1A0F0A]/20"></div>
          </div>
          <span className="relative bg-white px-3 text-xs font-bold uppercase text-[#4A2E1B] tracking-wider font-[family-name:var(--font-space-grotesk)]">
            O continuá con
          </span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => {
            alert('Integración de Google OAuth lista en backend. Redirigiendo...');
          }}
          className="w-full py-2.5 brutal-btn-secondary text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google OAuth
        </button>
      </div>

      {/* Footer tactile note */}
      <div className="mt-6 text-center text-xs text-[#4A2E1B] font-medium">
        ¿Cita en pareja o salida de amigos? • Vinculá tus visitas escaneando el QR
      </div>
    </div>
  );
}
