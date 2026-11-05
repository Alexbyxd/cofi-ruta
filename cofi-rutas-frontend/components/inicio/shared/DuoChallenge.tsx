'use client';

import { Target, Trophy, MapPin, Flame, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import Link from 'next/link';

type Variant = 'mobile' | 'desktop';

interface Step {
  name: string;
  completed: boolean;
  current: boolean;
  icon: string;
  color: string;
}

const DEFAULT_STEPS: Step[] = [
  { name: 'Café del Socavón', completed: true, current: false, icon: '☕', color: 'bg-[#6B8E4E]' },
  { name: 'Moccoa Artesanal', completed: true, current: true, icon: '🍫', color: 'bg-[#E59840]' },
  { name: 'Grano & Alma', completed: false, current: false, icon: '🌰', color: 'bg-[#DFD9D2]' },
];

interface DuoChallengeProps {
  variant: Variant;
  progress?: number;
  steps?: Step[];
  currentStep?: number;
  totalSteps?: number;
  nextReward?: string;
}

export function DuoChallenge({
  variant,
  progress = 65,
  steps = DEFAULT_STEPS,
  currentStep = 2,
  totalSteps = 3,
  nextReward = 'Badge "Explorador de Altura" + 200 pts',
}: DuoChallengeProps) {
  if (variant === 'mobile') {
    return (
      <div className="bg-[#FFFFFF] p-4 rounded-xl border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#F48E6A] rounded-lg border-2 border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A]">
              <Target className="w-5 h-5 text-[#FFFFFF]" />
            </div>
            <div>
              <h4 className="font-[family-name:var(--font-space-grotesk)] text-[16px] uppercase text-espresso-ink">
                Reto Dúo Semanal
              </h4>
              <span className="font-[family-name:var(--font-dm-sans)] text-[11px] text-[#524437]">
                Circuito 3 Alturas · Semana 12
              </span>
            </div>
          </div>
          <span className="px-2 py-1 bg-[#E59840] text-espresso-ink brutal-border rounded shadow-[1px_1px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold uppercase">
            {progress}% completado
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] uppercase text-espresso-ink font-bold">
              Progreso del circuito
            </span>
            <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold text-espresso-ink bg-[#FFD1B5] px-2 py-0.5 rounded border border-espresso-ink">
              {currentStep} / {totalSteps} cafés
            </span>
          </div>
          <div className="w-full h-3 bg-[#F3EDE5] rounded-full border-2 border-espresso-ink overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#6B8E4E] to-[#E59840] rounded-full border-r-2 border-espresso-ink transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-[#524437]">
            Completa el circuito para desbloquear: <strong>{nextReward}</strong>
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t-2 border-espresso-ink">
          {steps.map((step, i) => (
            <div key={step.name} className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
              step.completed
                ? 'bg-[#6B8E4E]/10 border-[#6B8E4E]'
                : step.current
                ? 'bg-[#E59840]/15 border-[#E59840] ring-2 ring-[#E59840]/30'
                : 'bg-[#F9F3EB] border-espresso-ink/40'
            }`}>
              <div className="relative flex flex-col items-center shrink-0">
                <div className={`w-10 h-10 rounded-full border-3 flex items-center justify-center text-2xl shadow-[2px_2px_0px_0px_#1A0F0A] ${
                  step.completed ? 'bg-[#6B8E4E] border-[#6B8E4E] text-[#FFFFFF]' :
                  step.current ? 'bg-[#E59840] border-[#E59840] text-espresso-ink animate-pulse' :
                  'bg-[#FFFFFF] border-espresso-ink/40 text-espresso-ink/40'
                }`}>
                  {step.completed ? <ShieldCheck className="w-5 h-5" /> : step.icon}
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute top-10 bottom-[-2px] left-1/2 translate-x-[-50%] w-1" style={{
                    background: step.completed ? 'linear-gradient(to bottom, #6B8E4E, #E59840)' : '#EDE7DF',
                    borderLeft: '2px dashed #1A0F0A',
                  }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-[family-name:var(--font-space-grotesk)] text-[12px] uppercase font-bold ${
                  step.completed ? 'text-[#6B8E4E]' : step.current ? 'text-[#E59840]' : 'text-espresso-ink/60'
                }`}>
                  {step.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`px-1.5 py-0.5 text-[9px] font-[family-name:var(--font-space-grotesk)] font-bold uppercase rounded border ${
                    step.completed ? 'bg-[#6B8E4E] text-[#FFFFFF] border-[#6B8E4E]' :
                    step.current ? 'bg-[#E59840] text-espresso-ink border-[#E59840]' :
                    'bg-[#FFFFFF] text-espresso-ink/50 border-espresso-ink/40'
                  }`}>
                    {step.completed ? '✓ Completado' : step.current ? '📍 Aquí ahora' : '⏳ Pendiente'}
                  </span>
                  {step.current && <Flame className="w-3 h-3 text-[#F48E6A] animate-pulse" />}
                </div>
              </div>
              <div className="shrink-0">
                {step.completed && (
                  <div className="p-1.5 bg-[#6B8E4E] text-[#FFFFFF] brutal-border rounded shadow-[1px_1px_0px_0px_#1A0F0A] text-center">
                    <Trophy className="w-4 h-4 mx-auto" />
                  </div>
                )}
                {step.current && (
                  <button className="p-1.5 bg-[#E59840] text-espresso-ink brutal-border rounded shadow-[1px_1px_0px_0px_#1A0F0A] hover:shadow-[2px_2px_0px_0px_#1A0F0A] transition-all">
                    <MapPin className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-espresso-ink">
          <Link href="/explorar" className="py-2.5 px-3 bg-[#E59840] text-[#FFFFFF] brutal-border rounded-lg shadow-[2px_2px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase text-center active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all hover:shadow-[3px_3px_0px_0px_#1A0F0A]">
            Ver Ruta
          </Link>
          <Link href="/matcher" className="py-2.5 px-3 bg-[#FFFFFF] text-espresso-ink brutal-border rounded-lg shadow-[2px_2px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase text-center active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all hover:bg-[#F3EDE5] hover:shadow-[3px_3px_0px_0px_#1A0F0A]">
            CofiMatcher
          </Link>
        </div>
      </div>
    );
  }

  // Desktop variant - Full featured sidebar card
  return (
    <aside className="bg-[#FFFFFF] p-4 lg:p-5 rounded-xl border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] flex flex-col space-y-4 sticky top-24 lg:top-28 mt-4 lg:mt-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#F48E6A] rounded-lg border-2 border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A]">
            <Target className="w-5 h-5 text-[#FFFFFF]" />
          </div>
          <div>
            <h4 className="font-[family-name:var(--font-space-grotesk)] text-[15px] uppercase text-espresso-ink">
              Reto Dúo Semanal
            </h4>
            <span className="font-[family-name:var(--font-dm-sans)] text-[11px] text-[#524437]">
              Circuito 3 Alturas · Semana 12
            </span>
          </div>
        </div>
        <span className="px-2 py-1 bg-[#E59840] text-espresso-ink brutal-border rounded shadow-[1px_1px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold uppercase">
          {progress}% completado
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] uppercase text-espresso-ink font-bold">
            Progreso del circuito
          </span>
          <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold text-espresso-ink bg-[#FFD1B5] px-2 py-0.5 rounded border border-espresso-ink">
            {currentStep} / {totalSteps} cafés
          </span>
        </div>
        <div className="w-full h-3 bg-[#F3EDE5] rounded-full border-2 border-espresso-ink overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#6B8E4E] to-[#E59840] rounded-full border-r-2 border-espresso-ink transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-[#524437]">
          Completa el circuito para desbloquear: <strong>{nextReward}</strong>
        </p>
      </div>

      <div className="space-y-2 pt-2 border-t-2 border-espresso-ink">
        {steps.map((step, i) => (
          <div key={step.name} className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
            step.completed
              ? 'bg-[#6B8E4E]/10 border-[#6B8E4E]'
              : step.current
              ? 'bg-[#E59840]/15 border-[#E59840] ring-2 ring-[#E59840]/30'
              : 'bg-[#F9F3EB] border-espresso-ink/40'
          }`}>
            <div className="relative flex flex-col items-center shrink-0">
              <div className={`w-10 h-10 rounded-full border-3 flex items-center justify-center text-2xl shadow-[2px_2px_0px_0px_#1A0F0A] ${
                step.completed ? 'bg-[#6B8E4E] border-[#6B8E4E] text-[#FFFFFF]' :
                step.current ? 'bg-[#E59840] border-[#E59840] text-espresso-ink animate-pulse' :
                'bg-[#FFFFFF] border-espresso-ink/40 text-espresso-ink/40'
              }`}>
                {step.completed ? <ShieldCheck className="w-5 h-5" /> : step.icon}
              </div>
              {i < steps.length - 1 && (
                <div className="absolute top-10 bottom-[-2px] left-1/2 translate-x-[-50%] w-1" style={{
                  background: step.completed ? 'linear-gradient(to bottom, #6B8E4E, #E59840)' : '#EDE7DF',
                  borderLeft: '2px dashed #1A0F0A',
                }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-[family-name:var(--font-space-grotesk)] text-[12px] uppercase font-bold ${
                step.completed ? 'text-[#6B8E4E]' : step.current ? 'text-[#E59840]' : 'text-espresso-ink/60'
              }`}>
                {step.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`px-1.5 py-0.5 text-[9px] font-[family-name:var(--font-space-grotesk)] font-bold uppercase rounded border ${
                  step.completed ? 'bg-[#6B8E4E] text-[#FFFFFF] border-[#6B8E4E]' :
                  step.current ? 'bg-[#E59840] text-espresso-ink border-[#E59840]' :
                  'bg-[#FFFFFF] text-espresso-ink/50 border-espresso-ink/40'
                }`}>
                  {step.completed ? '✓ Completado' : step.current ? '📍 Aquí ahora' : '⏳ Pendiente'}
                </span>
                {step.current && <Flame className="w-3 h-3 text-[#F48E6A] animate-pulse" />}
              </div>
            </div>
            <div className="shrink-0">
              {step.completed && (
                <div className="p-1.5 bg-[#6B8E4E] text-[#FFFFFF] brutal-border rounded shadow-[1px_1px_0px_0px_#1A0F0A] text-center">
                  <Trophy className="w-4 h-4 mx-auto" />
                </div>
              )}
              {step.current && (
                <button className="p-1.5 bg-[#E59840] text-espresso-ink brutal-border rounded shadow-[1px_1px_0px_0px_#1A0F0A] hover:shadow-[2px_2px_0px_0px_#1A0F0A] transition-all">
                  <MapPin className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Link href="/explorar" className="group p-3 bg-[#FAF4EC] rounded-lg border-2 border-espresso-ink hover:border-[#E59840] hover:shadow-[3px_3px_0px_0px_#1A0F0A] transition-all">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#D8B18A] rounded-lg border-2 border-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A] shrink-0">
            <MapPin className="w-5 h-5 text-espresso-ink" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-[family-name:var(--font-space-grotesk)] text-[11px] uppercase text-[#984628] font-bold">
              Ruta destacada
            </p>
            <h5 className="font-[family-name:var(--font-space-grotesk)] text-[14px] text-espresso-ink font-bold leading-tight mt-0.5 group-hover:text-[#E59840] transition-colors">
              Circuito Centro Histórico
            </h5>
            <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-[#524437] mt-1">
              4 cafés · 2.3 km · ~3 horas · Ideal para parejas
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-1 bg-[#FFFFFF] brutal-border rounded shadow-[1px_1px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold uppercase text-espresso-ink flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#6B8E4E]" />
                +150 XP
              </span>
              <span className="px-2 py-1 bg-[#FFFFFF] brutal-border rounded shadow-[1px_1px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold uppercase text-espresso-ink flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#6B8E4E]" />
                Badge garantizado
              </span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-espresso-ink/50 group-hover:text-espresso-ink group-hover:translate-x-1 transition-all shrink-0 mt-1" />
        </div>
      </Link>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-espresso-ink">
        <Link href="/explorar" className="py-2.5 px-3 bg-[#E59840] text-[#FFFFFF] brutal-border rounded-lg shadow-[2px_2px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase text-center active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all hover:shadow-[3px_3px_0px_0px_#1A0F0A]">
          Ver Ruta
        </Link>
        <Link href="/matcher" className="py-2.5 px-3 bg-[#FFFFFF] text-espresso-ink brutal-border rounded-lg shadow-[2px_2px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase text-center active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all hover:bg-[#F3EDE5] hover:shadow-[3px_3px_0px_0px_#1A0F0A]">
          CofiMatcher
        </Link>
      </div>
    </aside>
  );
}