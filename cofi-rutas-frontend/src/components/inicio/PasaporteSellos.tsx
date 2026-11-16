'use client';

import { Award, CheckCircle, Bookmark, Lightbulb } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  loyalty: Award,
  check_circle: CheckCircle,
  add: Bookmark,
  tips_and_updates: Lightbulb,
};

const STAMPS = [
  { name: 'Kory Café', date: '14 Oct', bg: 'bg-[#6B8E4E]/20', border: 'border-[#6B8E4E]', text: 'text-[#6B8E4E]', icon: 'check_circle', fill: true },
  { name: 'El Pagador', date: '22 Oct', bg: 'bg-[#F48E6A]/30', border: 'border-[#F48E6A]', text: 'text-[#984628]', icon: 'check_circle', fill: true },
  { name: 'Chocolatería', date: 'Ayer', bg: 'bg-[#E59840]/30', border: 'border-[#E59840]', text: 'text-[#8a5100]', icon: 'check_circle', fill: true },
  { name: 'Siguiente', date: 'Pendiente', bg: 'bg-[#FFFFFF]', border: 'border-espresso-ink/40', text: 'text-espresso-ink/50', icon: 'add', fill: false },
];

/**
 * Pasaporte Cafetero en Curso: vista previa de sellos recientes del dúo.
 * Cuatro sellos circulares (tres visitados, uno pendiente) y un tip de altura.
 */
export function PasaporteSellos() {
  return (
    <div className="bg-[#FFFFFF] p-4 rounded-xl border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#984628]" />
          <h4 className="font-[family-name:var(--font-space-grotesk)] text-[16px] uppercase text-espresso-ink">
            Sellos Recientes del Dúo
          </h4>
        </div>
        <a className="font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold text-[#984628] underline uppercase" href="#">
          Ver Todos
        </a>
      </div>
      <div className="grid grid-cols-4 gap-2 pt-1">
        {STAMPS.map((s) => {
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
          <strong className="font-bold">Tip de Altura:</strong> Pide tu café con granos de Caranavi con tostado medio para mantener la calidez corporal sin elevar tu presión.
        </p>
      </div>
    </div>
  );
}
