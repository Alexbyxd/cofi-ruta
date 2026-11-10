'use client';

import { Flame, Zap, Award, Users, TrendingUp, Coffee, MapPin } from 'lucide-react';

type Variant = 'mobile' | 'desktop';

interface HeroSectionProps {
  variant: Variant;
  duoNames: [string, string];
  greeting?: string;
}

const GREETINGS = {
  morning: '¡Buenos días',
  afternoon: '¡Buenas tardes',
  evening: '¡Buenas noches',
};

export function HeroSection({ variant, duoNames, greeting = GREETINGS.afternoon }: HeroSectionProps) {
  if (variant === 'mobile') {
    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] uppercase tracking-widest text-[#795741] font-bold">
              Sesión en Pareja • Oruro
            </span>
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-[28px] uppercase text-espresso-ink leading-tight tracking-tight">
              {greeting}, {duoNames[0]} & {duoNames[1]}! ☕
            </h1>
          </div>
          <div className="shrink-0 p-2.5 bg-[#E59840] rounded-lg border-[3px] border-espresso-ink shadow-[3px_3px_0px_0px_#1A0F0A] rotate-3 hover:rotate-0 transition-transform">
            <Flame className="w-6 h-6" />
          </div>
        </div>
        <ClimateBannerMobile />
      </div>
    );
  }

  // Desktop variant
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* LEFT: Greeting Card */}
      <div className="bg-[#FFFFFF] p-4 rounded-xl border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full border-2 border-dashed border-espresso-ink/20 pointer-events-none flex items-center justify-center rotate-12">
          <span className="font-[family-name:var(--font-space-grotesk)] text-[10px] uppercase text-espresso-ink/20">
            ALTIPLANO
          </span>
        </div>
        <div className="relative z-10 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-espresso-ink text-[#FFFFFF] rounded-md font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase tracking-wider">
                <Users className="w-3 h-3 text-[#E59840]" />
                Sesión en Pareja · Oruro
              </span>
              <span className="flex items-center gap-1 px-2 py-1 bg-[#E59840] text-espresso-ink rounded-md font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase tracking-wider border-2 border-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A]">
                <TrendingUp className="w-3 h-3" />
                18 parejas activas
              </span>
            </div>
            <div className="shrink-0 p-2 bg-[#F48E6A] rounded-lg border-[3px] border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A] rotate-3 hover:rotate-0 transition-transform">
              <Flame className="w-6 h-6 text-espresso-ink" />
            </div>
          </div>

          <div>
            <span className="font-[family-name:var(--font-space-grotesk)] text-[13px] uppercase text-[#795741] font-bold tracking-wider block mb-1">
              {greeting}, {duoNames[0]} & {duoNames[1]}! ☕
            </span>
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-[32px] uppercase text-espresso-ink leading-tight tracking-tight">
              ¿Qué ruta de café trazamos hoy?
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="px-2 py-1 bg-[#D8B18A] text-espresso-ink font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold uppercase rounded border border-espresso-ink rotate-3 shadow-[1px_1px_0px_0px_#1A0F0A]">
              🇧🇴 100% Boliviano · Grano Caranavi
            </span>
            <span className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#524437] flex items-center gap-1">
              <Coffee className="w-4 h-4" />
              Sugerencia del día: Submarino con churros en Café del Socavón
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: Climate Banner Card */}
      <div className="bg-[#FFFFFF] p-4 rounded-xl border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A]">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFD1B5] text-[#1A0F0A] shrink-0 border-2 border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A]">
            <Zap className="w-6 h-6 text-[#1A0F0A]" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-[family-name:var(--font-space-grotesk)] text-[13px] uppercase text-espresso-ink font-bold">
                Clima Altiplano: 6°C
              </span>
              <span className="text-[10px] font-[family-name:var(--font-space-grotesk)] px-2 py-0.5 bg-[#F48E6A] text-espresso-ink rounded border border-espresso-ink font-bold">
                Sensación -2°C
              </span>
              <span className="px-2 py-0.5 bg-[#E59840] text-espresso-ink font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold uppercase rounded border border-espresso-ink">
                Viento 15 km/h
              </span>
            </div>
            <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#524437] mt-1 leading-relaxed">
              Viento frío a 3.735m · Ideal para <strong>Submarinos calientes</strong> con chocolate de los Yungas y toque de clavo de olor.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="px-2 py-1 bg-[#FFFFFF] border-[3px] border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A] rounded-lg font-[family-name:var(--font-space-grotesk)] text-[11px] uppercase text-espresso-ink font-bold flex items-center gap-1">
                <Award className="w-3 h-3 text-[#6B8E4E]" />
                Leche a 70°C óptima
              </span>
              <span className="px-2 py-1 bg-[#FFFFFF] border-[3px] border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A] rounded-lg font-[family-name:var(--font-space-grotesk)] text-[11px] uppercase text-espresso-ink font-bold flex items-center gap-1">
                <Coffee className="w-3 h-3 text-[#984628]" />
                Chocolate puro + clavo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile ClimateBanner (inline to avoid import cycle)
function ClimateBannerMobile() {
  const { Wind } = require('lucide-react');
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