import React from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import type { AuthModeTabsProps } from '../../types/auth';

export const AuthModeTabs: React.FC<AuthModeTabsProps> = ({
  mode,
  onModeChange,
}) => {
  return (
    <div
      role="tablist"
      aria-label="Selección de modo de autenticación"
      className="grid grid-cols-2 gap-2 p-1 bg-surface-container-high border-[3px] border-espresso-ink rounded-lg shadow-[3px_3px_0px_0px_#1A0F0A] w-full"
    >
      <button
        type="button"
        role="tab"
        id="tab-login"
        aria-selected={mode === 'login'}
        onClick={() => onModeChange('login')}
        className={`py-2.5 lg:py-3 px-3 rounded font-[family-name:var(--font-space-grotesk)] text-xs lg:text-[13px] font-bold uppercase tracking-wider transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer ${
          mode === 'login'
            ? 'bg-primary-container text-espresso-ink border-[2px] border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A]'
            : 'bg-surface-card text-on-surface-variant border-[2px] border-transparent hover:text-espresso-ink'
        }`}
      >
        <LogIn className="w-4 h-4 shrink-0" strokeWidth={2.5} />
        <span>Iniciar Sesión</span>
      </button>

      <button
        type="button"
        role="tab"
        id="tab-register"
        aria-selected={mode === 'register'}
        onClick={() => onModeChange('register')}
        className={`py-2.5 lg:py-3 px-3 rounded font-[family-name:var(--font-space-grotesk)] text-xs lg:text-[13px] font-bold uppercase tracking-wider transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer ${
          mode === 'register'
            ? 'bg-primary-container text-espresso-ink border-[2px] border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A]'
            : 'bg-surface-card text-on-surface-variant border-[2px] border-transparent hover:text-espresso-ink'
        }`}
      >
        <UserPlus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
        <span>Crear Cuenta</span>
      </button>
    </div>
  );
};
