'use client';

import { Wind } from 'lucide-react';

/**
 * Banner de clima del Altiplano (Oruro).
 * Se muestra debajo del saludo de la pareja.
 */
export function ClimateBanner() {
  return (
    <div className="flex items-center gap-2.5 bg-[#FFFFFF] p-3 rounded-lg border-[3px] border-espresso-ink shadow-[3px_3px_0px_0px_#1A0F0A]">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFD1B5] text-[#1A0F0A] shrink-0 border-2 border-espresso-ink">
        <Wind className="w-5 h-5 text-[#1A0F0A]" />
      </div>
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] uppercase text-espresso-ink font-bold">
            Clima Altiplano: 6°C
          </span>
          <span className="text-[10px] font-[family-name:var(--font-space-grotesk)] px-1.5 py-0.2 bg-[#F48E6A] text-espresso-ink rounded border border-espresso-ink font-bold">
            Sensación -2°C
          </span>
        </div>
        <p className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[#524437] truncate">
          Viento frío a 3,735m • Ideal para Submarinos calientes con canela
        </p>
      </div>
    </div>
  );
}
