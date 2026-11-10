import React from 'react';
import { Coffee } from 'lucide-react';
import type { AuthHeaderProps } from '../../types/auth';

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  altitudeMeters = 3735,
  editionBadge = 'COFIRUTAS • ORURO',
}) => {
  return (
    <header className="flex flex-col gap-2 items-start relative w-full">
      {/* Brand Passport Stamp Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-card border-[3px] border-espresso-ink rounded-full shadow-[2px_2px_0px_0px_#1A0F0A] -rotate-2">
        <Coffee className="w-4 h-4 text-primary-container shrink-0" strokeWidth={2.5} />
        <span className="font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider text-espresso-ink">
          {editionBadge} {altitudeMeters}M
        </span>
      </div>

      {/* Main Title & Subtitle */}
      <div className="flex flex-col gap-1 mt-1">
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-espresso-ink tracking-tight flex items-center gap-2">
          <span>BIENVENIDO A COFIRUTAS</span>
          <Coffee className="w-6 h-6 lg:w-7 lg:h-7 text-tertiary shrink-0" strokeWidth={2.5} />
        </h1>
        <p className="font-[family-name:var(--font-dm-sans)] text-sm lg:text-base text-on-surface-variant font-medium leading-snug">
          Tu pasaporte cafetero, citas en pareja y los mejores submarinos y cafés de altura en Oruro.
        </p>
      </div>

      {/* Tactical Altitude Decorative Pills */}
      <div className="flex items-center gap-2 mt-1">
        <div className="px-2 py-0.5 bg-badge-matcha text-white rounded text-[10px] font-bold shadow-[2px_2px_0px_0px_#1A0F0A] uppercase tracking-wider font-[family-name:var(--font-space-grotesk)]">
          Tueste Andino
        </div>
        <div className="px-2 py-0.5 bg-secondary-container text-on-secondary-container border border-espresso-ink rounded text-[10px] font-bold shadow-[2px_2px_0px_0px_#1A0F0A] uppercase tracking-wider font-[family-name:var(--font-space-grotesk)]">
          Edición Parejas &amp; Dúos
        </div>
      </div>
    </header>
  );
};
