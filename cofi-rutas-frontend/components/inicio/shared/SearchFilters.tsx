'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Filter } from 'lucide-react';
import type { CafeFilterChip } from '@/types/cafes';
import { DEFAULT_CAFE_FILTER_CHIPS } from '@/types/cafes';

type Variant = 'mobile' | 'desktop';

interface SearchFiltersProps {
  variant: Variant;
  onSearch: (query: string) => void;
  onFilter: (value: string) => void;
  activeFilter: string | null;
  searchQuery: string;
}

export function SearchFilters({ variant, onSearch, onFilter, activeFilter, searchQuery }: SearchFiltersProps) {
  const [query, setQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(true);
  const chipsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(query.trim());
    },
    [query, onSearch],
  );

  const handleFilter = useCallback(
    (value: string) => {
      onFilter(value === activeFilter ? '' : value);
    },
    [activeFilter, onFilter],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  const scrollChips = (direction: 'left' | 'right') => {
    if (chipsRef.current) {
      chipsRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  if (variant === 'mobile') {
    return (
      <section className="w-full space-y-3">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-espresso-ink/50 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="¿Qué café o postre se te antoja hoy? (ej. Submarino, Waffle...)"
                  className="brutal-input w-full pl-12 pr-16 py-3.5 text-base font-[family-name:var(--font-dm-sans)] text-espresso-ink placeholder:text-espresso-ink/50"
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-espresso-ink text-[#FFFFFF] rounded border border-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A] hover:shadow-[2px_2px_0px_0px_#1A0F0A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="shrink-0 px-6 py-3.5 bg-[#FFDE59] text-espresso-ink font-[family-name:var(--font-space-grotesk)] font-bold uppercase text-sm tracking-wider brutal-border rounded-r-lg shadow-[2px_2px_0px_0px_#1A0F0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#E5C84A] transition-all"
                aria-label="Buscar"
              >
                <span className="flex items-center gap-1">
                  <Search className="w-4 h-4" />
                  Buscar
                </span>
              </button>
            </div>
          </div>
        </form>

        {showFilters && (
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {DEFAULT_CAFE_FILTER_CHIPS.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => handleFilter(chip.value)}
                className={`px-3 py-1.5 brutal-border rounded-full shadow-[2px_2px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none whitespace-nowrap ${
                  activeFilter === chip.value
                    ? `${getChipBgColor(chip.color)} text-espresso-ink font-black border-[3px] shadow-[3px_3px_0px_0px_#1A0F0A]`
                    : 'bg-[#FFFFFF] text-espresso-ink/80 hover:bg-[#F3EDE5]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </section>
    );
  }

  // Desktop variant - Full width search + horizontal scroll chips
  return (
    <section className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-espresso-ink/50 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿Qué café o postre se te antoja hoy? (ej. Submarino, Waffle, Churros, Tostada...)"
                className="brutal-input w-full pl-12 pr-16 py-4 text-lg font-[family-name:var(--font-dm-sans)] text-espresso-ink placeholder:text-espresso-ink/50"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-espresso-ink text-[#FFFFFF] rounded border border-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A] hover:shadow-[2px_2px_0px_0px_#1A0F0A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="shrink-0 px-6 py-4 bg-[#FFDE59] text-espresso-ink font-[family-name:var(--font-space-grotesk)] font-bold uppercase text-sm tracking-wider brutal-border rounded-r-lg shadow-[2px_2px_0px_0px_#1A0F0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#E5C84A] transition-all"
              aria-label="Buscar"
            >
              <span className="flex items-center gap-1">
                <Search className="w-4 h-4" />
                Buscar
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0 p-4 bg-[#FFFFFF] text-espresso-ink brutal-border rounded-lg shadow-[2px_2px_0px_0px_#1A0F0A] hover:shadow-[3px_3px_0px_0px_#1A0F0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              aria-label={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>

      {showFilters && (
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] uppercase text-espresso-ink font-bold tracking-wider">
              Filtrar por antojo
            </span>
            <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] text-[#795741] font-bold">
              {DEFAULT_CAFE_FILTER_CHIPS.length} categorías
            </span>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => scrollChips('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 p-2 bg-[#FAF4EC] border-2 border-espresso-ink rounded-full shadow-[2px_2px_0px_0px_#1A0F0A] text-espresso-ink hover:shadow-[3px_3px_0px_0px_#1A0F0A] active:translate-x-[-4px] active:translate-y-[2px] active:shadow-none transition-all hidden lg:flex"
              aria-label="Desplazar filtros a la izquierda"
            >
              <span className="w-5 h-5">‹</span>
            </button>

            <div
              ref={chipsRef}
              className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth lg:px-10"
              role="group"
              aria-label="Filtros de cafeterías"
            >
              {DEFAULT_CAFE_FILTER_CHIPS.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => handleFilter(chip.value)}
                  className={`px-4 py-2 brutal-border rounded-full shadow-[2px_2px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none whitespace-nowrap shrink-0 ${
                    activeFilter === chip.value
                      ? `${getChipBgColor(chip.color)} text-espresso-ink font-black border-[3px] shadow-[3px_3px_0px_0px_#1A0F0A]`
                      : 'bg-[#FFFFFF] text-espresso-ink/80 hover:bg-[#F3EDE5]'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollChips('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 p-2 bg-[#FAF4EC] border-2 border-espresso-ink rounded-full shadow-[2px_2px_0px_0px_#1A0F0A] text-espresso-ink hover:shadow-[3px_3px_0px_0px_#1A0F0A] active:translate-x-[4px] active:translate-y-[2px] active:shadow-none transition-all hidden lg:flex"
              aria-label="Desplazar filtros a la derecha"
            >
              <span className="w-5 h-5">›</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function getChipBgColor(color: CafeFilterChip['color']): string {
  switch (color) {
    case 'amber':
      return 'bg-[#FFDE59]';
    case 'cyan':
      return 'bg-[#70D6FF]';
    case 'pink':
      return 'bg-[#FF85A1]';
    default:
      return 'bg-[#FFFFFF]';
  }
}