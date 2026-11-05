'use client';

import { Heart, ShieldCheck, Zap, ArrowRight, TrendingUp, Users, Target, Gift } from 'lucide-react';

type Variant = 'mobile' | 'desktop';

interface DuoHeroProps {
  variant: Variant;
  streakWeeks: number;
  currentStamps: number;
  targetStamps: number;
  nextReward: string;
  sharedTastes: string[];
  duoNames: [string, string];
  duoDay: number;
  onCTAClick?: () => void;
}

export function DuoHero({
  variant,
  streakWeeks,
  currentStamps,
  targetStamps,
  nextReward,
  sharedTastes,
  duoNames,
  duoDay,
  onCTAClick,
}: DuoHeroProps) {
  const progress = Math.min(100, (currentStamps / targetStamps) * 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (variant === 'mobile') {
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
              Modo CofiDúo Activo • Día {duoDay}
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
              {duoNames[0]} tiene antojo de café de filtro; {duoNames[1]} guardó churros recién hechos.
            </p>
          </div>
          <div className="bg-[#FFFFFF] p-3 rounded-lg border-[3px] border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] uppercase text-espresso-ink font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#6B8E4E]" />
                Pasaporte Dúo
              </span>
              <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold text-espresso-ink bg-[#FFD1B5] px-1.5 py-0.5 rounded">
                {currentStamps} / {targetStamps} Sellos
              </span>
            </div>
            <div className="w-full h-3.5 bg-[#F3EDE5] rounded-full border-2 border-espresso-ink p-0.5 overflow-hidden">
              <div className="h-full bg-[#6B8E4E] rounded-full border-r border-espresso-ink transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[#524437] mt-1.5">
              ¡A solo {targetStamps - currentStamps} cafeterías de reclamar {nextReward}!
            </p>
          </div>
          <button
            onClick={onCTAClick}
            className="w-full py-3.5 px-4 bg-[#F48E6A] text-[#FFFFFF] rounded-lg border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="font-[family-name:var(--font-space-grotesk)] text-[16px] uppercase tracking-wide">Abrir CofiMatcher en Vivo</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // Desktop variant
  return (
    <div className="relative bg-[#E59840] p-6 rounded-xl border-[3px] border-espresso-ink shadow-[8px_8px_0px_0px_#1A0F0A] overflow-hidden">
      <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full border-4 border-dashed border-espresso-ink/20 pointer-events-none flex items-center justify-center rotate-12">
        <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] uppercase text-espresso-ink/20">
          ORURO 100%
        </span>
      </div>
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* LEFT: Info Panel */}
        <div className="flex-1 lg:w-2/3 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-espresso-ink text-[#FFFFFF] rounded-md font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#1A0F0A]">
              <Heart className="w-4 h-4 text-[#F48E6A]" />
              Modo CofiDúo Activo
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] text-espresso-ink rounded-md font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold uppercase tracking-wider border-2 border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A]">
              <TrendingUp className="w-4 h-4 text-[#6B8E4E]" />
              Racha: {streakWeeks} semanas
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F48E6A] text-[#FFFFFF] rounded-md font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold uppercase tracking-wider border-2 border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A]">
              <Users className="w-4 h-4" />
              Día {duoDay} juntos
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] text-espresso-ink rounded-md font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase tracking-wider border-2 border-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A]">
              <Target className="w-3 h-3 text-[#984628]" />
              Nivel: Barista Amor
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-[32px] uppercase text-espresso-ink leading-none tracking-tight">
                ¿QUÉ MERENDAMOS HOY?
              </h2>
              <p className="font-[family-name:var(--font-dm-sans)] text-[15px] text-espresso-ink font-medium mt-1.5 max-w-lg">
                {duoNames[0]} tiene antojo de café de filtro V60; {duoNames[1]} guardó churros recién hechos con dulce de leche.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {sharedTastes.map((taste, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-[#FFFFFF]/90 text-espresso-ink font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase rounded border border-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A] rotate-1 hover:rotate-0 transition-transform"
                >
                  {taste}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Progress Ring + Reward + CTA */}
        <div className="flex lg:w-1/3 flex-col items-center lg:items-end gap-4 shrink-0">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg width="96" height="96" className="transform -rotate-90">
              <circle cx="48" cy="48" r="45" fill="none" stroke="#F3EDE5" strokeWidth="8" className="brutal-border" />
              <circle
                cx="48"
                cy="48"
                r="45"
                fill="none"
                stroke="#6B8E4E"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000"
                style={{ filter: 'drop-shadow(2px 2px 0px #1A0F0A)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-[family-name:var(--font-space-grotesk)] text-[28px] font-black text-espresso-ink">
                {Math.round(progress)}%
              </span>
              <span className="font-[family-name:var(--font-space-grotesk)] text-[10px] uppercase text-espresso-ink/70">
                Pasaporte Dúo
              </span>
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-lg border-[3px] border-espresso-ink shadow-[3px_3px_0px_0px_#1A0F0A] w-full lg:w-auto text-center lg:text-right">
            <div className="flex items-center justify-center lg:justify-between gap-3 mb-3">
              <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] uppercase text-espresso-ink font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#6B8E4E]" />
                Pasaporte Dúo
              </span>
              <span className="font-[family-name:var(--font-space-grotesk)] text-[13px] font-bold text-espresso-ink bg-[#FFD1B5] px-3 py-1 rounded border-2 border-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A]">
                {currentStamps} / {targetStamps} Sellos
              </span>
            </div>
            <div className="w-full h-3 bg-[#F3EDE5] rounded-full border-2 border-espresso-ink overflow-hidden">
              <div className="h-full bg-[#6B8E4E] rounded-full border-r-2 border-espresso-ink transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[#524437] mt-2">
              ¡A solo <strong>{targetStamps - currentStamps} cafeterías</strong> de reclamar <strong>{nextReward}</strong>!
            </p>
          </div>

          <button
            onClick={onCTAClick}
            className="w-full lg:w-auto py-4 px-6 bg-[#F48E6A] text-[#FFFFFF] rounded-lg border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="font-[family-name:var(--font-space-grotesk)] text-[17px] uppercase tracking-wide">Abrir CofiMatcher en Vivo</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}