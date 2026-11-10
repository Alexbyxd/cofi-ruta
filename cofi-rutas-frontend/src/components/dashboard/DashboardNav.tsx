'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Heart, Users, Clock } from 'lucide-react';

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export interface DashboardNavProps {
  items?: DashboardNavItem[];
}

export const DashboardNav: React.FC<DashboardNavProps> = ({
  items = [
    {
      href: '/inicio',
      label: 'Inicio',
      icon: MapPin,
    },
    {
      href: '/explore',
      label: 'Explorar Cafeterías',
      icon: MapPin,
    },
    {
      href: '/matcher',
      label: 'CofiMatcher',
      icon: Heart,
    },
    {
      href: '/check-in',
      label: 'Check-in con PIN',
      icon: Clock,
    },
    {
      href: '/profile/duo',
      label: 'CofiDúo & Diario',
      icon: Users,
    },
  ],
}) => {
  return (
    <section className="w-full px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-card border-[3px] border-espresso-ink rounded-lg shadow-[4px_4px_0px_0px_#1A0F0A] hover:bg-surface-container-high transition-colors active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#1A0F0A]"
          >
            <item.icon className="w-6 h-6 text-espresso-ink shrink-0" strokeWidth={2.5} />
            <span className="font-[family-name:var(--font-space-grotesk)] text-xs sm:text-sm font-bold uppercase tracking-wider text-espresso-ink text-center leading-tight">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
