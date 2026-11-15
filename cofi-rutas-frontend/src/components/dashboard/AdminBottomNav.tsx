'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, LayoutDashboard, Store, User } from 'lucide-react';

interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const ITEMS: AdminNavItem[] = [
  { href: '#resumen', label: 'Resumen', icon: LayoutDashboard },
  { href: '#cafeterias', label: 'Cafés', icon: Store },
  { href: '#checkins', label: 'Check-ins', icon: Activity },
  { href: '#cuenta', label: 'Cuenta', icon: User },
];

/**
 * Navegación inferior del panel administrativo.
 *
 * El diseño mobile de Stitch no tiene sidebar: la navegación entre módulos vive
 * en esta barra. Solo se muestra por debajo de `lg`, donde el sidebar toma el
 * relevo. Los destinos son anclas a los módulos de la misma página, no rutas.
 */
export const AdminBottomNav: React.FC = () => (
  <nav
    aria-label="Módulos del panel administrativo"
    className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t-[3px] border-espresso-ink"
  >
    <ul className="grid grid-cols-4">
      {ITEMS.map(({ href, label, icon: Icon }) => (
        <li key={href}>
          <Link
            href={href}
            className="flex flex-col items-center justify-center gap-1 py-2.5 text-espresso-ink hover:bg-cream-bg"
          >
            <Icon className="w-5 h-5" strokeWidth={2.5} />
            <span className="font-[family-name:var(--font-dm-sans)] text-[10px] font-bold uppercase tracking-wide">
              {label}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);
