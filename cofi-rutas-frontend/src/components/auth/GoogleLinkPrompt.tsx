'use client';

import React from 'react';
import { AlertTriangle, CircleAlert, Link2, X } from 'lucide-react';
import type { GoogleLinkPromptProps } from '../../types/auth';

const TITLES: Record<'ask' | 'linking' | 'mismatch', string> = {
  ask: 'Vinculá tu cuenta con Google',
  linking: 'Vinculando con Google…',
  mismatch: 'El email de Google no coincide',
};

/**
 * Modal de vinculación de Google.
 *
 * Se muestra después de un login con email/contraseña, cuando la cuenta
 * todavía no tiene Google asociado. Sigue el lenguaje visual brutalista del
 * resto del auth: borde grueso, sombra dura y tipografía en mayúsculas.
 */
export const GoogleLinkPrompt: React.FC<GoogleLinkPromptProps> = ({
  prompt,
  email,
  onConfirm,
  onDecline,
  onContinueWithGoogle,
  onDismissError,
}) => {
  const isBusy = prompt.kind === 'linking';

  const Icon =
    prompt.kind === 'mismatch'
      ? AlertTriangle
      : prompt.kind === 'error'
        ? CircleAlert
        : Link2;

  const dismiss = prompt.kind === 'error' ? onDismissError : onDecline;

  const body = (() => {
    switch (prompt.kind) {
      case 'ask':
        return (
          <>
            ¿Querés asociar Google a{' '}
            <span className="font-bold">{email}</span>? Después vas a poder
            entrar con un solo clic.
          </>
        );
      case 'linking':
        return 'Terminá el flujo en la ventana de Google. No la cierres.';
      case 'mismatch':
        return (
          <>
            La cuenta de Google que elegiste usa otro email. Las cuentas no se
            fusionan: <span className="font-bold">la identidad de Google tiene
            prioridad</span>. Si continuás, se cierra tu sesión actual y entrás
            con esa cuenta de Google.
          </>
        );
      case 'error':
        return prompt.message;
    }
  })();

  const confirmLabel = (() => {
    switch (prompt.kind) {
      case 'ask':
        return 'Sí, vincular';
      case 'linking':
        return 'Vinculando…';
      case 'mismatch':
        return 'Continuar con Google';
      case 'error':
        return prompt.actionLabel;
    }
  })();

  const handleConfirm = () => {
    if (isBusy) return;
    if (prompt.kind === 'mismatch') {
      onContinueWithGoogle();
      return;
    }
    if (prompt.kind === 'error') {
      onDismissError();
      return;
    }
    onConfirm();
  };

  return (
    <div
      role="group"
      aria-labelledby="google-link-title"
      aria-live="polite"
      className="w-full bg-primary-container border-[3px] border-espresso-ink rounded-lg p-3.5 shadow-[4px_4px_0px_0px_#1A0F0A] flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <Icon
            className="w-5 h-5 text-espresso-ink shrink-0 mt-0.5"
            strokeWidth={2.5}
          />
          <div className="flex flex-col gap-1">
            <h2
              id="google-link-title"
              className="font-[family-name:var(--font-space-grotesk)] text-sm font-black uppercase tracking-wide text-espresso-ink leading-tight"
            >
              {prompt.kind === 'error' ? prompt.title : TITLES[prompt.kind]}
            </h2>
            <p className="font-[family-name:var(--font-dm-sans)] text-xs text-espresso-ink/80 font-medium leading-snug">
              {body}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          disabled={isBusy}
          aria-label="Cerrar"
          className="p-1 hover:opacity-75 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isBusy}
          className="flex-1 bg-surface-card border-[3px] border-espresso-ink rounded-lg px-3 py-2 font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider text-espresso-ink shadow-[3px_3px_0px_0px_#1A0F0A] transition-transform duration-75 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#1A0F0A] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {confirmLabel}
        </button>
        {prompt.kind !== 'error' && (
          <button
            type="button"
            onClick={onDecline}
            disabled={isBusy}
            className="flex-1 bg-transparent border-[3px] border-espresso-ink/40 rounded-lg px-3 py-2 font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider text-espresso-ink/70 hover:text-espresso-ink hover:border-espresso-ink transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ahora no
          </button>
        )}
      </div>
    </div>
  );
};
