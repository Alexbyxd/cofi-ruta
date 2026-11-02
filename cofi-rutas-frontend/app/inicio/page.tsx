'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AppHeader,
  ClimateBanner,
  DuoHero,
  QuickActions,
  AnchoDelDia,
  PasaporteSellos,
  ComunidadEnVivo,
  AppFooter,
} from '@/components/inicio';
import {
  SearchBar,
  FilterChip,
  CafeFeed,
} from '@/components/cafes';
import { cafesService } from '@/services/cafes.service';
import { DEFAULT_CAFE_FILTER_CHIPS } from '@/types/cafes';
import type { CoffeeShopWithProducts } from '@/types/cafes';
import { Flame } from 'lucide-react';

/**
 * Página "Inicio" de CofiRutas rediseñada sobre el diseño de inicio.html.
 *
 * Pantalla principal neobrutalista para la app móvil de Oruro:
 *  - Cabecera fija con logo, badge Oruro 3735M y modo CofiDúo (Carlos & Laura).
 *  - Banner de clima del Altiplano.
 *  - Hero del modo CofiDúo con progreso del Pasaporte Dúo.
 *  - Hub de acciones rápidas (Matcher, Rutas, PIN, Diario Dúo).
 *  - Buscador de Antojos + filtros por chips + feed de cafeterías.
 *  - Antojo del Día (primer café del feed destacado).
 *  - Pasaporte Cafetero con sellos recientes.
 *  - Actividad comunitaria en vivo.
 *  - Navegación inferior fija (Inicio, Explorar, Matcher, Check-In, Dúo).
 */
export default function InicioPage() {
  const [cafes, setCafes] = useState<CoffeeShopWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCafes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cafesService.listCafes({
        neighborhood: activeFilter || undefined,
        search: searchQuery || undefined,
      });
      setCafes(response.cafes);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudieron cargar las cafeterías.',
      );
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    (async () => {
      await loadCafes();
    })();
  }, [loadCafes]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilter = useCallback((value: string) => {
    setActiveFilter(value === activeFilter ? null : value);
  }, [activeFilter]);

  const featuredCafe = cafes.length > 0 ? cafes[0] : undefined;

  const isCofiDuoActive = true;

  return (
    <div className="min-h-screen bg-[#FAF4EC] flex flex-col text-espresso-ink antialiased selection:bg-[#E59840] selection:text-espresso-ink">
      {/* Cabecera fija */}
      <AppHeader />

      <main className="flex flex-col relative w-full pt-20 pb-28 bg-[#FAF4EC]">
        <div className="flex flex-col w-full px-4 pb-8 space-y-5">
          {/* 1. Saludo y clima del Altiplano */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] uppercase tracking-widest text-[#795741] font-bold">
                  Sesión en Pareja • Oruro
                </span>
                <h1 className="font-[family-name:var(--font-space-grotesk)] text-[28px] uppercase text-espresso-ink leading-tight tracking-tight">
                  ¡Buenas tardes, Carlos & Laura! ☕
                </h1>
              </div>
              <div className="shrink-0 p-2.5 bg-[#E59840] rounded-lg border-[3px] border-espresso-ink shadow-[3px_3px_0px_0px_#1A0F0A] rotate-3 hover:rotate-0 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
            </div>
            <ClimateBanner />
          </div>

          {/* 2. Hero CofiDúo */}
          {isCofiDuoActive && <DuoHero />}

          {/* 3. Acciones rápidas */}
          <QuickActions />

          {/* 4. Buscador de Antojos */}
          <section className="w-full">
            <SearchBar
              placeholder="¿Qué café o postre se te antoja hoy? (ej. Submarino, Waffle...)"
              onSearch={handleSearch}
              className="max-w-md sm:max-w-lg"
            />
          </section>

          {/* 5. Filtros por chips */}
          <section className="w-full pb-4">
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {DEFAULT_CAFE_FILTER_CHIPS.map((chip) => (
                <FilterChip
                  key={chip.value}
                  chip={chip}
                  active={activeFilter === chip.value}
                  onSelect={handleFilter}
                />
              ))}
            </div>
          </section>

          {/* 6. Antojo del Día (destacado) */}
          {featuredCafe && <AnchoDelDia cafe={featuredCafe} />}

          {/* 7. Pasaporte Cafetero */}
          <PasaporteSellos />

          {/* 8. Comunidad en vivo */}
          <ComunidadEnVivo />

          {error && (
            <div className="bg-[#FFDAD6] text-[#93000A] brutal-border rounded-lg p-4 mb-6 font-[family-name:var(--font-dm-sans)] text-sm font-medium">
              {error}
            </div>
          )}
          <CafeFeed
            cafes={cafes}
            loading={loading}
            emptyMessage="No se encontraron cafeterías con esos filtros. Probá otro antojo."
          />
        </div>
      </main>

      {/* Navegación inferior fija */}
      <AppFooter />
    </div>
  );
}
