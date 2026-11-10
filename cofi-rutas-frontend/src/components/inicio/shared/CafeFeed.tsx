'use client';

import React, { useCallback, useState } from 'react';
import type { CoffeeShopWithProducts } from '@/types/cafes';
import Link from 'next/link';
import { Star, MapPin, Heart as HeartIcon, ExternalLink } from 'lucide-react';

type Variant = 'mobile' | 'desktop';

interface DesktopCafeCardProps {
  cafe: CoffeeShopWithProducts;
}

function DesktopCafeCard({ cafe }: DesktopCafeCardProps) {
  return (
    <Link href={`/cafe/${cafe.slug}`} className="group block">
      <article className="bg-surface-card brutal-border rounded-xl shadow-[4px_4px_0px_0px_#1A0F0A] overflow-hidden transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none hover:shadow-[6px_6px_0px_0px_#1A0F0A] hover:-translate-y-0.5 hover:-translate-x-0.5 h-full flex flex-col">
        <div className="relative h-56 bg-surface-container overflow-hidden">
          {cafe.imageUrl ? (
            <img src={cafe.imageUrl} alt={`Fachada de ${cafe.name}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-espresso-ink/40 font-[family-name:var(--font-space-grotesk)] font-bold text-2xl uppercase">
              ☕
            </div>
          )}

          <div className="absolute -top-3 -right-3 flex items-center gap-1 px-2.5 py-1 bg-[#FFDE59] brutal-border rounded-full shadow-[2px_2px_0px_0px_#1A0F0A]">
            <Star className="w-3 h-3 text-espresso-ink fill-current" />
            <span className="font-[family-name:var(--font-space-grotesk)] text-xs font-bold text-espresso-ink uppercase tracking-tight">
              {cafe.rating ?? '4.9'} ({cafe.reviewCount ?? 0})
            </span>
          </div>

          <div className="absolute top-3 left-3 px-2.5 py-1.5 rounded border-2 border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A]">
            <span className={`font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold uppercase tracking-tighter ${
              cafe.isOpen ? 'bg-[#7AE582] text-espresso-ink' : 'bg-[#DFD9D2] text-espresso-ink/50'
            }`}>
              {cafe.isOpen ? 'ABIERTO' : 'CERRADO'}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="flex-1 py-2 px-3 bg-[#FFFFFF] text-espresso-ink brutal-border rounded-lg shadow-[2px_2px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase flex items-center justify-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Mapa
            </button>
            <button className="flex-1 py-2 px-3 bg-[#E59840] text-[#FFFFFF] brutal-border rounded-lg shadow-[2px_2px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase flex items-center justify-center gap-1.5">
              <HeartIcon className="w-3.5 h-3.5" />
              Guardar
            </button>
            <button className="w-12 py-2 px-2 bg-[#F48E6A] text-[#FFFFFF] brutal-border rounded-lg shadow-[2px_2px_0px_0px_#1A0F0A] flex items-center justify-center">
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-black uppercase text-espresso-ink tracking-tight leading-tight mb-2 group-hover:text-[#E59840] transition-colors">
            {cafe.name}
          </h3>

          {cafe.neighborhood && (
            <p className="text-sm font-[family-name:var(--font-dm-sans)] text-on-surface-variant font-medium mb-3 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {cafe.neighborhood}
              {cafe.distanceMeters ? ` · ${cafe.distanceMeters} m` : ''}
            </p>
          )}

          {cafe.products?.length && (
            <div className="mt-auto flex flex-wrap gap-2 mb-3">
              {cafe.products.slice(0, 3).map((product) => (
                <span key={product.id} className="px-2.5 py-1 bg-[#FFFDF5] brutal-border rounded shadow-[2px_2px_0px_0px_#1A0F0A] text-[11px] font-[family-name:var(--font-space-grotesk)] font-bold text-espresso-ink uppercase tracking-tighter">
                  {product.name} [{product.price} {product.currency || 'Bs'}]
                </span>
              ))}
              {cafe.products.length > 3 && (
                <span className="px-2.5 py-1 bg-[#F3EDE5] brutal-border rounded shadow-[2px_2px_0px_0px_#1A0F0A] text-[11px] font-[family-name:var(--font-space-grotesk)] font-bold text-espresso-ink/70 uppercase tracking-tighter">
                  +{cafe.products.length - 3} más
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t-2 border-espresso-ink mt-auto">
            <div className="flex items-center gap-2 text-[11px] font-[family-name:var(--font-dm-sans)] text-on-surface-variant">
              {cafe.distanceMeters && (
                <span className="flex items-center gap-1 bg-[#EDE7DF] px-2 py-1 rounded border border-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A]">
                  <MapPin className="w-3 h-3" />
                  {cafe.distanceMeters}m
                </span>
              )}
            </div>
            <span className="text-[10px] font-[family-name:var(--font-space-grotesk)] text-espresso-ink/50 uppercase tracking-wider">
              Ver detalles →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function MobileCafeCard({ cafe }: { cafe: CoffeeShopWithProducts }) {
  return (
    <Link href={`/cafe/${cafe.slug}`} className="group block">
      <article className="bg-surface-card brutal-border rounded-lg shadow-[4px_4px_0px_0px_#1A0F0A] overflow-hidden transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
        <div className="relative h-48 bg-surface-container overflow-hidden">
          {cafe.imageUrl ? (
            <img src={cafe.imageUrl} alt={`Fachada de ${cafe.name}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-espresso-ink/40 font-[family-name:var(--font-space-grotesk)] font-bold text-lg uppercase">
              ☕
            </div>
          )}

          <div className="absolute -top-3 -right-3 flex items-center gap-1 px-2 py-1 bg-[#FFDE59] brutal-border rounded-full shadow-[2px_2px_0px_0px_#1A0F0A]">
            <span className="font-[family-name:var(--font-space-grotesk)] text-xs font-bold text-espresso-ink uppercase tracking-tight">
              ★ {cafe.reviewCount ? cafe.reviewCount : '0'} reseñas
            </span>
          </div>

          <div className="absolute top-3 left-3 px-2 py-1.5 ${
            cafe.isOpen ? 'bg-[#7AE582]' : 'bg-surface-dim'
          } brutal-border rounded shadow-[2px_2px_0px_0px_#1A0F0A]">
            <span className="font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold text-espresso-ink uppercase tracking-tighter">
              {cafe.isOpen ? 'ABIERTO' : 'CERRADO'}
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg sm:text-xl font-black uppercase text-espresso-ink tracking-tight leading-tight">
            {cafe.name}
          </h3>

          {cafe.neighborhood && (
            <p className="text-xs sm:text-sm font-[family-name:var(--font-dm-sans)] text-on-surface-variant font-medium mt-0.5">
              {cafe.neighborhood}
              {cafe.distanceMeters ? ` • ${cafe.distanceMeters} m` : ''}
            </p>
          )}

          {cafe.products?.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {cafe.products.slice(0, 3).map((product) => (
                <span key={product.id} className="px-2 py-1 bg-[#FFFDF5] brutal-border rounded shadow-[2px_2px_0px_0px_#1A0F0A] text-[10px] sm:text-xs font-[family-name:var(--font-space-grotesk)] font-bold text-espresso-ink uppercase tracking-tighter">
                  {product.name} [{product.price} {product.currency || 'Bs'}]
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

interface CafeFeedProps {
  variant: Variant;
  cafes: CoffeeShopWithProducts[];
  loading?: boolean;
  emptyMessage?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function CafeFeed({ variant, cafes, loading = false, emptyMessage = 'No se encontraron cafeterías con esos filtros. Probá otro antojo.', onLoadMore, hasMore = false }: CafeFeedProps) {
  const [displayCount, setDisplayCount] = useState(8);
  const LOAD_MORE_INCREMENT = 4;

  const handleLoadMore = useCallback(() => {
    setDisplayCount(prev => prev + LOAD_MORE_INCREMENT);
    onLoadMore?.();
  }, [onLoadMore]);

  const visibleCafes = cafes.slice(0, displayCount);

  if (loading && cafes.length === 0) {
    const skeletonCount = variant === 'mobile' ? 4 : 6;
    return (
      <div className={`grid gap-4 ${variant === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className={`bg-surface-card brutal-border ${variant === 'mobile' ? 'rounded-lg' : 'rounded-xl'} shadow-[4px_4px_0px_0px_#1A0F0A] h-80 animate-pulse`} />
        ))}
      </div>
    );
  }

  if (visibleCafes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className={`w-16 h-16 bg-surface-card brutal-border rounded-full shadow-[4px_4px_0px_0px_#1A0F0A] flex items-center justify-center text-3xl mb-3 ${variant === 'desktop' ? 'w-20 h-20 text-4xl' : ''}`}>
          ☕
        </div>
        <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-black uppercase text-espresso-ink tracking-tight">
          Todavía no hay cafeterías
        </h3>
        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-on-surface-variant mt-1 max-w-xs">
          {emptyMessage}
        </p>
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <section className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-6 pb-12">
          {visibleCafes.map((cafe) => (
            <MobileCafeCard key={cafe.id} cafe={cafe} />
          ))}
        </div>
        {(hasMore || visibleCafes.length < cafes.length) && (
          <div className="text-center pt-4">
            <button onClick={handleLoadMore} disabled={loading} className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFFFFF] text-espresso-ink brutal-border rounded-lg shadow-[3px_3px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[14px] font-bold uppercase tracking-wider active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:shadow-[4px_4px_0px_0px_#1A0F0A] hover:bg-[#F3EDE5] disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  Cargando más...
                </>
              ) : (
                <>
                  Cargar más cafeterías
                  <span className="text-[10px] text-espresso-ink/60"> ({cafes.length - visibleCafes.length} restantes) </span>
                </>
              )}
            </button>
          </div>
        )}
      </section>
    );
  }

  // Desktop variant
  return (
    <section className="w-full space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {visibleCafes.map((cafe) => (
          <DesktopCafeCard key={cafe.id} cafe={cafe} />
        ))}
      </div>

      {(hasMore || visibleCafes.length < cafes.length) && (
        <div className="text-center pt-4">
          <button onClick={handleLoadMore} disabled={loading} className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFFFFF] text-espresso-ink brutal-border rounded-lg shadow-[3px_3px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[14px] font-bold uppercase tracking-wider active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:shadow-[4px_4px_0px_0px_#1A0F0A] hover:bg-[#F3EDE5] disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                Cargando más...
              </>
            ) : (
              <>
                Cargar más cafeterías
                <span className="text-[10px] text-espresso-ink/60"> ({cafes.length - visibleCafes.length} restantes) </span>
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}