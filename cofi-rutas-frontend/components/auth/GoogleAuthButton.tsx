import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { GoogleAuthButtonProps } from '../../types/auth';

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onClick,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="w-full bg-surface-card border-[3px] border-espresso-ink rounded-lg shadow-[4px_4px_0px_0px_#1A0F0A] px-4 py-3 lg:py-3.5 flex items-center justify-center gap-3 transition-transform duration-75 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#1A0F0A] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.15z"
            fill="#4285F4"
          />
          <path
            d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.2v3.15C3.24 21.4 7.34 24 12 24z"
            fill="#34A853"
          />
          <path
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.2C.44 8.1 0 9.99 0 12s.44 3.9 1.2 5.42l4.08-3.15z"
            fill="#FBBC05"
          />
          <path
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.24 2.6 1.2 6.58l4.08 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            fill="#EA4335"
          />
        </svg>
        <span className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-wider text-espresso-ink">
          Continuar con Google
        </span>
      </button>

      <div className="flex items-center justify-center gap-1.5 text-on-surface-variant text-xs font-[family-name:var(--font-space-grotesk)] font-bold">
        <ShieldCheck className="w-4 h-4 text-badge-matcha shrink-0" strokeWidth={2.5} />
        <span>Acceso rápido y sincronización con Pasaporte Oruro</span>
      </div>
    </div>
  );
};
