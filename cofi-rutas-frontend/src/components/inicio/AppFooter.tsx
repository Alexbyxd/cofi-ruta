'use client';

import Link from 'next/link';
import { Home, Compass, Coffee, CheckCircle2, Crown } from 'lucide-react';

type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/inicio', icon: Home, label: 'Inicio' },
  { href: '/explorar', icon: Compass, label: 'Explorar' },
  { href: '/matcher', icon: Coffee, label: 'Matcher' },
  { href: '/check-in', icon: CheckCircle2, label: 'Check-In' },
  { href: '/duo', icon: Crown, label: 'Dúo' },
];

/**
 * Navegación inferior fija con 5 destinos. Resalta el activo con el estilo neobrutalista.
 */
export function AppFooter() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/inicio';
  return (
    <nav className="fixed bottom-0 w-full z-50 pb-4 bg-[#FAF4EC]/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(26,15,10,0.06)]">
      <div className="flex justify-around items-center h-20 px-2 max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-1.5 rounded-lg transition-transform active:translate-x-0.5 active:translate-y-0.5 ${active ? 'bg-[#E59840] text-espresso-ink border-2 border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A] font-bold' : 'text-[#524437] transition-transform active:translate-x-0.5 active:translate-y-0.5'}`}
            >
              <Icon className="w-5 h-5" />
              <span className={`font-[family-name:var(--font-space-grotesk)] text-[12px] mt-0.5 truncate uppercase tracking-wider ${active ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
