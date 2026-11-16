'use client';

import React from 'react';
import Link from 'next/link';
import type { CoffeeShopWithProducts } from '@/types/cafes';

export interface CafeCardProps {
  cafe: CoffeeShopWithProducts;
}

/**
 * Card de cafetería neobrutalista.
 * Fondo blanco, borde 3px negro, sombra 4px duro, radius 8px.
 * Badge de rating flotante amarillo, nombre en Space Grotesk, precios en recuadros.
 */
export function CafeCard({ cafe }: CafeCardProps) {
  return (
    <Link
      href={`/cafe/${cafe.slug}`}
      className="group block"
    >
      <article
        className="bg-surface-card brutal-border rounded-lg shadow-[4px_4px_0px_0px_#1A0F0A] overflow-hidden transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
      >
        {/* Imagen / header del local */}
        <div className="relative h-48 bg-surface-container overflow-hidden">
          {cafe.imageUrl ? (
            <img
              src={cafe.imageUrl}
              alt={`Fachada de ${cafe.name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-espresso-ink/40 font-[family-name:var(--font-space-grotesk)] font-bold text-lg uppercase">
              ☕
            </div>
          )}

          {/* Badge de rating flotante */}
          <div className="absolute -top-3 -right-3 flex items-center gap-1 px-2 py-1 bg-[#FFDE59] brutal-border rounded-full shadow-[2px_2px_0px_0px_#1A0F0A]">
            <span className="font-[family-name:var(--font-space-grotesk)] text-xs font-bold text-espresso-ink uppercase tracking-tight">
              ★ {cafe.reviewCount ? cafe.reviewCount : '0'} reseñas
            </span>
          </div>

          {/* Badge de abierto/cerrado */}
          <div className="absolute top-3 left-3 px-2 py-1.5 ${
            cafe.isOpen ? 'bg-[#7AE582]' : 'bg-surface-dim'
          } brutal-border rounded shadow-[2px_2px_0px_0px_#1A0F0A]">
            <span className="font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold text-espresso-ink uppercase tracking-tighter">
              {cafe.isOpen ? 'ABIERTO' : 'CERRADO'}
            </span>
          </div>
        </div>

        {/* Cuerpo de la card */}
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

          {/* Precios destacados */}
          {cafe.products?.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {cafe.products.slice(0, 3).map((product) => (
                <span
                  key={product.id}
                  className="px-2 py-1 bg-[#FFFDF5] brutal-border rounded shadow-[2px_2px_0px_0px_#1A0F0A] text-[10px] sm:text-xs font-[family-name:var(--font-space-grotesk)] font-bold text-espresso-ink uppercase tracking-tighter"
                >
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
