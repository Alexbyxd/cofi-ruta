'use client';

import React from 'react';
import { Coffee, Mountain } from 'lucide-react';

export interface DashboardHeaderProps {
  editionBadge?: string;
  onLogout?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  editionBadge = 'COFIRUTAS • ORURO',
  onLogout,
}) => {
  return (
    <header className="flex flex-col gap-3 w-full px-4 sm:px-6 py-4 bg-surface-card border-b-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A]">
      {/* Brand Stamp & Title */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-badge-matcha text-white border-[3px] border-espresso-ink rounded-full shadow-[2px_2px_0px_0px_#1A0F0A] -rotate-2">
          <Coffee className="w-4 h-4 shrink-0" strokeWidth={2.5} />
          <span className="font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider">
            {editionBadge}
          </span>
        </div>

        <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl sm:text-3xl font-black uppercase text-espresso-ink tracking-tight flex items-center gap-2">
          <span>INICIO — COFI RUTAS DASHBOARD</span>
          <Coffee className="w-6 h-6 text-tertiary shrink-0" strokeWidth={2.5} />
        </h1>

        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-on-surface-variant font-medium leading-snug">
          Tu pasaporte cafetero, citas en pareja y los mejores submarinos y cafés de altura en Oruro.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t-[3px] border-espresso-ink/30">
        <div className="flex items-center gap-2 opacity-70">
          <Mountain className="w-3.5 h-3.5 text-espresso-ink" strokeWidth={2.5} />
          <span className="font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold uppercase tracking-wider text-espresso-ink">
            Oruro, Bolivia • Hecho con tueste artesanal
          </span>
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="brutal-btn-secondary px-4 py-2 text-xs sm:text-sm"
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </header>
  );
};
