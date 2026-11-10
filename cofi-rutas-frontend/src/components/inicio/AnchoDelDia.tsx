'use client';

import { Flame, Navigation, Wifi, Thermometer, Pin, Bookmark } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  whatshot: Flame,
  navigation: Navigation,
  wifi: Wifi,
  nest_heat_link_gen_3: Thermometer,
  pin_drop: Pin,
  bookmark: Bookmark,
};

/**
 * Antojo del Día: tarjeta destacada con el primer café del feed.
 * Imagen, nombre, rating, precio y botones "Ver en el Mapa" / bookmark.
 */
export function AnchoDelDia({ cafe }: { cafe: { name: string; neighborhood?: string | null; rating?: string | null; reviewCount?: number; distanceMeters?: number | null; imageUrl?: string | null; products?: Array<{ id: string; name: string; price: string; currency?: string | null }> } }) {
  const price = cafe.products?.[0];
  const IconFill = ICON_MAP['whatshot'];
  const IconNav = ICON_MAP['navigation'];
  const IconWifi = ICON_MAP['wifi'];
  const IconHeat = ICON_MAP['nest_heat_link_gen_3'];
  const IconPin = ICON_MAP['pin_drop'];
  const IconBookmark = ICON_MAP['bookmark'];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] uppercase text-espresso-ink font-bold tracking-wider">
          Antojo del Día en Oruro
        </span>
        <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] text-[#984628] font-bold flex items-center gap-0.5">
          <Flame className="w-3 h-3" /> Top Elección
        </span>
      </div>
      <div className="bg-[#FFFFFF] rounded-xl border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] overflow-hidden flex flex-col">
        <div className="relative w-full h-44 border-b-[3px] border-espresso-ink bg-[#F3EDE5]">
          {cafe.imageUrl ? (
            <img className="w-full h-full object-cover" alt={cafe.name} src={cafe.imageUrl} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F3EDE5] text-espresso-ink/40 font-[family-name:var(--font-space-grotesk)] font-bold text-lg uppercase">
              ☕
            </div>
          )}
          <div className="absolute top-3 left-3 bg-[#6B8E4E] text-[#FFFFFF] px-2.5 py-1 rounded border-2 border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A] -rotate-2 font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold uppercase flex items-center gap-1">
            <IconFill className="w-3 h-3" /> Tendencia de Invierno
          </div>
          <div className="absolute bottom-3 right-3 bg-[#E59840] text-espresso-ink px-2.5 py-1 rounded border-2 border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[16px]">
            {price ? price.price + ' Bs.' : '18 Bs.'}
          </div>
        </div>
        <div className="p-4 flex flex-col space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] uppercase text-[#984628] font-bold tracking-wider">
              {cafe.name} • {cafe.neighborhood}
            </span>
            <div className="flex items-center text-espresso-ink gap-0.5 font-[family-name:var(--font-space-grotesk)] text-[12px]">
              <span className="font-bold">{cafe.rating ?? '4.9'}</span>
              <span className="text-[#524437] font-normal">({cafe.reviewCount ?? 0})</span>
            </div>
          </div>
          <h3 className="font-[family-name:var(--font-space-grotesk)] text-[20px] text-espresso-ink uppercase leading-snug">
            {price ? price.name : 'Submarino Tradicional'} con 3 Churros
          </h3>
          <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[#524437]">
            Barra artesanal de chocolate de los Yungas fundida en leche caliente espumada con toque de clavo de olor.
          </p>
          <div className="flex items-center gap-3 pt-1 text-espresso-ink">
            <div className="flex items-center gap-1 font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold bg-[#EDE7DF] px-2 py-1 rounded border border-espresso-ink">
              <IconNav className="w-3 h-3" />
              A {cafe.distanceMeters ?? 350}m de ti
            </div>
            <div className="flex items-center gap-1 font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold bg-[#EDE7DF] px-2 py-1 rounded border border-espresso-ink">
              <IconWifi className="w-3 h-3" /> Wifi Rápido
            </div>
            <div className="flex items-center gap-1 font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold bg-[#EDE7DF] px-2 py-1 rounded border border-espresso-ink">
              <IconHeat className="w-3 h-3" /> Calefacción
            </div>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <button className="flex-1 py-2.5 px-3 bg-[#E59840] text-[#FFFFFF] rounded-lg border-2 border-espresso-ink shadow-[3px_3px_0px_0px_#1A0F0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all font-[family-name:var(--font-space-grotesk)] text-[16px] uppercase text-center flex items-center justify-center gap-1.5 cursor-pointer">
              <IconPin className="w-4 h-4" />
              Ver en el Mapa
            </button>
            <button className="p-2.5 bg-[#F3EDE5] rounded-lg border-2 border-espresso-ink shadow-[3px_3px_0px_0px_#1A0F0A] text-espresso-ink active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center cursor-pointer">
              <IconBookmark className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
