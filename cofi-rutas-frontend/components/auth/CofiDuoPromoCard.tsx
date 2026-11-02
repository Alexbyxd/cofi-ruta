import React from 'react';
import type { CofiDuoPromoCardProps } from '../../types/auth';

export const CofiDuoPromoCard: React.FC<CofiDuoPromoCardProps> = () => {
  return (
    <aside
      aria-label="Promoción CofiDúo"
      className="relative p-4 rounded-lg bg-secondary-container border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] flex flex-col gap-2 overflow-hidden w-full"
    >
      {/* Decorative background accent stamp */}
      <div
        aria-hidden="true"
        className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full border-[3px] border-espresso-ink/15 flex items-center justify-center select-none pointer-events-none rotate-12"
      >
        <span className="material-symbols-outlined text-[36px] text-espresso-ink/20">
          favorite
        </span>
      </div>

      {/* Card Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-tertiary-container border-[2px] border-espresso-ink flex items-center justify-center text-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A]">
          <span className="material-symbols-outlined text-[18px]">favorite</span>
        </div>
        <div className="flex flex-col">
          <span className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase text-espresso-ink leading-tight">
            ¿Vienes en pareja o con amig@?
          </span>
          <span className="font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold text-on-secondary-container tracking-wider uppercase">
            Modo CofiDúo Activo
          </span>
        </div>
      </div>

      {/* Card Body */}
      <p className="font-[family-name:var(--font-dm-sans)] text-xs text-espresso-ink font-medium leading-relaxed">
        Al registrarte podrás vincular tu cuenta a{' '}
        <strong className="font-bold underline decoration-tertiary">CofiDúo</strong> y
        desbloquear el Pasaporte Compartido, sellos de visita y el recomendador de citas
        con café.
      </p>

      {/* Perks Badges */}
      <div className="flex items-center gap-2 mt-1">
        <span className="inline-flex items-center gap-1 font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold uppercase bg-surface-card border-[2px] border-espresso-ink px-2 py-0.5 rounded shadow-[1px_1px_0px_0px_#1A0F0A] text-espresso-ink">
          <span className="material-symbols-outlined text-[13px] text-tertiary">loyalty</span>
          2x1 Sellos
        </span>
        <span className="inline-flex items-center gap-1 font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold uppercase bg-surface-card border-[2px] border-espresso-ink px-2 py-0.5 rounded shadow-[1px_1px_0px_0px_#1A0F0A] text-espresso-ink">
          <span className="material-symbols-outlined text-[13px] text-tertiary">map</span>
          Rutas Oruro Frío
        </span>
      </div>
    </aside>
  );
};
