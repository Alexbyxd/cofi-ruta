'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Shield, Send, RefreshCw, Edit, Menu, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface SuperadminHeaderProps {
  onMenuClick?: () => void;
  onPinGeneratorClick?: () => void;
  onToggleCollapse?: () => void;
  sidebarCollapsed?: boolean;
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
    role: string;
  };
}

export const SuperadminHeader: React.FC<SuperadminHeaderProps> = ({
  onMenuClick,
  onPinGeneratorClick,
  onToggleCollapse,
  sidebarCollapsed = false,
  user,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      if (event.key === 'Escape') {
        setShowSearch(false);
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const displayName = user?.name || 'Admin Central Oruro';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 w-full bg-canvas h-16 brutalist-border-b bg-[#FFFDF5]">
      {/* Left: Brand / Menu / Search (mobile) */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 bg-surface brutalist-border brutalist-shadow-sm flex items-center justify-center hover:bg-surface-container-high transition-colors"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5 text-structural-ink" strokeWidth={2.5} />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex w-10 h-10 bg-surface brutalist-border brutalist-shadow-sm flex items-center justify-center hover:bg-surface-container-high transition-colors"
          aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5 text-structural-ink" strokeWidth={2.5} />
          ) : (
            <ChevronLeft className="w-5 h-5 text-structural-ink" strokeWidth={2.5} />
          )}
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-10 h-10 bg-primary-container brutalist-border brutalist-shadow-sm flex items-center justify-center font-headline-sm font-bold text-structural-ink shrink-0">
            CR
          </div>
          <div className="hidden sm:flex flex-col min-w-0">
            <span className="text-headline-sm font-headline-sm font-bold tracking-tight text-structural-ink leading-tight truncate">
              COFIRUTAS SUPERADMIN
            </span>
            <span className="text-[11px] font-label-md font-bold tracking-wider text-on-surface-variant flex items-center gap-1 truncate">
              <span className="material-symbols-outlined text-[12px] text-terracotta" style={{ fontVariationSettings: "'FILL' 1" }}>
                landscape
              </span>
              ORURO 3.735M ALTITUD HQ
            </span>
          </div>
        </div>

        {/* Live Status Badge (desktop only) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-surface-container-high brutalist-border brutalist-shadow-sm rounded">
          <span className="w-2.5 h-2.5 rounded-full bg-coffee-leaf animate-pulse" />
          <span className="font-label-md text-xs font-bold text-structural-ink">SISTEMA ONLINE - ORURO 3735M</span>
        </div>
      </div>

      {/* Center: Search & Navigation (desktop) */}
      <div className="hidden xl:flex items-center gap-6">
        <nav className="flex items-center gap-6">
          <a className="font-label-md text-label-md text-primary font-bold border-b-2 border-primary pb-0.5" href="#metrics">
            Live Metrics
          </a>
          <a className="font-label-md text-label-md text-on-surface-variant font-bold hover:text-structural-ink transition-colors" href="#system">
            System Status
          </a>
          <a className="font-label-md text-label-md text-on-surface-variant font-bold hover:text-structural-ink transition-colors" href="#audit">
            Audit Log
          </a>
        </nav>

        {/* Search Input with Kbd */}
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            className="w-64 bg-surface text-structural-ink text-body-md px-3 py-1.5 pl-9 brutalist-border brutalist-shadow-sm focus:outline-none focus:ring-0 focus:border-structural-ink rounded-none"
            placeholder="Buscar cafetería, PIN, usuario..."
            aria-label="Búsqueda global"
          />
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-structural-ink text-base">
            search
          </span>
          <kbd className="absolute right-2 top-2 px-1.5 py-0.5 bg-surface-container-highest brutalist-border text-[10px] font-label-md font-bold text-structural-ink">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Mobile Search Trigger */}
        <button
          onClick={() => setShowSearch(true)}
          className="lg:hidden w-10 h-10 bg-surface brutalist-border brutalist-shadow-sm flex items-center justify-center hover:bg-surface-container-high transition-colors"
          aria-label="Buscar"
        >
          <Search className="w-5 h-5 text-structural-ink" strokeWidth={2.5} />
        </button>

        {/* Daily PIN Generator Button */}
        <button
          onClick={onPinGeneratorClick}
          className="brutalist-btn bg-primary-container px-3.5 py-1.5 brutalist-border brutalist-shadow-sm font-label-md text-label-md font-bold text-structural-ink flex items-center gap-2 hover:bg-primary-action transition-all hidden sm:flex"
          aria-label="Generador de PIN Diario"
        >
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            pin
          </span>
          <span>Daily PIN Generator</span>
        </button>

        {/* Mobile PIN Generator */}
        <button
          onClick={onPinGeneratorClick}
          className="brutalist-btn bg-primary-container px-3 py-1.5 brutalist-border brutalist-shadow-sm font-label-md text-label-md font-bold text-structural-ink flex items-center gap-2 hover:bg-primary-action transition-all lg:hidden"
          aria-label="Generador de PIN Diario"
        >
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            pin
          </span>
        </button>

        {/* Notifications */}
        <button
          className="w-9 h-9 bg-surface brutalist-border brutalist-shadow-sm flex items-center justify-center hover:bg-surface-container-high transition-colors"
          title="Audit Notifications"
          aria-label="Notificaciones de auditoría"
        >
          <Bell className="w-5 h-5 text-structural-ink" strokeWidth={2.5} />
        </button>

        {/* Security Status */}
        <button
          className="w-9 h-9 bg-surface brutalist-border brutalist-shadow-sm flex items-center justify-center hover:bg-surface-container-high transition-colors"
          title="Security Status: Enforced"
          aria-label="Estado de seguridad"
        >
          <Shield className="w-5 h-5 text-coffee-leaf" strokeWidth={2.5} style={{ fontVariationSettings: "'FILL' 1" }} />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 border-l-2 border-structural-ink"
            aria-expanded={showProfileMenu}
            aria-haspopup="true"
          >
            <div className="relative">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={`Avatar de ${displayName}`}
                  className="w-9 h-9 brutalist-border brutalist-shadow-sm object-cover bg-surface-container-highest rounded-full"
                />
              ) : (
                <div className="w-9 h-9 rounded-full border-[3px] border-espresso-ink brutalist-shadow-sm flex items-center justify-center bg-surface-container-highest text-espresso-ink font-black text-sm uppercase">
                  {initials || '?'}
                </div>
              )}
            </div>
            <div className="hidden 2xl:flex flex-col text-left">
              <span className="font-label-md text-xs font-bold text-structural-ink leading-tight truncate max-w-[160px]">
                {displayName}
              </span>
              <span className="text-[10px] font-body-md text-on-surface-variant font-bold">Superadmin Root</span>
            </div>
            <ChevronDown className="w-4 h-4 text-on-surface-variant hidden 2xl:block" strokeWidth={2.5} />
          </button>

          {showProfileMenu && (
            <div
              ref={profileMenuRef}
              className="absolute right-0 top-full mt-2 w-56 bg-surface brutalist-border brutalist-shadow-lg rounded-lg overflow-hidden z-50"
            >
              <div className="p-3 bg-surface-container-low brutalist-border-b">
                <p className="font-headline-sm text-xs font-bold text-structural-ink truncate">{displayName}</p>
                <p className="text-[11px] text-on-surface-variant truncate">{user?.email}</p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-fixed text-structural-ink text-[10px] font-label-md font-bold uppercase brutalist-border mt-1">
                  {user?.role || 'SUPERADMIN'}
                </span>
              </div>
              <div className="p-2 space-y-1">
                <button className="w-full flex items-center gap-2 px-2 py-1.5 text-on-surface-variant hover:text-structural-ink hover:bg-surface-container-high rounded font-label-md text-xs font-bold transition-colors">
                  <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
                  Actualizar Sesión
                </button>
                <button className="w-full flex items-center gap-2 px-2 py-1.5 text-on-surface-variant hover:text-structural-ink hover:bg-surface-container-high rounded font-label-md text-xs font-bold transition-colors">
                  <Edit className="w-4 h-4" strokeWidth={2.5} />
                  Configuración
                </button>
                <hr className="border-structural-ink/20 my-1" />
                <button className="w-full flex items-center gap-2 px-2 py-1.5 text-error hover:bg-surface-container-high rounded font-label-md text-xs font-bold transition-colors">
                  <Send className="w-4 h-4" strokeWidth={2.5} />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showSearch && window.innerWidth < 1024 && (
        <div className="fixed inset-0 z-[60] bg-canvas/95 backdrop-blur-sm flex items-start justify-center pt-20 lg:hidden">
          <div className="w-full max-w-md mx-4">
            <div className="relative bg-surface brutalist-border brutalist-shadow-lg">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-surface text-structural-ink text-body-lg px-4 py-3 pl-12 brutalist-border-0 focus:outline-none"
                placeholder="Buscar cafetería, PIN, usuario..."
                aria-label="Búsqueda global"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-structural-ink text-xl">
                search
              </span>
              <button
                onClick={() => setShowSearch(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-on-surface-variant hover:text-structural-ink"
              >
                <X className="w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>
            <p className="text-center text-xs text-on-surface-variant mt-2">Presioná Esc para cerrar</p>
          </div>
        </div>
      )}
    </header>
  );
};

// CSS-in-JS brutalist classes for buttons
const brutalistStyles = `
  .brutalist-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px 0px #1A0F0A;
  }
  .brutalist-border { border: 3px solid #1A0F0A; }
  .brutalist-border-b { border-bottom: 3px solid #1A0F0A; }
  .brutalist-shadow-sm { box-shadow: 2px 2px 0px 0px #1A0F0A; }
  .brutalist-shadow { box-shadow: 4px 4px 0px 0px #1A0F0A; }
  .brutalist-shadow-lg { box-shadow: 8px 8px 0px 0px #1A0F0A; }
`;