'use client';

import { Heart, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

/**
 * Hero del modo CofiDúo.
 * Muestra el estado de la pareja, el antojo del día y el progreso del Pasaporte Dúo.
 */
export function DuoHero() {
  return (
    <div className="relative bg-[#E59840] p-4 rounded-xl border-[3px] border-espresso-ink shadow-[6px_6px_0px_0px_#1A0F0A] overflow-hidden">
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full border-4 border-dashed border-espresso-ink/20 pointer-events-none flex items-center justify-center rotate-12">
        <span className="font-[family-name:var(--font-space-grotesk)] text-headline-sm uppercase text-espresso-ink/20">
          ORURO 100%
        </span>
      </div>
      <div className="relative z-10 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-espresso-ink text-[#FFFFFF] rounded-md font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold uppercase tracking-wider">
            <Heart className="w-3 h-3 text-[#F48E6A]" />
            Modo CofiDúo Activo • Día 125
          </span>
          <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold uppercase text-espresso-ink bg-[#FFFFFF] px-2 py-0.5 rounded border-2 border-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A]">
            Nivel: Barista Amor
          </span>
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-[28px] uppercase text-espresso-ink leading-none tracking-tight">
            ¿QUÉ MERENDAMOS HOY?
          </h2>
          <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-espresso-ink font-medium mt-1">
            Carlos tiene antojo de café de filtro; Laura guardó churros recién hechos.
          </p>
        </div>
        <div className="bg-[#FFFFFF] p-3 rounded-lg border-[3px] border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A]">
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] uppercase text-espresso-ink font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#6B8E4E]" />
              Pasaporte Dúo
            </span>
            <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold text-espresso-ink bg-[#FFD1B5] px-1.5 py-0.5 rounded">
              8 / 10 Sellos
            </span>
          </div>
          <div className="w-full h-3.5 bg-[#F3EDE5] rounded-full border-2 border-espresso-ink p-0.5 overflow-hidden">
            <div className="h-full bg-[#6B8E4E] rounded-full border-r border-espresso-ink transition-all duration-500" style={{ width: '80%' }} />
          </div>
          <p className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[#524437] mt-1.5">
            ¡A solo 2 cafeterías de reclamar un Cheescake de Maracuyá gratis!
          </p>
        </div>
        <button className="w-full py-3.5 px-4 bg-[#F48E6A] text-[#FFFFFF] rounded-lg border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 group cursor-pointer">
          <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="font-[family-name:var(--font-space-grotesk)] text-[16px] uppercase tracking-wide">Abrir CofiMatcher en Vivo</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
