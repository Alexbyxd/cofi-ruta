'use client';

/**
 * Mini actividad comunitaria: parejas explorando cafeterías ahora mismo en Oruro.
 */
export function ComunidadEnVivo() {
  return (
    <div className="p-3 bg-[#EDE7DF] rounded-lg border-2 border-espresso-ink flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-2.5 h-2.5 rounded-full bg-[#6B8E4E] shrink-0 animate-pulse" />
        <p className="font-[family-name:var(--font-dm-sans)] text-[12px] text-espresso-ink truncate">
          <strong className="font-bold">18 parejas</strong> están explorando cafeterías ahora mismo en el centro de Oruro.
        </p>
      </div>
      <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] uppercase bg-[#FFFFFF] px-2 py-0.5 rounded border border-espresso-ink shrink-0 font-bold text-espresso-ink">
        En Vivo
      </span>
    </div>
  );
}
