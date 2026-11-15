'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  AnalyticsCharts,
  CoffeeShopsTable,
  EmergencyFreezeButton,
  KPICards,
  LiveCheckinsFeed,
  PINGeneratorModal,
  SuperadminHeader,
  SuperadminSidebar,
} from '@/components/dashboard';
import { AdminBottomNav } from '@/components/dashboard/AdminBottomNav';

/**
 * Roles que entran al panel administrativo.
 *
 * SUPERADMIN ve todos los módulos. OWNER es el dueño de una cafetería: ve el
 * panel de su red, pero las acciones globales (generar PIN diario y congelar la
 * rotación) quedan fuera de su alcance.
 */
const ADMIN_ROLES = ['SUPERADMIN', 'OWNER'];

/**
 * Panel administrativo en `/admin`.
 *
 * Desktop (>=lg): sidebar fijo + header + grilla de módulos.
 * Mobile (<lg): sin sidebar, módulos apilados y navegación inferior, según el
 * screen mobile "Superadmin Dashboard Mobile — CofiRutas".
 */
export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [frozen, setFrozen] = useState(false);

  const role = user?.role ?? '';
  const isOwner = role === 'OWNER';
  const canAccess = ADMIN_ROLES.includes(role);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (!canAccess) {
      router.replace('/inicio');
    }
  }, [isLoading, isAuthenticated, canAccess, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-crema-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display font-bold text-sm uppercase text-espresso-ink">
            Cargando consola...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !canAccess) {
    return null;
  }

  const userName = user.fullName || user.name || 'Operador';
  const userEmail = user.email || '';
  const avatarUrl = user.avatarUrl ?? user.image ?? undefined;

  return (
    <div className="min-h-screen bg-cream-bg flex">
      <div className="hidden lg:block">
        <SuperadminSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        />
      </div>

      <div className="lg:hidden">
        <SuperadminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <SuperadminHeader
          user={{
            name: userName,
            email: userEmail,
            avatarUrl,
            role,
          }}
          sidebarCollapsed={sidebarCollapsed}
          onMenuClick={() => setSidebarOpen(true)}
          onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
          onPinGeneratorClick={
            isOwner ? undefined : () => setPinModalOpen(true)
          }
        />

        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-10 flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display font-bold text-[11px] uppercase tracking-widest text-deep-mocha">
                Oruro Operations HQ
              </p>
              <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-espresso-ink leading-none mt-1">
                CofiRutas Superadmin Dashboard
              </h1>
            </div>
            <span className="bg-espresso-ink text-cream-bg font-display font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full">
              {isOwner ? 'MODO OWNER · CONSOLA ACTIVA' : 'MODO SUPERADMIN · CONSOLA ACTIVA'}
            </span>
          </div>

          <section id="resumen" aria-label="Indicadores">
            <KPICards />
          </section>

          <section id="analitica" aria-label="Analítica">
            <AnalyticsCharts />
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <section id="cafeterias" aria-label="Cafeterías" className="xl:col-span-2 min-w-0">
              <CoffeeShopsTable />
            </section>
            <section id="checkins" aria-label="Check-ins en vivo" className="min-w-0">
              <LiveCheckinsFeed />
            </section>
          </div>

          <section id="cuenta" aria-label="Acciones globales" className="flex flex-col gap-3">
            <h2 className="font-display font-black text-lg uppercase text-espresso-ink">
              Acciones globales
            </h2>
            {isOwner ? (
              <p className="font-[family-name:var(--font-dm-sans)] text-sm font-medium text-espresso-ink/70 bg-white brutal-border rounded-xl p-4">
                Tu rol de dueño no incluye las acciones globales del panel. La
                emisión de PIN diario y el congelamiento de la rotación las
                ejecuta un superadmin.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setPinModalOpen(true)}
                  className="bg-crema-gold text-espresso-ink font-display font-bold text-xs uppercase px-4 py-3 rounded-lg brutal-border shadow-brutal-sm"
                >
                  Generar PIN diario
                </button>
                <EmergencyFreezeButton
                  initiallyFrozen={frozen}
                  onFreeze={() => setFrozen(true)}
                  onUnfreeze={() => setFrozen(false)}
                />
              </div>
            )}
          </section>
        </main>

        <AdminBottomNav />
      </div>

      {!isOwner && (
        <PINGeneratorModal
          isOpen={pinModalOpen}
          onClose={() => setPinModalOpen(false)}
          onEmit={() => setPinModalOpen(false)}
        />
      )}
    </div>
  );
}
