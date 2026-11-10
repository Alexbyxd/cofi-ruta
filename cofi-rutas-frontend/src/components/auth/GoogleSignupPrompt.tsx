import React from 'react';
import { UserPlus, X } from 'lucide-react';
import type { GoogleSignupPromptProps } from '../../types/auth';

export const GoogleSignupPrompt: React.FC<GoogleSignupPromptProps> = ({
  draft,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <div
      role="group"
      aria-labelledby="google-signup-title"
      className="w-full bg-primary-container border-[3px] border-espresso-ink rounded-lg p-3.5 shadow-[4px_4px_0px_0px_#1A0F0A] flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <UserPlus
            className="w-5 h-5 text-espresso-ink shrink-0 mt-0.5"
            strokeWidth={2.5}
          />
          <div className="flex flex-col gap-1">
            <h2
              id="google-signup-title"
              className="font-[family-name:var(--font-space-grotesk)] text-sm font-black uppercase tracking-wide text-espresso-ink leading-tight"
            >
              Tu cuenta de Google no está registrada
            </h2>
            <p className="font-[family-name:var(--font-dm-sans)] text-xs text-espresso-ink/80 font-medium leading-snug">
              ¿Querés crear una cuenta en CofiRutas con{' '}
              <span className="font-bold">{draft.email || 'tu cuenta de Google'}</span>?
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          aria-label="Cancelar registro con Google"
          className="p-1 hover:opacity-75 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-surface-card border-[3px] border-espresso-ink rounded-lg px-3 py-2 font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider text-espresso-ink shadow-[3px_3px_0px_0px_#1A0F0A] transition-transform duration-75 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#1A0F0A] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Creando cuenta...' : 'Sí, crear mi cuenta'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-transparent border-[3px] border-espresso-ink/40 rounded-lg px-3 py-2 font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider text-espresso-ink/70 hover:text-espresso-ink hover:border-espresso-ink transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
};
