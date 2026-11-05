'use client';

import { Flame, Navigation, Wifi, Thermometer, Pin, Bookmark, MapPin, Star, Heart as HeartIcon, Share2 } from 'lucide-react';
import Link from 'next/link';

type Variant = 'mobile' | 'desktop';

interface CafeForAntojo {
  id: string;
  name: string;
  slug: string;
  neighborhood?: string | null;
  rating?: string | null;
  reviewCount?: number;
  distanceMeters?: number | null;
  imageUrl?: string | null;
  products?: Array<{ id: string; name: string; price: string; currency?: string | null }>;
  isOpen?: boolean;
}

interface AntojoDelDiaProps {
  variant: Variant;
  cafe: CafeForAntojo;
}

export function AntojoDelDia({ variant, cafe }: AntojoDelDiaProps) {
  const price = cafe.products?.[0];

  if (variant === 'mobile') {
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
        <Link href={`/cafe/${cafe.slug}`} className="group block">
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
                <Flame className="w-3 h-3" /> Tendencia de Invierno
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
                  <Navigation className="w-3 h-3" />
                  A {cafe.distanceMeters ?? 350}m de ti
                </div>
                <div className="flex items-center gap-1 font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold bg-[#EDE7DF] px-2 py-1 rounded border border-espresso-ink">
                  <Wifi className="w-3 h-3" /> Wifi Rápido
                </div>
                <div className="flex items-center gap-1 font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold bg-[#EDE7DF] px-2 py-1 rounded border border-espresso-ink">
                  <Thermometer className="w-3 h-3" /> Calefacción
                </div>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <button className="flex-1 py-2.5 px-3 bg-[#E59840] text-[#FFFFFF] rounded-lg border-2 border-espresso-ink shadow-[3px_3px_0px_0px_#1A0F0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all font-[family-name:var(--font-space-grotesk)] text-[16px] uppercase text-center flex items-center justify-center gap-1.5 cursor-pointer">
                  <Pin className="w-4 h-4" />
                  Ver en el Mapa
                </button>
                <button className="p-2.5 bg-[#F3EDE5] rounded-lg border-2 border-espresso-ink shadow-[3px_3px_0px_0px_#1A0F0A] text-espresso-ink active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center cursor-pointer">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Desktop variant - Horizontal 40/60 layout
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-space-grotesk)] text-[14px] uppercase text-espresso-ink font-bold tracking-wider">
          Antojo del Día en Oruro
        </h3>
        <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] text-[#984628] font-bold flex items-center gap-0.5">
          <Flame className="w-3 h-3" /> Top Elección
        </span>
      </div>
      <Link href={`/cafe/${cafe.slug}`} className="group block">
        <article className="bg-[#FFFFFF] rounded-xl border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] overflow-hidden flex flex-col lg:flex-row transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#1A0F0A] hover:shadow-[6px_6px_0px_0px_#1A0F0A] hover:-translate-y-0.5 hover:-translate-x-0.5">
          {/* LEFT: Image - 40% */}
          <div className="relative lg:w-2/5 min-h-[280px] bg-[#F3EDE5] border-r-[3px] border-espresso-ink flex-shrink-0">
            {cafe.imageUrl ? (
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={cafe.name} src={cafe.imageUrl} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#F3EDE5] text-espresso-ink/40 font-[family-name:var(--font-space-grotesk)] font-bold text-2xl uppercase">
                ☕
              </div>
            )}

            <div className="absolute top-4 left-4 bg-[#6B8E4E] text-[#FFFFFF] px-3 py-1.5 rounded border-2 border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A] -rotate-2 font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Tendencia de Invierno
            </div>

            <div className="absolute bottom-4 right-4 bg-[#E59840] text-espresso-ink px-3 py-1.5 rounded border-2 border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[18px] font-bold">
              {price ? price.price + ' Bs.' : '18 Bs.'}
            </div>

            <div className="absolute top-4 right-4 px-2.5 py-1.5 rounded border-2 border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A]">
              <span className={`font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold uppercase tracking-tighter ${
                cafe.isOpen ? 'bg-[#7AE582] text-espresso-ink' : 'bg-[#DFD9D2] text-espresso-ink/50'
              }`}>
                {cafe.isOpen ? 'ABIERTO' : 'CERRADO'}
              </span>
            </div>

            <div className="absolute -top-3 -right-3 flex items-center gap-1 px-2.5 py-1 bg-[#FFDE59] brutal-border rounded-full shadow-[2px_2px_0px_0px_#1A0F0A]">
              <Star className="w-3 h-3 text-espresso-ink fill-current" />
              <span className="font-[family-name:var(--font-space-grotesk)] text-xs font-bold text-espresso-ink uppercase tracking-tight">
                {cafe.rating ?? '4.9'} ({cafe.reviewCount ?? 0})
              </span>
            </div>
          </div>

          {/* RIGHT: Details - 60% */}
          <div className="lg:w-3/5 flex flex-col p-5 lg:p-6 justify-between min-w-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] uppercase text-[#984628] font-bold tracking-wider">
                  {cafe.name} • {cafe.neighborhood}
                </span>
                <div className="flex items-center text-espresso-ink gap-0.5 font-[family-name:var(--font-space-grotesk)] text-[12px]">
                  <span className="font-bold">{cafe.rating ?? '4.9'}</span>
                  <span className="text-[#524437] font-normal">({cafe.reviewCount ?? 0} reseñas)</span>
                  {cafe.distanceMeters && (
                    <>
                      <span className="text-[#524437]">·</span>
                      <span className="flex items-center gap-1 font-[family-name:var(--font-dm-sans)] text-[11px]">
                        <MapPin className="w-3 h-3" />
                        {cafe.distanceMeters} m
                      </span>
                    </>
                  )}
                </div>
              </div>

              <h4 className="font-[family-name:var(--font-space-grotesk)] text-[24px] lg:text-[28px] text-espresso-ink uppercase leading-snug tracking-tight">
                {price ? price.name : 'Submarino Tradicional'} con 3 Churros
              </h4>

              <p className="font-[family-name:var(--font-dm-sans)] text-[15px] text-[#524437] leading-relaxed">
                Barra artesanal de chocolate de los Yungas fundida en leche caliente espumada con toque de clavo de olor.
                Acompañado de churros crujientes rellenos de dulce de leche.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <div className="flex items-center gap-1.5 font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold bg-[#EDE7DF] px-3 py-1.5 rounded border border-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A]">
                  <Navigation className="w-3.5 h-3.5" />
                  A {cafe.distanceMeters ?? 350}m de ti
                </div>
                <div className="flex items-center gap-1.5 font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold bg-[#EDE7DF] px-3 py-1.5 rounded border border-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A]">
                  <Wifi className="w-3.5 h-3.5" />
                  Wifi Rápido
                </div>
                <div className="flex items-center gap-1.5 font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold bg-[#EDE7DF] px-3 py-1.5 rounded border border-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A]">
                  <Thermometer className="w-3.5 h-3.5" />
                  Calefacción
                </div>
                <div className="flex items-center gap-1.5 font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold bg-[#EDE7DF] px-3 py-1.5 rounded border border-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A]">
                  <HeartIcon className="w-3.5 h-3.5" />
                  Pet Friendly
                </div>
              </div>
            </div>

            <div className="pt-3 lg:pt-6 flex flex-col sm:flex-row items-stretch gap-3">
              <button className="flex-1 py-3.5 px-4 bg-[#E59840] text-[#FFFFFF] rounded-lg border-2 border-espresso-ink shadow-[3px_3px_0px_0px_#1A0F0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all font-[family-name:var(--font-space-grotesk)] text-[16px] uppercase text-center flex items-center justify-center gap-2 cursor-pointer hover:shadow-[4px_4px_0px_0px_#1A0F0A] hover:-translate-y-0.5">
                <Pin className="w-5 h-5" />
                Ver en el Mapa
              </button>
              <button className="flex-1 sm:w-auto py-3.5 px-4 bg-[#F3EDE5] text-espresso-ink rounded-lg border-2 border-espresso-ink shadow-[3px_3px_0px_0px_#1A0F0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center cursor-pointer hover:bg-[#EDE7DF] hover:shadow-[4px_4px_0px_0px_#1A0F0A] hover:-translate-y-0.5">
                <Bookmark className="w-6 h-6" />
                <span className="sr-only">Guardar</span>
              </button>
              <button className="flex-1 sm:w-auto py-3.5 px-4 bg-[#FFFFFF] text-espresso-ink rounded-lg border-2 border-espresso-ink shadow-[3px_3px_0px_0px_#1A0F0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-[#F3EDE5] hover:shadow-[4px_4px_0px_0px_#1A0F0A] hover:-translate-y-0.5">
                <span className="font-[family-name:var(--font-space-grotesk)] text-[14px] uppercase">Compartir</span>
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </article>
      </Link>
    </section>
  );
}