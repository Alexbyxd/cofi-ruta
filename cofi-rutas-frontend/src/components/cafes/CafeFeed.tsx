'use client';

import React, { useCallback } from 'react';
import type { CoffeeShopWithProducts } from '@/types/cafes';
import { CafeCard } from './CafeCard';

export interface CafeFeedProps {
  cafes: CoffeeShopWithProducts[];
  loading?: boolean;
  emptyMessage?: string;
}

/**
 * Feed de cafeterías en grid responsive.
 * Mobile: 1 columna. Tablet/Desktop: hasta 3 columnas con max-width 1024px.
 */
export function CafeFeed({
  cafes,
  loading = false,
  emptyMessage = 'No se encontraron cafeterías con esos filtros.',
}: CafeFeedProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface-card brutal-border rounded-lg shadow-[4px_4px_0px_0px_#1A0F0A] h-80 animate-pulse" />
        ))}
      </div>
    );
  }

  if (cafes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-surface-card brutal-border rounded-full shadow-[4px_4px_0px_0px_#1A0F0A] flex items-center justify-center text-3xl mb-3">
          ☕
        </div>
        <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-black uppercase text-espresso-ink tracking-tight">
          Todavía no hay cafeterías
        </h3>
        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-on-surface-variant mt-1">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-6 pb-12">
        {cafes.map((cafe) => (
          <CafeCard key={cafe.id} cafe={cafe} />
        ))}
      </div>
    </section>
  );
}
