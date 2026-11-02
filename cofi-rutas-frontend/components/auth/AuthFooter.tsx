import React from 'react';
import { Mountain } from 'lucide-react';
import type { AuthFooterProps } from '../../types/auth';

export const AuthFooter: React.FC<AuthFooterProps> = ({ className = '' }) => {
  return (
    <footer className={`flex flex-col items-center gap-1 text-center py-4 w-full ${className}`}>
      <p className="font-[family-name:var(--font-dm-sans)] text-xs text-on-surface-variant max-w-xs">
        Al continuar aceptas los{' '}
        <a
          href="#terminos"
          className="font-bold underline text-espresso-ink hover:text-primary-container"
        >
          Términos Cafeteros
        </a>{' '}
        y la{' '}
        <a
          href="#privacidad"
          className="font-bold underline text-espresso-ink hover:text-primary-container"
        >
          Política de Privacidad
        </a>{' '}
        de CofiRutas Oruro.
      </p>

      <div className="flex items-center justify-center gap-1.5 mt-2 opacity-70">
        <Mountain className="w-3.5 h-3.5 text-espresso-ink" strokeWidth={2.5} />
        <span className="font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold uppercase tracking-wider text-espresso-ink">
          Oruro, Bolivia • Hecho con tueste artesanal
        </span>
      </div>
    </footer>
  );
};
