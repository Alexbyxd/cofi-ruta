'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useIsMounted } from '@/hooks/useIsMounted';
import Link from 'next/link';

/**
 * CofiRutas User Dashboard - Inicio
 * 
 * Desktop Dashboard for CofiDúo users
 * Design from Stitch: "Inicio — CofiRutas Desktop Dashboard"
 * Project: 17305238942107884719
 * Screen: 75fc9a3f1d214c97acea1155fe6c1aa7
 */
export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const mounted = useIsMounted();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const userRole = user.role || user.specialty;
      if (userRole === 'SUPERADMIN') {
        router.replace('/admin');
      }
    } else if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-cream-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-crema-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display font-bold text-sm uppercase text-espresso-ink">
            Cargando CofiRutas...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const userName = user.fullName || user.name || 'Usuario';
  const userFirstName = userName.split(' ')[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="min-h-screen pb-16 antialiased selection:bg-crema-gold selection:text-espresso-ink bg-cream-bg" style={{
      backgroundImage: 'radial-gradient(#1A0F0A 0.85px, transparent 0.85px)',
      backgroundSize: '18px 18px',
      fontFamily: '"DM Sans", sans-serif',
      color: '#1A0F0A'
    }}>
      <style jsx global>{`
        .brutal-border { border: 3px solid #1A0F0A; }
        .brutal-border-2 { border: 2px solid #1A0F0A; }
        .brutal-btn { transition: all 0.15s ease-out; }
        .brutal-btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0px 0px #1A0F0A; }
        .brutal-btn:active { transform: translate(2px, 2px); box-shadow: 0px 0px 0px 0px #1A0F0A !important; }
        .brutal-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .brutal-card:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0px 0px #1A0F0A; }
        .shadow-brutal-sm { box-shadow: 2px 2px 0px 0px #1A0F0A; }
        .shadow-brutal { box-shadow: 4px 4px 0px 0px #1A0F0A; }
        .shadow-brutal-lg { box-shadow: 8px 8px 0px 0px #1A0F0A; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .font-display { font-family: "Space Grotesk", sans-serif; }
        .font-body { font-family: "DM Sans", sans-serif; }
      `}</style>

      {/* ================= TOP APP HEADER (DESKTOP) ================= */}
      <header className={`sticky top-0 z-50 bg-cream-bg/95 backdrop-blur-md brutal-border border-t-0 border-x-0 border-b-[3px] border-espresso-ink shadow-brutal-sm px-6 lg:px-12 py-3.5 transition-all ${isScrolled ? 'shadow-brutal' : ''}`}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          {/* Brand Left */}
          <div className="flex items-center gap-3">
            <Link className="flex items-center gap-2.5 group" href="/inicio">
              <div className="w-11 h-11 bg-crema-gold brutal-border rounded-lg shadow-brutal-sm flex items-center justify-center text-espresso-ink group-hover:rotate-6 transition-transform">
                <span className="material-symbols-outlined text-2xl">local_cafe</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-2xl tracking-tight uppercase leading-none">CofiRutas</span>
                  <span className="bg-leaf-green text-white text-[10px] font-display font-bold px-1.5 py-0.5 rounded brutal-border-2 leading-none uppercase -rotate-2">PRO</span>
                </div>
                <span className="text-[11px] font-medium text-deep-mocha/80 tracking-wide block uppercase font-display">Altiplano • Cafés de Altura</span>
              </div>
            </Link>
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 ml-6">
              <Link className="bg-crema-gold text-espresso-ink font-display font-bold text-xs uppercase px-3 py-1.5 rounded-lg brutal-border shadow-brutal-sm flex items-center gap-1.5" href="/inicio">
                <span className="material-symbols-outlined text-base">home</span> Inicio
              </Link>
              <Link className="bg-white hover:bg-cream-bg text-espresso-ink font-display font-bold text-xs uppercase px-3 py-1.5 rounded-lg brutal-border hover:shadow-brutal-sm transition-all flex items-center gap-1.5" href="/explorar">
                <span className="material-symbols-outlined text-base">explore</span> Rutas
              </Link>
              <Link className="bg-white hover:bg-cream-bg text-espresso-ink font-display font-bold text-xs uppercase px-3 py-1.5 rounded-lg brutal-border hover:shadow-brutal-sm transition-all flex items-center gap-1.5" href="/matcher">
                <span className="material-symbols-outlined text-base">favorite</span> CofiMatcher
              </Link>
              <Link className="bg-white hover:bg-cream-bg text-espresso-ink font-display font-bold text-xs uppercase px-3 py-1.5 rounded-lg brutal-border hover:shadow-brutal-sm transition-all flex items-center gap-1.5" href="/checkin">
                <span className="material-symbols-outlined text-base">qr_code_scanner</span> Check-In PIN
              </Link>
              <Link className="bg-white hover:bg-cream-bg text-espresso-ink font-display font-bold text-xs uppercase px-3 py-1.5 rounded-lg brutal-border hover:shadow-brutal-sm transition-all flex items-center gap-1.5" href="/diario">
                <span className="material-symbols-outlined text-base">loyalty</span> Pasaporte
              </Link>
            </nav>
          </div>
          
          {/* Center Altitude & Location Badge */}
          <div className="hidden xl:flex items-center gap-2 bg-white px-3.5 py-1 rounded-full brutal-border shadow-brutal-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-leaf-green animate-pulse"></span>
            <span className="font-display font-bold text-xs tracking-wider uppercase">ORURO • 3.735 MSNM</span>
            <span className="text-xs text-deep-mocha/60">|</span>
            <span className="text-xs font-semibold text-deep-mocha flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-cyan-cold">ac_unit</span> -2°C Sensación
            </span>
          </div>
          
          {/* Right Duo & User Avatar Profile */}
          <div className="flex items-center gap-3">
            {/* CofiDúo Badge Button */}
            <button className="bg-terracotta text-white font-display font-bold text-xs uppercase px-3.5 py-1.5 rounded-full brutal-border shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-white">favorite</span>
              <span className="hidden sm:inline">CofiDúo:</span> {userFirstName} & Pareja ☕
              <span className="bg-white text-terracotta text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ml-0.5">Día 125</span>
            </button>
            {/* User Overlapping Duo Avatar */}
            <div className="flex items-center -space-x-3 brutal-card pl-1 cursor-pointer">
              <img alt={userName} className="w-9 h-9 rounded-full object-cover brutal-border-2 z-10" src={user.avatarUrl || user.image || 'https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg'} />
              <img alt="Pareja" className="w-9 h-9 rounded-full object-cover brutal-border-2" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" />
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* 1. HERO TOP DUAL CARD ROW (Full Width Header Grid) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
          {/* Greeting Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl brutal-border shadow-brutal p-6 lg:p-7 relative overflow-hidden flex flex-col justify-between">
            {/* Angled Bolivian Badge */}
            <div className="absolute -top-1 -right-1 bg-leaf-green text-white font-display font-black text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-bl-lg brutal-border shadow-brutal-sm rotate-1">
              🇧🇴 100% Boliviano • Grano Caranavi
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2.5 py-0.5 bg-cream-bg text-deep-mocha text-[11px] font-display font-bold uppercase rounded brutal-border-2">
                  Sesión en Pareja • Oruro Centro
                </span>
                <span className="text-xs font-bold text-leaf-green flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-leaf-green"></span> En línea juntos
                </span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-4xl text-espresso-ink tracking-tight uppercase leading-none mt-1">
                ¡{getGreeting()}, {userFirstName} & Pareja! <span className="inline-block hover:rotate-12 transition-transform cursor-pointer">☕</span>
              </h1>
              <p className="mt-3 text-deep-mocha/80 text-sm sm:text-base font-normal max-w-xl">
                Tarde gélida en la ciudad del Pagador. Hay <strong className="font-bold text-espresso-ink underline decoration-crema-gold decoration-2">12 cafeterías de altura</strong> listas con chocolate caliente espeso de los Yungas y submarinos para combatir el viento de los 3.735 metros.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t-2 border-dashed border-espresso-ink/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="material-symbols-outlined text-crema-gold text-lg">local_fire_department</span>
                <span>Antojo sugerido de hoy: <strong className="underline">Submarino con Churros en Plaza 10 de Febrero</strong></span>
              </div>
              <span className="text-xs font-display font-bold uppercase bg-yellow-action px-2.5 py-1 rounded brutal-border-2 shadow-brutal-sm">
                Nivel: Barista Amor
              </span>
            </div>
          </div>
          
          {/* Climate & Altitude Banner (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-white to-[#F0F8FF] rounded-xl brutal-border shadow-brutal p-6 flex flex-col justify-between relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-cyan-cold brutal-border shadow-brutal-sm flex items-center justify-center text-espresso-ink">
                  <span className="material-symbols-outlined text-2xl font-bold">ac_unit</span>
                </div>
                <div>
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-deep-mocha">Clima Altiplano Oruro</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-black text-3xl text-espresso-ink">6°C</span>
                    <span className="bg-espresso-ink text-white font-display font-bold text-xs px-2 py-0.5 rounded">Sensación: -2°C</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-display font-bold uppercase text-deep-mocha bg-white px-2 py-1 rounded brutal-border-2">
                Viento 24 km/h
              </span>
            </div>
            {/* Advisory Box */}
            <div className="my-4 bg-white/90 p-3.5 rounded-lg brutal-border-2 border-dashed border-espresso-ink">
              <div className="flex items-center gap-2 text-xs font-bold text-espresso-ink mb-1">
                <span className="material-symbols-outlined text-sm text-terracotta">emergency_heat</span>
                <span>Recomendación Barista para el Frío:</span>
              </div>
              <p className="text-xs text-deep-mocha/90 leading-relaxed">
                Pide tu café con leche vaporizada a 70°C o chocolate de taza puro con clavo de olor para conservar la temperatura corporal en altura.
              </p>
            </div>
            {/* Quick Status Metrics */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-display font-bold">
              <div className="bg-crema-gold/20 py-1.5 rounded brutal-border-2 border-espresso-ink">
                ☕ Tueste: Medio-Oscuro
              </div>
              <div className="bg-leaf-green/20 py-1.5 rounded brutal-border-2 border-espresso-ink">
                🏷️ 8 Cafeterías Abiertas
              </div>
            </div>
          </div>
        </section>

        {/* ================= ASYMMETRIC MAIN GRID (60% / 40%) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT COLUMN: MAIN CONTENT (~60% / col-span-7) ================= */}
          <div className="lg:col-span-7 space-y-8">
            {/* 2. COFIDÚO HERO CARD (Wide Horizontal with Passport Progress Ring) */}
            <section className="bg-terracotta-light rounded-xl brutal-border shadow-brutal p-6 lg:p-7 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Left Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-terracotta text-white font-display font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider brutal-border-2 shadow-brutal-sm">
                      CofiDúo Activo
                    </span>
                    <span className="text-xs font-bold text-deep-mocha">Racha de 18 fines de semana</span>
                  </div>
                  <h2 className="font-display font-black text-2xl lg:text-3xl text-espresso-ink uppercase leading-tight">
                    ¿Qué merendamos hoy en pareja?
                  </h2>
                  <p className="text-xs sm:text-sm text-deep-mocha/90 font-medium">
                    {userFirstName} tiene antojo de <strong className="text-espresso-ink font-bold">Café V60 filtrado</strong> y tu pareja guardó <strong className="text-espresso-ink font-bold">Churros con Chocolate</strong>. ¡Hagan swipe sincronizado para resolver el dilema!
                  </p>
                  {/* Progress bar & claim banner */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center text-xs font-display font-bold mb-1.5">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-leaf-green">verified</span> Pasaporte Compartido
                      </span>
                      <span className="bg-white px-2 py-0.5 rounded brutal-border-2 text-espresso-ink">8 de 10 Sellos</span>
                    </div>
                    <div className="w-full h-3.5 bg-white rounded-full brutal-border-2 overflow-hidden p-0.5">
                      <div className="h-full bg-gradient-to-r from-crema-gold to-leaf-green rounded-full transition-all duration-500" style={{ width: '80%' }}></div>
                    </div>
                    <p className="text-[11px] font-bold text-deep-mocha mt-1.5">
                      🎁 ¡A solo <span className="text-terracotta underline">2 sellos</span> de reclamar un Cheesecake de Maracuyá artesanal gratis!
                    </p>
                  </div>
                </div>
                {/* Right: Circular Visual Progress Ring & Action */}
                <div className="flex flex-col items-center justify-center shrink-0 bg-white p-4 rounded-xl brutal-border shadow-brutal-sm w-full md:w-56 text-center">
                  <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                    {/* SVG Progress Ring */}
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <path className="text-cream-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                      {/* Stroke circle (80%) */}
                      <path className="text-terracotta" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="80, 100" strokeLinecap="round" strokeWidth="3.5" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display font-black text-xl text-espresso-ink">80%</span>
                      <span className="text-[9px] font-bold uppercase text-deep-mocha tracking-tight">Completado</span>
                    </div>
                  </div>
                  <Link className="w-full bg-terracotta hover:bg-[#c76545] text-white font-display font-bold text-xs uppercase py-2.5 px-3 rounded-lg brutal-border shadow-brutal-sm brutal-btn flex items-center justify-center gap-1.5" href="/matcher">
                    <span className="material-symbols-outlined text-base">bolt</span> Abrir Matcher
                  </Link>
                </div>
              </div>
            </section>

            {/* 3. QUICK ACTIONS HUB (2x2 Grid with Hover States & Chevrons) */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-black text-lg text-espresso-ink uppercase tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-crema-gold">dashboard_customize</span> Acciones Rápidas
                </h3>
                <span className="text-xs font-display font-bold uppercase text-deep-mocha/70">Atajos de Mesa & Salida</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 1: CofiMatcher */}
                <Link className="bg-white rounded-xl brutal-border shadow-brutal p-4 brutal-card group flex items-center justify-between" href="/matcher">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-terracotta/20 text-terracotta brutal-border-2 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-2xl font-bold">style</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-black text-sm uppercase text-espresso-ink">CofiMatcher</span>
                        <span className="text-[10px] bg-terracotta text-white font-bold px-1.5 py-0.2 rounded-full uppercase">Swipe</span>
                      </div>
                      <p className="text-xs text-deep-mocha/80">Hagan match de antojo en vivo</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-espresso-ink group-hover:translate-x-1 transition-transform">chevron_right</span>
                </Link>
                {/* Card 2: Explorar Rutas */}
                <Link className="bg-white rounded-xl brutal-border shadow-brutal p-4 brutal-card group flex items-center justify-between" href="/explorar">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-crema-gold/20 text-deep-mocha brutal-border-2 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-2xl font-bold">map</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-black text-sm uppercase text-espresso-ink">Explorar Rutas</span>
                        <span className="text-[10px] bg-crema-gold text-espresso-ink font-bold px-1.5 py-0.2 rounded-full uppercase">12 Spots</span>
                      </div>
                      <p className="text-xs text-deep-mocha/80">Cafés de especialidad cerca</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-espresso-ink group-hover:translate-x-1 transition-transform">chevron_right</span>
                </Link>
                {/* Card 3: Validar PIN */}
                <Link className="bg-white rounded-xl brutal-border shadow-brutal p-4 brutal-card group flex items-center justify-between" href="/checkin">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-leaf-green/20 text-leaf-green brutal-border-2 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-2xl font-bold">pin</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-black text-sm uppercase text-espresso-ink">Validar PIN</span>
                        <span className="text-[10px] bg-leaf-green text-white font-bold px-1.5 py-0.2 rounded-full uppercase">+50 Pts</span>
                      </div>
                      <p className="text-xs text-deep-mocha/80">Check-in rápido en barra o caja</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-espresso-ink group-hover:translate-x-1 transition-transform">chevron_right</span>
                </Link>
                {/* Card 4: Diario Dúo */}
                <Link className="bg-white rounded-xl brutal-border shadow-brutal p-4 brutal-card group flex items-center justify-between" href="/diario">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-yellow-action/30 text-espresso-ink brutal-border-2 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-2xl font-bold">auto_stories</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-black text-sm uppercase text-espresso-ink">Diario Dúo</span>
                        <span className="text-[10px] bg-espresso-ink text-white font-bold px-1.5 py-0.2 rounded-full uppercase">24 Fotos</span>
                      </div>
                      <p className="text-xs text-deep-mocha/80">Recuerdos, polaroids y notas</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-espresso-ink group-hover:translate-x-1 transition-transform">chevron_right</span>
                </Link>
              </div>
            </section>

            {/* 4. SEARCH + FILTER CHIPS ROW */}
            <section className="space-y-3">
              {/* Expanded Search Bar */}
              <div className="relative flex items-stretch">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-deep-mocha text-2xl">search</span>
                  <input className="w-full bg-white brutal-border rounded-l-xl py-3.5 pl-12 pr-4 text-sm font-medium text-espresso-ink placeholder:text-deep-mocha/50 focus:outline-none focus:ring-4 focus:ring-crema-gold/40 shadow-brutal-sm" placeholder="¿Qué café o postre se te antoja hoy? (ej. Submarino con churros, Mocaccino, Waffle...)" type="text" />
                </div>
                <button className="bg-yellow-action hover:bg-yellow-300 text-espresso-ink font-display font-black text-xs uppercase px-6 brutal-border border-l-0 rounded-r-xl shadow-brutal-sm brutal-btn flex items-center gap-2">
                  <span>Buscar</span>
                  <span className="material-symbols-outlined text-sm">tune</span>
                </button>
              </div>
              {/* Horizontal Filter Chips Scroll */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide pt-1">
                <button className="bg-crema-gold text-espresso-ink font-display font-bold text-xs uppercase px-3.5 py-1.5 rounded-full brutal-border shadow-brutal-sm shrink-0 hover:-translate-y-0.5 transition-transform flex items-center gap-1.5">
                  ☕ #ParaElFrío
                </button>
                <button className="bg-white hover:bg-cream-bg text-espresso-ink font-display font-bold text-xs uppercase px-3.5 py-1.5 rounded-full brutal-border shadow-brutal-sm shrink-0 hover:-translate-y-0.5 transition-transform flex items-center gap-1.5">
                  ❄️ #FrappésYFríos
                </button>
                <button className="bg-white hover:bg-cream-bg text-espresso-ink font-display font-bold text-xs uppercase px-3.5 py-1.5 rounded-full brutal-border shadow-brutal-sm shrink-0 hover:-translate-y-0.5 transition-transform flex items-center gap-1.5">
                  🧇 #AntojoDulce
                </button>
                <button className="bg-white hover:bg-cream-bg text-espresso-ink font-display font-bold text-xs uppercase px-3.5 py-1.5 rounded-full brutal-border shadow-brutal-sm shrink-0 hover:-translate-y-0.5 transition-transform flex items-center gap-1.5">
                  📶 #ParaEstudiar
                </button>
                <button className="bg-white hover:bg-cream-bg text-espresso-ink font-display font-bold text-xs uppercase px-3.5 py-1.5 rounded-full brutal-border shadow-brutal-sm shrink-0 hover:-translate-y-0.5 transition-transform flex items-center gap-1.5">
                  🔥 #ConCalefacción
                </button>
                <button className="bg-white hover:bg-cream-bg text-espresso-ink font-display font-bold text-xs uppercase px-3.5 py-1.5 rounded-full brutal-border shadow-brutal-sm shrink-0 hover:-translate-y-0.5 transition-transform flex items-center gap-1.5">
                  🥐 #ReposteríaArtesanal
                </button>
              </div>
            </section>

            {/* 5. ANTOJO DEL DÍA (Featured Cafe Wide Horizontal Layout) */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-xl text-espresso-ink uppercase tracking-tight">Antojo del Día en Oruro</h3>
                  <span className="bg-terracotta text-white font-display font-black text-[10px] px-2 py-0.5 rounded uppercase brutal-border-2">
                    Top Elección Altiplano
                  </span>
                </div>
                <Link className="text-xs font-display font-bold uppercase text-deep-mocha underline hover:text-espresso-ink" href="/explorar">Ver todas</Link>
              </div>
              {/* Wide Horizontal Card (Image 40%, Content 60%) */}
              <div className="bg-white rounded-xl brutal-border shadow-brutal overflow-hidden brutal-card flex flex-col md:flex-row">
                {/* Left Image (40%) */}
                <div className="md:w-2/5 relative min-h-[220px] md:min-h-full brutal-border md:border-y-0 md:border-l-0 md:border-r-[3px] border-b-[3px] overflow-hidden">
                  <img alt="Submarino tradicional con churros" className="w-full h-full object-cover" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" />
                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 bg-leaf-green text-white font-display font-bold text-[10px] uppercase px-2.5 py-1 rounded brutal-border-2 shadow-brutal-sm">
                    🔥 TENDENCIA DE INVIERNO
                  </div>
                  <div className="absolute bottom-3 right-3 bg-yellow-action text-espresso-ink font-display font-black text-sm px-3 py-1 rounded brutal-border shadow-brutal-sm">
                    18 Bs.
                  </div>
                </div>
                {/* Right Details (60%) */}
                <div className="md:w-3/5 p-5 md:p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs font-bold text-deep-mocha">
                      <span className="flex items-center gap-1 uppercase tracking-wide">
                        <span className="material-symbols-outlined text-sm text-crema-gold">storefront</span> Café del Socavón
                      </span>
                      <span className="flex items-center gap-1 bg-cream-bg px-2 py-0.5 rounded brutal-border-2 text-espresso-ink">
                        ★ 4.9 <span className="text-deep-mocha/60 font-normal">(142)</span>
                      </span>
                    </div>
                    <h4 className="font-display font-black text-xl text-espresso-ink uppercase mt-1 leading-snug">
                      Submarino Tradicional con 3 Churros
                    </h4>
                    <p className="text-xs text-deep-mocha/80 mt-2 leading-relaxed">
                      Barra artesanal de chocolate de los Yungas fundida en leche entera caliente espumada con toque de canela y clavo de olor. Churros recién fritos crujientes con azúcar impalpable.
                    </p>
                    {/* Amenity Pills */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className="bg-cream-bg text-deep-mocha text-[11px] font-bold px-2 py-0.5 rounded brutal-border-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">near_me</span> A 350m (Plaza 10 de Feb)
                      </span>
                      <span className="bg-cream-bg text-deep-mocha text-[11px] font-bold px-2 py-0.5 rounded brutal-border-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">wifi</span> Wifi Rápido
                      </span>
                      <span className="bg-cream-bg text-deep-mocha text-[11px] font-bold px-2 py-0.5 rounded brutal-border-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">radiator</span> Calefacción
                      </span>
                    </div>
                  </div>
                  {/* Action Row */}
                  <div className="flex items-center gap-3 pt-2">
                    <Link className="flex-1 bg-crema-gold hover:bg-gold-light text-espresso-ink font-display font-black text-xs uppercase py-2.5 px-4 rounded-lg brutal-border shadow-brutal-sm brutal-btn text-center flex items-center justify-center gap-2" href="/cafe/socavon">
                      <span className="material-symbols-outlined text-base">map</span> Ver en Mapa & Menú
                    </Link>
                    <button className="w-10 h-10 rounded-lg bg-white hover:bg-cream-bg brutal-border shadow-brutal-sm brutal-btn flex items-center justify-center text-espresso-ink" title="Guardar favorito">
                      <span className="material-symbols-outlined text-lg">bookmark</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. CAFE FEED (2-Column Masonry/Grid of Cafes) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-xl text-espresso-ink uppercase tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-crema-gold">local_cafe</span> Cafeterías en Oruro
                </h3>
                <div className="flex items-center gap-2 text-xs font-display font-bold">
                  <span className="text-deep-mocha">Ordenar por:</span>
                  <select className="bg-white brutal-border-2 rounded px-2 py-1 text-xs font-bold text-espresso-ink focus:outline-none">
                    <option>Más cercanas (Distancia)</option>
                    <option>Mejor puntuadas (★)</option>
                    <option>Precio más accesible</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Feed Card 1: Café Central Oruro */}
                <div className="bg-white rounded-xl brutal-border shadow-brutal overflow-hidden brutal-card flex flex-col justify-between">
                  <div>
                    <div className="relative h-44 overflow-hidden brutal-border border-t-0 border-x-0 border-b-[3px]">
                      <img alt="Café Central Oruro" className="w-full h-full object-cover" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" />
                      <div className="absolute top-2.5 left-2.5 bg-leaf-green text-white font-display font-bold text-[10px] px-2 py-0.5 rounded brutal-border-2">
                        ABIERTO AHORA
                      </div>
                      <div className="absolute top-2.5 right-2.5 bg-white text-espresso-ink font-display font-black text-xs px-2 py-0.5 rounded brutal-border-2 shadow-brutal-sm">
                        ★ 4.8 (98)
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 bg-espresso-ink/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                        📍 Calle Bolívar y 6 de Octubre
                      </div>
                    </div>
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-black text-base uppercase text-espresso-ink">Café Central Oruro</h4>
                        <span className="text-xs font-bold text-terracotta bg-terracotta-light px-2 py-0.5 rounded brutal-border-2">500 m</span>
                      </div>
                      <p className="text-xs text-deep-mocha/80 line-clamp-2">
                        Especialidad en granos de Caranavi tostados artesanalmente. Tartas caseras de nuez y café mocca.
                      </p>
                      <div className="space-y-1.5 pt-1">
                        <div className="bg-cream-bg p-1.5 rounded brutal-border-2 flex justify-between items-center text-xs font-bold">
                          <span>Capuchino Doble Mocca</span>
                          <span className="bg-white px-1.5 py-0.2 rounded brutal-border-2">[ 16 Bs ]</span>
                        </div>
                        <div className="bg-cream-bg p-1.5 rounded brutal-border-2 flex justify-between items-center text-xs font-bold">
                          <span>Tarta de Nuez y Café</span>
                          <span className="bg-white px-1.5 py-0.2 rounded brutal-border-2">[ 20 Bs ]</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <Link className="w-full bg-crema-gold hover:bg-gold-light text-espresso-ink font-display font-bold text-xs uppercase py-2 rounded-lg brutal-border shadow-brutal-sm brutal-btn flex items-center justify-center gap-1" href="/cafe/central">
                      <span>Ver Menú & Promos</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
                {/* Feed Card 2: Moccoa Artesanal */}
                <div className="bg-white rounded-xl brutal-border shadow-brutal overflow-hidden brutal-card flex flex-col justify-between">
                  <div>
                    <div className="relative h-44 overflow-hidden brutal-border border-t-0 border-x-0 border-b-[3px]">
                      <img alt="Moccoa Artesanal" className="w-full h-full object-cover" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" />
                      <div className="absolute top-2.5 left-2.5 bg-yellow-action text-espresso-ink font-display font-bold text-[10px] px-2 py-0.5 rounded brutal-border-2">
                        ESPECIALIDAD ALTURA
                      </div>
                      <div className="absolute top-2.5 right-2.5 bg-white text-espresso-ink font-display font-black text-xs px-2 py-0.5 rounded brutal-border-2 shadow-brutal-sm">
                        ★ 4.7 (76)
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 bg-espresso-ink/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                        📍 Calle Pagador y Montes
                      </div>
                    </div>
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-black text-base uppercase text-espresso-ink">Moccoa Artesanal</h4>
                        <span className="text-xs font-bold text-terracotta bg-terracotta-light px-2 py-0.5 rounded brutal-border-2">800 m</span>
                      </div>
                      <p className="text-xs text-deep-mocha/80 line-clamp-2">
                        Barra de espresso con métodos V60 y prensa francesa. Repostería belga y frappés de temporada.
                      </p>
                      <div className="space-y-1.5 pt-1">
                        <div className="bg-cream-bg p-1.5 rounded brutal-border-2 flex justify-between items-center text-xs font-bold">
                          <span>Frappé Dulce de Leche</span>
                          <span className="bg-white px-1.5 py-0.2 rounded brutal-border-2">[ 24 Bs ]</span>
                        </div>
                        <div className="bg-cream-bg p-1.5 rounded brutal-border-2 flex justify-between items-center text-xs font-bold">
                          <span>Espresso de Finca Yungas</span>
                          <span className="bg-white px-1.5 py-0.2 rounded brutal-border-2">[ 14 Bs ]</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <Link className="w-full bg-crema-gold hover:bg-gold-light text-espresso-ink font-display font-bold text-xs uppercase py-2 rounded-lg brutal-border shadow-brutal-sm brutal-btn flex items-center justify-center gap-1" href="/cafe/moccoa">
                      <span>Ver Menú & Promos</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
                {/* Feed Card 3: Grano & Alma */}
                <div className="bg-white rounded-xl brutal-border shadow-brutal overflow-hidden brutal-card flex flex-col justify-between">
                  <div>
                    <div className="relative h-44 overflow-hidden brutal-border border-t-0 border-x-0 border-b-[3px]">
                      <img alt="Grano & Alma" className="w-full h-full object-cover" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" />
                      <div className="absolute top-2.5 left-2.5 bg-leaf-green text-white font-display font-bold text-[10px] px-2 py-0.5 rounded brutal-border-2">
                        ABIERTO AHORA
                      </div>
                      <div className="absolute top-2.5 right-2.5 bg-white text-espresso-ink font-display font-black text-xs px-2 py-0.5 rounded brutal-border-2 shadow-brutal-sm">
                        ★ 4.7 (54)
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 bg-espresso-ink/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                        📍 San Pedro y Murguía
                      </div>
                    </div>
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-black text-base uppercase text-espresso-ink">Grano & Alma</h4>
                        <span className="text-xs font-bold text-terracotta bg-terracotta-light px-2 py-0.5 rounded brutal-border-2">600 m</span>
                      </div>
                      <p className="text-xs text-deep-mocha/80 line-clamp-2">
                        Ambiente cálido con fogata central para el frío. Waffles de caramelo salado y café V60 altura.
                      </p>
                      <div className="space-y-1.5 pt-1">
                        <div className="bg-cream-bg p-1.5 rounded brutal-border-2 flex justify-between items-center text-xs font-bold">
                          <span>V60 Altura de Origen</span>
                          <span className="bg-white px-1.5 py-0.2 rounded brutal-border-2">[ 24 Bs ]</span>
                        </div>
                        <div className="bg-cream-bg p-1.5 rounded brutal-border-2 flex justify-between items-center text-xs font-bold">
                          <span>Mocaccino con Canela</span>
                          <span className="bg-white px-1.5 py-0.2 rounded brutal-border-2">[ 20 Bs ]</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <Link className="w-full bg-crema-gold hover:bg-gold-light text-espresso-ink font-display font-bold text-xs uppercase py-2 rounded-lg brutal-border shadow-brutal-sm brutal-btn flex items-center justify-center gap-1" href="/cafe/grano-alma">
                      <span>Ver Menú & Promos</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
                {/* Feed Card 4: Rincón del Barista */}
                <div className="bg-white rounded-xl brutal-border shadow-brutal overflow-hidden brutal-card flex flex-col justify-between">
                  <div>
                    <div className="relative h-44 overflow-hidden brutal-border border-t-0 border-x-0 border-b-[3px]">
                      <img alt="Rincón del Barista" className="w-full h-full object-cover" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" />
                      <div className="absolute top-2.5 left-2.5 bg-deep-mocha text-white font-display font-bold text-[10px] px-2 py-0.5 rounded brutal-border-2">
                        ZONA SILENCIOSA
                      </div>
                      <div className="absolute top-2.5 right-2.5 bg-white text-espresso-ink font-display font-black text-xs px-2 py-0.5 rounded brutal-border-2 shadow-brutal-sm">
                        ★ 4.5 (39)
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 bg-espresso-ink/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                        📍 Veintisiete de Calama
                      </div>
                    </div>
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-black text-base uppercase text-espresso-ink">Rincón del Barista</h4>
                        <span className="text-xs font-bold text-terracotta bg-terracotta-light px-2 py-0.5 rounded brutal-border-2">900 m</span>
                      </div>
                      <p className="text-xs text-deep-mocha/80 line-clamp-2">
                        Ideal para estudiar con enchufes individuales y wifi 100MB. Submarinos de chocolate tradicional.
                      </p>
                      <div className="space-y-1.5 pt-1">
                        <div className="bg-cream-bg p-1.5 rounded brutal-border-2 flex justify-between items-center text-xs font-bold">
                          <span>Submarino Tradicional</span>
                          <span className="bg-white px-1.5 py-0.2 rounded brutal-border-2">[ 16 Bs ]</span>
                        </div>
                        <div className="bg-cream-bg p-1.5 rounded brutal-border-2 flex justify-between items-center text-xs font-bold">
                          <span>Frappé Caramelo</span>
                          <span className="bg-white px-1.5 py-0.2 rounded brutal-border-2">[ 19 Bs ]</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <Link className="w-full bg-crema-gold hover:bg-gold-light text-espresso-ink font-display font-bold text-xs uppercase py-2 rounded-lg brutal-border shadow-brutal-sm brutal-btn flex items-center justify-center gap-1" href="/cafe/rincon">
                      <span>Ver Menú & Promos</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
              {/* Bottom Infinite Scroll Indicator */}
              <div className="text-center pt-3">
                <button className="bg-white hover:bg-cream-bg text-espresso-ink font-display font-bold text-xs uppercase px-5 py-2.5 rounded-lg brutal-border shadow-brutal-sm brutal-btn inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-base animate-spin">sync</span> Cargar 6 cafeterías más de Oruro...
                </button>
              </div>
            </section>
          </div>
          
          {/* ================= RIGHT COLUMN: STICKY SIDEBAR (~40% / col-span-5) ================= */}
          <aside className="lg:col-span-5 space-y-7 lg:sticky lg:top-24">
            {/* A. PASAPORTE CAFETERO (Recent Stamps Stack & Rewards) */}
            <section className="bg-white rounded-xl brutal-border shadow-brutal p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-leaf-green text-white brutal-border-2 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">loyalty</span>
                  </div>
                  <h3 className="font-display font-black text-lg text-espresso-ink uppercase tracking-tight">Pasaporte Cafetero</h3>
                </div>
                <Link className="text-xs font-display font-bold uppercase text-terracotta underline hover:text-espresso-ink" href="/diario">Ver Todo</Link>
              </div>
              <p className="text-xs text-deep-mocha/80 mb-4">
                Sellos físicos certificados en caja con el PIN del barista. Cada visita desbloquea beneficios exclusivos.
              </p>
              {/* Circular Badges Stack (Rotated -2deg Neobrutalist Style) */}
              <div className="grid grid-cols-4 gap-2.5 py-2">
                {/* Stamp 1: Kory Café */}
                <div className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-leaf-green/20 brutal-border flex flex-col items-center justify-center -rotate-2 group-hover:rotate-0 transition-transform shadow-brutal-sm">
                    <span className="font-display font-black text-xs text-leaf-green">KC</span>
                    <span className="material-symbols-outlined text-xs text-leaf-green">check</span>
                  </div>
                  <span className="font-display font-bold text-[10px] mt-1.5 text-espresso-ink truncate w-full">Kory Café</span>
                  <span className="text-[9px] text-deep-mocha/60">14 Oct</span>
                </div>
                {/* Stamp 2: El Pagador */}
                <div className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-terracotta/20 brutal-border flex flex-col items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-brutal-sm">
                    <span className="font-display font-black text-xs text-terracotta">EP</span>
                    <span className="material-symbols-outlined text-xs text-terracotta">check</span>
                  </div>
                  <span className="font-display font-bold text-[10px] mt-1.5 text-espresso-ink truncate w-full">El Pagador</span>
                  <span className="text-[9px] text-deep-mocha/60">22 Oct</span>
                </div>
                {/* Stamp 3: Chocolat */}
                <div className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-crema-gold/20 brutal-border flex flex-col items-center justify-center -rotate-3 group-hover:rotate-0 transition-transform shadow-brutal-sm">
                    <span className="font-display font-black text-xs text-deep-mocha">CH</span>
                    <span className="material-symbols-outlined text-xs text-deep-mocha">check</span>
                  </div>
                  <span className="font-display font-bold text-[10px] mt-1.5 text-espresso-ink truncate w-full">Chocolat</span>
                  <span className="text-[9px] text-deep-mocha/60">Ayer</span>
                </div>
                {/* Stamp 4: Siguiente (Pending) */}
                <div className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-cream-bg brutal-border-2 border-dashed flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-base text-deep-mocha/50">add</span>
                  </div>
                  <span className="font-display font-bold text-[10px] mt-1.5 text-deep-mocha/70 truncate w-full">Próximo</span>
                  <span className="text-[9px] text-leaf-green font-bold">+50 Pts</span>
                </div>
              </div>
              {/* Altitude Tip Notice Box */}
              <div className="mt-4 p-3 bg-cream-bg rounded-lg brutal-border-2 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-crema-gold text-lg shrink-0 mt-0.5">lightbulb</span>
                <div className="text-xs">
                  <span className="font-bold text-espresso-ink">Tip de Altura:</span> Pide tu café con granos de Caranavi con tostado medio para mantener la calidez corporal sin elevar tu presión.
                </div>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-dashed border-espresso-ink/20 flex items-center justify-between">
                <span className="text-xs font-bold text-deep-mocha">Nivel de Pasaporte: <strong className="text-espresso-ink">Explorador Fiel</strong></span>
                <Link className="text-xs font-display font-bold uppercase text-deep-mocha hover:underline flex items-center gap-1" href="/diario">
                  Ver Pasaporte Completo <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </section>

            {/* B. COMUNIDAD EN VIVO (Live Activity Feed) */}
            <section className="bg-white rounded-xl brutal-border shadow-brutal p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-leaf-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-leaf-green"></span>
                  </span>
                  <h3 className="font-display font-black text-lg text-espresso-ink uppercase tracking-tight">Comunidad en Vivo</h3>
                </div>
                <span className="bg-leaf-green/10 text-leaf-green font-display font-bold text-[11px] px-2 py-0.5 rounded brutal-border-2">
                  18 Parejas en ruta
                </span>
              </div>
              {/* Activity List */}
              <div className="space-y-4">
                {/* Grupo: Ahora */}
                <div>
                  <div className="text-[10px] font-display font-bold uppercase tracking-wider text-deep-mocha/60 mb-2">Ahora Mismo</div>
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-cream-bg brutal-border-2">
                    <img alt="Sofía" className="w-8 h-8 rounded-full object-cover brutal-border-2 shrink-0" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" />
                    <div className="text-xs">
                      <p className="text-espresso-ink">
                        <strong className="font-bold">Sofía & Mateo</strong> certificaron visita con PIN en <span className="font-semibold text-deep-mocha">Café del Socavón</span>.
                      </p>
                      <span className="text-[10px] text-deep-mocha/60 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[12px] text-leaf-green">verified</span> Hace 2 minutos • Submarino doble
                      </span>
                    </div>
                  </div>
                </div>
                {/* Grupo: Hace 1h */}
                <div>
                  <div className="text-[10px] font-display font-bold uppercase tracking-wider text-deep-mocha/60 mb-2">Hace 1 Hora</div>
                  <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-cream-bg/50 transition-colors">
                    <img alt="Diego" className="w-8 h-8 rounded-full object-cover brutal-border-2 shrink-0" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" />
                    <div className="text-xs">
                      <p className="text-espresso-ink">
                        <strong className="font-bold">Diego & Mariana</strong> hicieron <span className="bg-terracotta/20 text-terracotta px-1 rounded font-bold">CofiMatch</span> en <span className="font-semibold">Moccoa Artesanal</span>.
                      </p>
                      <span className="text-[10px] text-deep-mocha/60 mt-0.5 block">Hace 45 minutos</span>
                    </div>
                  </div>
                </div>
                {/* Grupo: Hoy */}
                <div>
                  <div className="text-[10px] font-display font-bold uppercase tracking-wider text-deep-mocha/60 mb-2">Hoy en la Mañana</div>
                  <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-cream-bg/50 transition-colors">
                    <img alt="Valeria" className="w-8 h-8 rounded-full object-cover brutal-border-2 shrink-0" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" />
                    <div className="text-xs">
                      <p className="text-espresso-ink">
                        <strong className="font-bold">Valeria</strong> subió 3 fotos de su V60 al <span className="font-semibold">Diario de Oruro</span>.
                      </p>
                      <span className="text-[10px] text-deep-mocha/60 mt-0.5 block">Hoy 10:30 AM • 4.9 ★★★★★</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* C. SIDE PANEL: RETOS EN PAREJA & EVENTOS (CofiDúo Challenges) */}
            <section className="bg-yellow-action/20 rounded-xl brutal-border shadow-brutal p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-lg text-espresso-ink uppercase tracking-tight flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-terracotta">social_leaderboard</span> Reto Dúo de la Semana
                </h3>
                <span className="bg-yellow-action text-espresso-ink font-display font-bold text-[10px] px-2 py-0.5 rounded brutal-border-2">
                  Activo
                </span>
              </div>
              <div className="bg-white p-4 rounded-lg brutal-border shadow-brutal-sm space-y-2">
                <div className="flex items-center justify-between text-xs font-display font-bold">
                  <span>&quot;Circuito 3 Alturas de Oruro&quot;</span>
                  <span className="text-leaf-green">2/3 Completados</span>
                </div>
                <p className="text-xs text-deep-mocha/90">
                  Visiten 3 cafeterías por encima de los 3.700m durante el fin de semana para ganar el pin físico conmemorativo y 100 puntos extra.
                </p>
                <div className="w-full h-2.5 bg-cream-bg rounded-full brutal-border-2 overflow-hidden">
                  <div className="h-full bg-crema-gold rounded-full" style={{ width: '66%' }}></div>
                </div>
              </div>
              {/* Featured Route Card */}
              <div className="bg-cream-bg p-3.5 rounded-lg brutal-border-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded bg-white brutal-border-2 flex items-center justify-center font-display font-black text-sm">
                    🗺️
                  </div>
                  <div>
                    <span className="font-display font-bold text-xs uppercase block text-espresso-ink">Ruta Histórica del Pagador</span>
                    <span className="text-[11px] text-deep-mocha/70">4 spots emblemáticos • 1.2 km</span>
                  </div>
                </div>
                <button className="bg-white hover:bg-cream-bg text-espresso-ink p-1.5 rounded brutal-border-2 hover:shadow-brutal-sm transition-all" title="Ver ruta">
                  <span className="material-symbols-outlined text-sm">navigation</span>
                </button>
              </div>
            </section>
          </aside>
        </div>
        
        {/* ================= FOOTER / ARTISANAL BADGE ================= */}
        <footer className="mt-14 pt-8 border-t-[3px] border-espresso-ink">
          <div className="max-w-4xl mx-auto p-4 rounded-xl border-2 border-dashed border-espresso-ink bg-white/60 text-center shadow-brutal-sm">
            <p className="font-display font-bold text-xs sm:text-sm uppercase tracking-wider text-espresso-ink flex items-center justify-center gap-2">
              <span>☕</span> TUESTE ARTESANAL • HECHO PARA EL FRÍO DE ORURO (3.735 MSNM) <span>🇧🇴</span>
            </p>
            <p className="text-xs text-deep-mocha/70 mt-1">
              CofiRutas Desktop © 2024 • Edición Altiplano & Parejas CofiDúo • Hecho con orgullo en Bolivia
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}