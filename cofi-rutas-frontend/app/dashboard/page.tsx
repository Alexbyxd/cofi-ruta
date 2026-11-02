'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  DashboardHeader,
  UserProfile,
  DashboardNav,
} from '@/components/dashboard';

/**
 * Página principal "Inicio - CofiRutas Dashboard".
 * Se muestra después del login exitoso (email/password o Google OAuth2).
 * Requiere sesión activa; de lo contrario redirige a /login.
 */
export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col text-espresso-ink">
      <DashboardHeader editionBadge="COFIRUTAS • ORURO" onLogout={logout} />
      <div className="flex-1 px-4 sm:px-6 pb-12">
        <UserProfile user={user} />
        <DashboardNav />
      </div>
    </main>
  );
}
