'use client';

import React from 'react';
import { DesktopAppHeader } from './DesktopAppHeader';
import {
  HeroSection,
  DuoHero,
  QuickActions,
  SearchFilters,
  AntojoDelDia,
  CafeFeed,
  PasaporteSellos,
  ComunidadEnVivo,
  DuoChallenge,
} from '@/components/inicio/shared';
import { useInicioData } from '@/hooks/useInicioData';
import { useCofiDuo } from '@/hooks/useCofiDuo';
import { useComunidadData } from '@/hooks/useComunidadData';
import { usePasaporte } from '@/hooks/usePasaporte';

interface DesktopLayoutProps {
  className?: string;
}

/**
 * DesktopLayout: Main wrapper for desktop Inicio page.
 * Asymmetric 2-column layout (60/40) with sticky sidebar.
 * Uses shared hooks for all business logic.
 */
export function DesktopLayout({ className = '' }: DesktopLayoutProps) {
  const {
    cafes,
    featuredCafe,
    loading,
    error,
    activeFilter,
    searchQuery,
    displayCount,
    hasMore,
    handleSearch,
    handleFilter,
    handleLoadMore,
  } = useInicioData({ loadOnMount: true });

  const {
    streakWeeks,
    currentStamps,
    targetStamps,
    nextReward,
    sharedTastes,
    duoNames,
    duoDay,
    progress: duoProgress,
  } = useCofiDuo();

  const {
    groupedActivities,
    stats,
    timeGroups,
  } = useComunidadData();

  const {
    stamps,
    completedStamps,
    totalStamps,
    progress: pasaporteProgress,
    nextReward: pasaporteNextReward,
    altitudeTip,
  } = usePasaporte();

  const featuredCafeTyped = featuredCafe as import('@/types/cafes').CoffeeShopWithProducts | undefined;

  return (
    <div className={`min-h-screen bg-[#FAF4EC] flex flex-col text-espresso-ink antialiased selection:bg-[#E59840] selection:text-espresso-ink ${className}`}>
      {/* Desktop AppHeader */}
      <DesktopAppHeader />

      <main className="flex-1 flex flex-col pt-20 pb-12 relative w-full bg-[#FAF4EC]">
        {/* Subtle dot grid pattern background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(#1A0F0A 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <div className="relative z-10 max-w-[1400px] mx-auto w-full px-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* LEFT COLUMN: Main Content (~60%) */}
            <div className="flex-1 lg:w-[60%] min-w-0 flex flex-col space-y-6">
              {/* 1. Hero Section: Greeting + Climate side-by-side */}
              <HeroSection variant="desktop" duoNames={duoNames} />

              {/* 2. CofiDúo Hero: Horizontal layout with progress ring */}
              <DuoHero
                variant="desktop"
                streakWeeks={streakWeeks}
                currentStamps={currentStamps}
                targetStamps={targetStamps}
                nextReward={nextReward}
                sharedTastes={sharedTastes}
                duoNames={duoNames}
                duoDay={duoDay}
              />

              {/* 3. Quick Actions Hub: 2x2 Grid */}
              <QuickActions variant="desktop" />

              {/* 4. Search + Filters Row */}
              <SearchFilters
                variant="desktop"
                onSearch={handleSearch}
                onFilter={handleFilter}
                activeFilter={activeFilter}
                searchQuery={searchQuery}
              />

              {/* 5. Antojo del Día: Horizontal 40/60 */}
              {featuredCafeTyped && <AntojoDelDia variant="desktop" cafe={featuredCafeTyped} />}

              {/* 6. Cafe Feed: 2-column Masonry */}
              <CafeFeed
                variant="desktop"
                cafes={cafes}
                loading={loading}
                emptyMessage="No se encontraron cafeterías con esos filtros. Probá otro antojo."
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
              />

              {/* Footer badge */}
              <div className="mt-8 pt-6 border-t-2 border-espresso-ink flex items-center justify-center">
                <div className="px-4 py-3 bg-[#FAF4EC] border-2 border-dashed border-espresso-ink rounded-lg shadow-[2px_2px_0px_0px_#1A0F0A] text-center">
                  <p className="font-[family-name:var(--font-space-grotesk)] text-[11px] uppercase text-espresso-ink font-bold flex items-center justify-center gap-1">
                    ☕ TUESTE ARTESANAL • HECHO PARA EL FRÍO DE ORURO
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Sticky Sidebar (~40%) */}
            <aside className="lg:w-[40%] shrink-0 flex flex-col gap-4 self-start">
              <div className="sticky top-28 space-y-4">
                {/* Pasaporte Cafetero */}
                <PasaporteSellos
                  variant="desktop"
                  stamps={stamps}
                  completedStamps={completedStamps}
                  totalStamps={totalStamps}
                  progress={pasaporteProgress}
                  nextReward={pasaporteNextReward}
                  altitudeTip={altitudeTip}
                />

                {/* Comunidad en Vivo */}
                <ComunidadEnVivo
                  variant="desktop"
                  stats={stats}
                />

                {/* Reto Dúo Semanal */}
                <DuoChallenge variant="desktop" />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}