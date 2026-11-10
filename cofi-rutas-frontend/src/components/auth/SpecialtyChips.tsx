import React from 'react';
import { Coffee } from 'lucide-react';
import type { CoffeeSpecialty, SpecialtyChipsProps } from '../../types/auth';

const SPECIALTIES: readonly CoffeeSpecialty[] = ['Submarino', 'V60 Altura', 'Mocaccino'] as const;

export const SpecialtyChips: React.FC<SpecialtyChipsProps> = ({
  selectedSpecialty,
  onSelectSpecialty,
}) => {
  return (
    <div className="flex flex-col gap-1.5 p-3 bg-surface-container border-[2px] border-espresso-ink rounded-lg w-full">
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase tracking-wider text-espresso-ink flex items-center gap-1.5">
          <Coffee className="w-3.5 h-3.5 text-espresso-ink" strokeWidth={2.5} />
          <span>Tu especialidad preferida:</span>
        </span>
        <span className="font-[family-name:var(--font-space-grotesk)] text-[10px] text-badge-matcha font-bold uppercase tracking-wider">
          Oruro Barista Choice
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {SPECIALTIES.map((item) => {
          const isSelected = selectedSpecialty === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelectSpecialty(item)}
              className={`py-1 px-2 text-center rounded border-[2px] border-espresso-ink text-[11px] font-[family-name:var(--font-space-grotesk)] font-bold uppercase transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary-container text-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A]'
                  : 'bg-surface-card text-espresso-ink hover:bg-surface-container-high'
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
};
