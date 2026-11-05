'use client';

import React, { useEffect, useState } from 'react';
import {
  AppHeader,
  AppFooter,
} from '@/components/inicio';
import {
  HeroSection,
  DuoHero,
  QuickActions,
  SearchFilters,
  AntojoDelDia,
  CafeFeed,
  PasaporteSellos,
  ComunidadEnVivo,
} from '@/components/inicio/shared';
import { DesktopLayout } from '@/components/inicio/desktop/DesktopLayout';
import { useInicioData } from '@/hooks/useInicioData';
import { useCofiDuo } from '@/hooks/useCofiDuo';
import { useComunidadData } from '@/hooks/useComunidadData';
import { usePasaporte } from '@/hooks/usePasaporte';

/**
 * Página "Inicio" de CofiRutas - Responsive con hooks compartidos.
 *
 * Mobile/Tablet (<1024px lg): Vertical stack con componentes shared (variant="mobile")
 * Desktop (>=1024px lg): Layout asimétrico 2-columnas (60/40) con DesktopLayout
 *
 * Breakpoints:
 * - Mobile: <768px (md)
 * - Tablet: 768px - 1023px (md-lg)
 * - Desktop: >=1024px (lg)
 */
export default function InicioPage() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Shared hooks - single source of truth for all logic
  const {
    cafes,
    featuredCafe,
    loading,
    error,
    activeFilter,
    searchQuery,
    handleSearch,
    handleFilter,
    handleLoadMore,
    hasMore,
  } = useInicioData({ loadOnMount: !isDesktop }); // Don't load on mount for desktop (handled by DesktopLayout)

  const {
    streakWeeks,
    currentStamps,
    targetStamps,
    nextReward,
    sharedTastes,
    duoNames,
    duoDay,
  } = useCofiDuo();

  const {
    stats,
  } = useComunidadData();

  const {
    stamps,
    completedStamps,
    totalStamps,
    progress: pasaporteProgress,
    nextReward: pasaporteNextReward,
    altitudeTip,
  } = usePasaporte();

  // Detect desktop breakpoint on mount and resize
  useEffect(() => {
    setMounted(true);
    const checkDesktop = () => {
      const desktop = window.innerWidth >= 1024; // lg breakpoint
      setIsDesktop(desktop);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAF4EC]">
        <div className="fixed top-0 w-full h-20 bg-[#FAF4EC]/95 backdrop-blur-xl border-b-[3px] border-espresso-ink" />
        <main className="pt-20 pb-28 px-4" />
      </div>
    );
  }

  const featuredCafeTyped = featuredCafe as import('@/types/cafes').CoffeeShopWithProducts | undefined;

  return (
    <div className="min-h-screen bg-[#FAF4EC] flex flex-col text-espresso-ink antialiased selection:bg-[#E59840] selection:text-espresso-ink">
      {/* ===== DESKTOP LAYOUT (lg: >=1024px) ===== */}
      <DesktopLayout className="hidden lg:block" />

      {/* ===== MOBILE/TABLET LAYOUT (<1024px) ===== */}
      <div className="lg:hidden">
        {/* Cabecera fija móvil */}
        <AppHeader />

        <main className="flex flex-col relative w-full pt-20 pb-28 bg-[#FAF4EC]">
          <div className="flex flex-col w-full px-4 pb-8 space-y-5">
            {/* 1. Hero Section: Saludo + Clima */}
            <HeroSection variant="mobile" duoNames={duoNames} />

            {/* 2. Hero CofiDúo */}
            <DuoHero
              variant="mobile"
              streakWeeks={streakWeeks}
              currentStamps={currentStamps}
              targetStamps={targetStamps}
              nextReward={nextReward}
              sharedTastes={sharedTastes}
              duoNames={duoNames}
              duoDay={duoDay}
            />

            {/* 3. Acciones rápidas */}
            <QuickActions variant="mobile" />

            {/* 4. Buscador de Antojos + Filtros */}
            <SearchFilters
              variant="mobile"
              onSearch={handleSearch}
              onFilter={handleFilter}
              activeFilter={activeFilter}
              searchQuery={searchQuery}
            />

            {/* 5. Antojo del Día (destacado) */}
            {featuredCafeTyped && <AntojoDelDia variant="mobile" cafe={featuredCafeTyped} />}

            {/* 6. Pasaporte Cafetero */}
            <PasaporteSellos
              variant="mobile"
              stamps={stamps}
              completedStamps={completedStamps}
              totalStamps={totalStamps}
              progress={pasaporteProgress}
              nextReward={pasaporteNextReward}
              altitudeTip={altitudeTip}
            />

            {/* 7. Comunidad en vivo */}
            <ComunidadEnVivo variant="mobile" stats={stats} />

            {error && (
              <div className="bg-[#FFDAD6] text-[#93000A] brutal-border rounded-lg p-4 mb-6 font-[family-name:var(--font-dm-sans)] text-sm font-medium">
                {error}
              </div>
            )}
            <CafeFeed
              variant="mobile"
              cafes={cafes}
              loading={loading}
              emptyMessage="No se encontraron cafeterías con esos filtros. Probá otro antojo."
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          </div>
        </main>

        {/* Navegación inferior fija móvil */}
        <AppFooter />
      </div>
    </div>
  );
}