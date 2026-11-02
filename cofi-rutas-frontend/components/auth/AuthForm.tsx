import React from 'react';
import type { AuthMode, CoffeeSpecialty } from '../../types/auth';
import { SpecialtyChips } from './SpecialtyChips';

export interface AuthFormProps {
  mode: AuthMode;
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  fullName: string;
  onFullNameChange: (value: string) => void;
  specialty: CoffeeSpecialty;
  onSpecialtyChange: (value: CoffeeSpecialty) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  onForgotPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  fullName,
  onFullNameChange,
  specialty,
  onSpecialtyChange,
  showPassword,
  onToggleShowPassword,
  onForgotPassword,
  onSubmit,
  loading,
}) => {
  const isRegister = mode === 'register';

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5 w-full">
      {/* Full Name Field (Register Mode Only) */}
      {isRegister && (
        <div className="flex flex-col gap-1 w-full animate-fadeIn">
          <label
            htmlFor="input-name"
            className="font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider text-espresso-ink flex items-center justify-between"
          >
            <span>Nombre de Cafetero(a)</span>
            <span className="text-tertiary text-[10px] font-bold">Requerido</span>
          </label>
          <div className="relative">
            <input
              id="input-name"
              type="text"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              placeholder="Ej. Laura Morales"
              required={isRegister}
              disabled={loading}
              className="w-full bg-surface-card border-[3px] border-espresso-ink rounded-lg px-3.5 py-2.5 font-[family-name:var(--font-dm-sans)] text-sm text-espresso-ink placeholder:text-espresso-ink/50 shadow-[3px_3px_0px_0px_#1A0F0A] focus:outline-none focus:bg-surface focus:shadow-[4px_4px_0px_0px_#E59840] transition-all"
            />
          </div>
        </div>
      )}

      {/* Email Field */}
      <div className="flex flex-col gap-1 w-full">
        <label
          htmlFor="input-email"
          className="font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider text-espresso-ink flex items-center justify-between"
        >
          <span>Correo Electrónico</span>
          <span className="material-symbols-outlined text-[15px] text-tertiary">
            mail
          </span>
        </label>
        <div className="relative">
          <input
            id="input-email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="carlosylauracofi@gmail.com"
            required
            disabled={loading}
            className="w-full bg-surface-card border-[3px] border-espresso-ink rounded-lg px-3.5 py-2.5 font-[family-name:var(--font-dm-sans)] text-sm text-espresso-ink placeholder:text-espresso-ink/50 shadow-[3px_3px_0px_0px_#1A0F0A] focus:outline-none focus:bg-surface focus:shadow-[4px_4px_0px_0px_#E59840] transition-all"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between">
          <label
            htmlFor="input-password"
            className="font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider text-espresso-ink flex items-center gap-1"
          >
            <span>Contraseña</span>
            <span className="material-symbols-outlined text-[15px] text-tertiary">
              lock
            </span>
          </label>
          {!isRegister && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold underline text-tertiary hover:text-espresso-ink uppercase tracking-wide cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
        </div>
        <div className="relative flex items-center">
          <input
            id="input-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="••••••••••••"
            required
            disabled={loading}
            className="w-full bg-surface-card border-[3px] border-espresso-ink rounded-lg px-3.5 py-2.5 pr-11 font-[family-name:var(--font-dm-sans)] text-sm text-espresso-ink placeholder:text-espresso-ink/50 shadow-[3px_3px_0px_0px_#1A0F0A] focus:outline-none focus:bg-surface focus:shadow-[4px_4px_0px_0px_#E59840] transition-all"
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-3 p-1 text-espresso-ink hover:text-primary-container cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
      </div>

      {/* Altitude Coffee Origin Selector (Perk on register) */}
      {isRegister && (
        <SpecialtyChips
          selectedSpecialty={specialty}
          onSelectSpecialty={onSpecialtyChange}
        />
      )}

      {/* Action Submit Button */}
      <button
        id="btn-submit"
        type="submit"
        disabled={loading}
        className="w-full mt-1 bg-primary-container text-espresso-ink border-[3px] border-espresso-ink rounded-lg py-3.5 px-4 font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_#1A0F0A] hover:bg-frappe-toffee active:translate-x-[3px] active:translate-y-[3px] active:shadow-[0px_0px_0px_0px_#1A0F0A] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span>
          {loading
            ? 'EXTRAYENDO ESPRESSO...'
            : isRegister
            ? 'CREAR PASAPORTE CAFÉ'
            : 'ENTRAR A COFIRUTAS'}
        </span>
        <span className="material-symbols-outlined text-[20px]">
          {isRegister ? 'check_circle' : 'rocket_launch'}
        </span>
      </button>
    </form>
  );
};
