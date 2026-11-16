'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Group,
  Store,
  Coffee,
  Star,
  Users2,
  Handshake,
  Badge,
  Tag,
  Pin,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Menu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  count?: string | number;
  countColor?: string;
  active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, active: true },
  { href: '/dashboard/users', label: 'Users', icon: Group, count: '1,420', countColor: 'bg-surface' },
  { href: '/dashboard/coffeeshops', label: 'CoffeeShops', icon: Store, count: '18', countColor: 'bg-primary-fixed' },
  { href: '/dashboard/visits', label: 'Visits & Check-ins', icon: Coffee, count: '3.8k', countColor: 'bg-surface' },
  { href: '/dashboard/reviews', label: 'Reviews', icon: Star, count: '842', countColor: 'bg-surface' },
  { href: '/dashboard/duo-group', label: 'Duo / Group', icon: Users2, count: '614', countColor: 'bg-secondary-fixed' },
  { href: '/dashboard/matcher', label: 'Matcher Sessions', icon: Handshake, count: '1,205', countColor: 'bg-tertiary-fixed' },
  { href: '/dashboard/merchant-staff', label: 'MerchantStaff', icon: Badge, count: '36', countColor: 'bg-surface' },
  { href: '/dashboard/tags', label: 'Tags & Antojos', icon: Tag, count: '24', countColor: 'bg-surface' },
  { href: '/dashboard/daily-pins', label: 'Daily PINs', icon: Pin, count: 'Active', countColor: 'bg-coffee-leaf text-surface' },
  { href: '/dashboard/verification-attempts', label: 'Verification Attempts', icon: UserCheck },
  { href: '/dashboard/analytics', label: 'Analytics & Reports', icon: BarChart3 },
];

export interface SuperadminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const SuperadminSidebar: React.FC<SuperadminSidebarProps> = ({
  isOpen = false,
  onClose,
  collapsed = false,
  onToggleCollapse,
}) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(isOpen);

  const handleClose = () => {
    setMobileOpen(false);
    onClose?.();
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      handleClose();
    }
  };

  // Desktop collapsed sidebar
  if (collapsed && window.innerWidth >= 1024) {
    return (
      <aside className="w-16 bg-surface-container-low brutalist-border-r flex flex-col justify-between p-3 shrink-0 min-h-[calc(100vh-4rem)] z-30 fixed left-0 top-16 lg:static">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center justify-center px-2 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary-action text-structural-ink brutalist-border brutalist-shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
                title={item.label}
              >
                <item.icon className="w-5 h-5" strokeWidth={2.5} />
              </Link>
            );
          })}
        </nav>
        <div className="pt-3 brutalist-border-t space-y-2">
          <button
            className="w-full bg-terracotta text-surface brutalist-border brutalist-shadow-sm px-2 py-2 font-label-md text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 hover:brightness-110 active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Emergency Freeze"
          >
            <Shield className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </aside>
    );
  }

  // Mobile drawer
  if (window.innerWidth < 1024) {
    return (
      <>
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={handleClose}
            aria-hidden="true"
          />
        )}
        <aside
          className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-surface-container-low brutalist-border-r flex flex-col justify-between p-4 z-50 lg:static lg:z-30 transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Navegación de administración"
        >
          <div className="space-y-4">
            <div className="p-3 bg-surface brutalist-border brutalist-shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-terracotta" style={{ fontVariationSettings: "'FILL' 1" }}>
                  coffee_maker
                </span>
                <div>
                  <h2 className="text-label-md font-headline-sm font-bold uppercase text-structural-ink tracking-tight">
                    CofiRutas HQ
                  </h2>
                  <p className="text-[11px] font-body-md text-on-surface-variant">Oruro Operations</p>
                </div>
              </div>
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary-action text-structural-ink brutalist-border brutalist-shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                    <span className="font-label-md font-bold">{item.label}</span>
                    {item.count && (
                      <span className={`ml-auto px-1.5 text-[11px] font-label-md brutalist-border ${item.countColor || 'bg-surface'}`}>
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="pt-4 brutalist-border-t space-y-2">
            <button className="w-full bg-terracotta text-surface brutalist-border brutalist-shadow-sm px-3 py-2 font-label-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:translate-x-0.5 active:translate-y-0.5 transition-all">
              <Shield className="w-4 h-4" strokeWidth={2.5} />
              Emergency Freeze
            </button>
            <div className="flex items-center justify-between pt-1 text-on-surface-variant font-label-md text-xs">
              <button className="flex items-center gap-1.5 hover:text-structural-ink transition-colors font-bold">
                <Settings className="w-4 h-4" strokeWidth={2.5} />
                Settings
              </button>
              <button className="flex items-center gap-1.5 hover:text-error transition-colors font-bold">
                <LogOut className="w-4 h-4" strokeWidth={2.5} />
                Logout
              </button>
            </div>
          </div>
        </aside>
      </>
    );
  }

  // Desktop full sidebar
  return (
    <aside className="w-64 bg-surface-container-low brutalist-border-r flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4rem)] z-30">
      <div className="space-y-4">
        <div className="p-3 bg-surface brutalist-border brutalist-shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-terracotta" style={{ fontVariationSettings: "'FILL' 1" }}>
              coffee_maker
            </span>
            <div>
              <h2 className="text-label-md font-headline-sm font-bold uppercase text-structural-ink tracking-tight">
                CofiRutas HQ
              </h2>
              <p className="text-[11px] font-body-md text-on-surface-variant">Oruro Operations</p>
            </div>
          </div>
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary-action text-structural-ink brutalist-border brutalist-shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                  <span className="font-label-md font-bold">{item.label}</span>
                </div>
                {item.count && (
                  <span className={`px-1.5 text-[11px] font-label-md brutalist-border ${item.countColor || 'bg-surface'}`}>
                    {item.count}
                  </span>
                )}
                {isActive && <span className="w-2 h-2 rounded-full bg-structural-ink" />}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="pt-4 brutalist-border-t space-y-2">
        <button className="w-full bg-terracotta text-surface brutalist-border brutalist-shadow-sm px-3 py-2 font-label-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:translate-x-0.5 active:translate-y-0.5 transition-all">
          <Shield className="w-4 h-4" strokeWidth={2.5} />
          Emergency Freeze
        </button>
        <div className="flex items-center justify-between pt-1 text-on-surface-variant font-label-md text-xs">
          <button className="flex items-center gap-1.5 hover:text-structural-ink transition-colors font-bold">
            <Settings className="w-4 h-4" strokeWidth={2.5} />
            Settings
          </button>
          <button className="flex items-center gap-1.5 hover:text-error transition-colors font-bold">
            <LogOut className="w-4 h-4" strokeWidth={2.5} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};