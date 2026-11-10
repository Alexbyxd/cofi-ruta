'use client';

import Link from 'next/link';
import { Award, CheckCircle, Bookmark, Lightbulb, RotateCcw, MapPin } from 'lucide-react';

type Variant = 'mobile' | 'desktop';

interface Stamp {
  name: string;
  initial: string;
  date: string;
  bg: string;
  border: string;
  text: string;
  icon: 'check' | 'add' | 'verified';
  fill: boolean;
  rotation: number;
  neighborhood?: string;
}

const DEFAULT_STAMPS: Stamp[] = [
  { name: 'Kory Café', initial: 'K', date: '14 Oct', bg: 'bg-[#6B8E4E]/20', border: 'border-[#6B8E4E]', text: 'text-[#6B8E4E]', icon: 'verified', fill: true, rotation: -3, neighborhood: 'Centro' },
  { name: 'El Pagador', initial: 'E', date: '22 Oct', bg: 'bg-[#F48E6A]/30', border: 'border-[#F48E6A]', text: 'text-[#984628]', icon: 'verified', fill: true, rotation: 2, neighborhood: 'Mercado' },
  { name: 'Chocolatería', initial: 'C', date: 'Ayer', bg: 'bg-[#E59840]/30', border: 'border-[#E59840]', text: 'text-[#8a5100]', icon: 'verified', fill: true, rotation: -2, neighborhood: 'Plaza' },
  { name: 'Café Central', initial: 'C', date: 'Hoy', bg: 'bg-[#D8B18A]/30', border: 'border-[#D8B18A]', text: 'text-[#7A5842]', icon: 'check', fill: true, rotation: 1, neighborhood: 'Centro' },
  { name: 'Siguiente', initial: '+', date: 'Pendiente', bg: 'bg-[#FFFFFF]', border: 'border-espresso-ink/40', text: 'text-espresso-ink/50', icon: 'add', fill: false, rotation: 0, neighborhood: '?' },
];

const ICON_MAP = {
  check: CheckCircle,
  add: Bookmark,
  verified: Award,
};

const NEXT_REWARD = 'Cheesecake de Maracuyá gratis';
const ALTITUDE_TIP = 'Pide tu café con granos de Caranavi tostado medio para mantener la calidez corporal sin elevar tu presión a 3.735m.';

interface PasaporteSellosProps {
  variant: Variant;
  stamps?: Stamp[];
  completedStamps?: number;
  totalStamps?: number;
  progress?: number;
  nextReward?: string;
  altitudeTip?: string;
  onViewAllClick?: () => void;
  onMatcherClick?: () => void;
}

export function PasaporteSellos({
  variant,
  stamps = DEFAULT_STAMPS,
  completedStamps: completedStampsProp,
  totalStamps: totalStampsProp,
  progress: progressProp,
  nextReward = NEXT_REWARD,
  altitudeTip = ALTITUDE_TIP,
}: PasaporteSellosProps) {
  const completedStamps = completedStampsProp ?? stamps.filter(s => s.fill).length;
  const totalStamps = totalStampsProp ?? stamps.length - 1;
  const progress = progressProp ?? Math.round((completedStamps / totalStamps) * 100);

  if (variant === 'mobile') {
    return (
      <div className="bg-[#FFFFFF] p-4 rounded-xl border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#984628]" />
            <h4 className="font-[family-name:var(--font-space-grotesk)] text-[16px] uppercase text-espresso-ink">
              Sellos Recientes del Dúo
            </h4>
          </div>
          <a className="font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold text-[#984628] underline uppercase" href="/duo">
            Ver Todos
          </a>
        </div>
        <div className="grid grid-cols-4 gap-2 pt-1">
          {stamps.map((s) => {
            const Icon = ICON_MAP[s.icon];
            return (
              <div key={s.name} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#F9F3EB] border-2 border-espresso-ink relative group">
                <div className={`w-12 h-12 rounded-full border-2 border-dashed border-espresso-ink ${s.bg} ${s.border.replace('border-', 'border-')} flex items-center justify-center ${s.text} rotate-6 group-hover:rotate-0 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-[family-name:var(--font-space-grotesk)] text-[9px] uppercase font-bold text-espresso-ink text-center leading-tight truncate w-full">
                  {s.name}
                </span>
                <span className={`text-[8px] font-[family-name:var(--font-space-grotesk)] font-bold ${s.text === 'text-espresso-ink/50' ? 'text-espresso-ink/40' : 'text-[#524437]'} font-bold`}>
                  {s.date}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FFD1B5]/60 border border-espresso-ink">
          <Lightbulb className="w-5 h-5 text-espresso-ink shrink-0" />
          <p className="font-[family-name:var(--font-dm-sans)] text-[12px] text-espresso-ink leading-tight">
            <strong className="font-bold">Tip de Altura:</strong> {altitudeTip}
          </p>
        </div>
      </div>
    );
  }

  // Desktop variant - Vertical stack for sidebar
  return (
    <aside className="bg-[#FFFFFF] p-4 lg:p-5 rounded-xl border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] flex flex-col space-y-4 sticky top-24 lg:top-28">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#E59840] rounded-lg border-2 border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A]">
            <Award className="w-5 h-5 text-espresso-ink" />
          </div>
          <div>
            <h4 className="font-[family-name:var(--font-space-grotesk)] text-[15px] uppercase text-espresso-ink">
              Pasaporte Cafetero
            </h4>
            <span className="font-[family-name:var(--font-dm-sans)] text-[11px] text-[#524437]">
              {completedStamps} / {totalStamps} sellos
            </span>
          </div>
        </div>
        <a href="/duo" className="font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold text-[#984628] underline uppercase hover:text-[#E59840] transition-colors self-end">
          Ver completo →
        </a>
      </div>

      <div className="flex items-center gap-4 p-3 bg-[#F9F3EB] rounded-lg border-2 border-espresso-ink">
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
          <svg width="64" height="64" className="transform -rotate-90">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#EDE7DF" strokeWidth="6" className="brutal-border" />
            <circle cx="32" cy="32" r="28" fill="none" stroke="#6B8E4E" strokeWidth="6" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 - (progress / 100) * 2 * Math.PI * 28} strokeLinecap="round" style={{ filter: 'drop-shadow(1px 1px 0px #1A0F0A)' }} />
          </svg>
          <span className="absolute font-[family-name:var(--font-space-grotesk)] text-[16px] font-black text-espresso-ink">
            {progress}%
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-[family-name:var(--font-space-grotesk)] text-[11px] uppercase text-espresso-ink font-bold">
            Próxima recompensa
          </p>
          <p className="font-[family-name:var(--font-dm-sans)] text-[12px] text-espresso-ink font-medium">
            {nextReward}
          </p>
          <div className="w-full h-2 bg-[#EDE7DF] rounded-full border border-espresso-ink mt-2 overflow-hidden">
            <div className="h-full bg-[#6B8E4E] rounded-full border-r border-espresso-ink transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="font-[family-name:var(--font-dm-sans)] text-[10px] text-[#524437] mt-1">
            Falta {totalStamps - completedStamps} sello{totalStamps - completedStamps !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {stamps.map((s, i) => {
          const Icon = ICON_MAP[s.icon];
          return (
            <div key={s.name} className="flex items-center gap-3 p-2 rounded-lg bg-[#F9F3EB] border-2 border-espresso-ink group relative">
              <div className={`w-12 h-12 rounded-full border-2 border-dashed border-espresso-ink ${s.bg} ${s.border} flex items-center justify-center ${s.text} transition-transform duration-300`} style={{ transform: `rotate(${s.rotation}deg)` }}>
                <Icon className={`w-5 h-5 ${s.fill ? '' : 'opacity-50'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] uppercase font-bold text-espresso-ink truncate block">
                  {s.name}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[9px] font-[family-name:var(--font-space-grotesk)] font-bold ${s.text === 'text-espresso-ink/50' ? 'text-espresso-ink/40' : s.text}`}>
                    {s.date}
                  </span>
                  {s.neighborhood && s.neighborhood !== '?' && (
                    <span className="text-[9px] font-[family-name:var(--font-dm-sans)] text-[#524437] flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      {s.neighborhood}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <RotateCcw className="w-4 h-4 text-espresso-ink/40" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FFD1B5]/60 border border-espresso-ink">
        <div className="p-1.5 bg-espresso-ink rounded border border-espresso-ink shrink-0">
          <Lightbulb className="w-4 h-4 text-[#FFDE59]" />
        </div>
        <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-espresso-ink leading-tight">
          <strong className="font-bold">Tip de Altura:</strong> {altitudeTip}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-espresso-ink">
        <Link href="/duo" className="py-2.5 px-3 bg-[#E59840] text-[#FFFFFF] brutal-border rounded-lg shadow-[2px_2px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase text-center active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all hover:shadow-[3px_3px_0px_0px_#1A0F0A]">
          Ver Pasaporte
        </Link>
        <Link href="/matcher" className="py-2.5 px-3 bg-[#FFFFFF] text-espresso-ink brutal-border rounded-lg shadow-[2px_2px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase text-center active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all hover:bg-[#F3EDE5] hover:shadow-[3px_3px_0px_0px_#1A0F0A]">
          CofiMatcher
        </Link>
      </div>
    </aside>
  );
}