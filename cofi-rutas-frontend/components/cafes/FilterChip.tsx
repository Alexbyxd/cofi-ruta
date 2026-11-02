'use client';

import React from 'react';
import type { CafeFilterChip } from '@/types/cafes';

export interface FilterChipProps {
  chip: CafeFilterChip;
  active: boolean;
  onSelect: (value: string) => void;
}

/**
 * Filtro píldora neobrutalista.
 * Activo: fondo de color del chip. Inactivo: fondo blanco con borde negro 2px.
 */
export function FilterChip({
  chip,
  active,
  onSelect,
}: FilterChipProps) {
  const bgColor =
    chip.color === 'amber' ? 'bg-[#FFDE59]' :
    chip.color === 'cyan' ? 'bg-[#70D6FF]' :
    chip.color === 'pink' ? 'bg-[#FF85A1]' :
    'bg-white';

  const textColor = chip.color === 'white' ? 'text-espresso-ink' : 'text-espresso-ink font-bold';

  return (
    <button
      type="button"
      onClick={() => onSelect(chip.value)}
      className={`px-3 py-1.5 brutal-border rounded-full shadow-[2px_2px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
        active ? `${bgColor} ${textColor}` : 'text-espresso-ink/80 hover:bg-surface-container-low'
      }`}
    >
      {chip.label}
    </button>
  );
}
