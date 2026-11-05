'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Users, Compass, Coffee, CheckCircle2, Crown, Map, Home } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DuoLinkModal } from '../DuoLinkModal';

type PairingMode = 'INDIVIDUAL' | 'DUO' | 'GROUP';

/**
 * Desktop AppHeader: full-width fixed header with top navigation.
 * - Left: Logo + Oruro badge
 * - Center: Nav links (Inicio, Rutas, Matcher, Check-In, Pasaporte) + Geo/Weather badge
 * - Right: CofiDúo badge + linked avatars
 */
export function DesktopAppHeader() {
  const { user, isAuthenticated } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<PairingMode>('INDIVIDUAL');

  const displayName =
    mode === 'DUO' ? 'Dúo Activo' : mode === 'GROUP' ? 'Grupo Activo' : 'Individual';

  const handleLinked = () => {
    setMode('DUO');
    setModalOpen(false);
  };

  const navItems = [
    { href: '/inicio', label: 'Inicio', icon: Home },
    { href: '/explorar', label: 'Rutas', icon: Map },
    { href: '/matcher', label: 'Matcher', icon: Coffee },
    { href: '/check-in', label: 'Check-In', icon: CheckCircle2 },
    { href: '/duo', label: 'Pasaporte', icon: Crown },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[#FAF4EC]/95 backdrop-blur-xl border-b-[3px] border-espresso-ink shadow-[0_2px_8px_rgba(26,15,10,0.06)]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="h-20 flex items-center justify-between gap-4">
          {/* LEFT: Logo + Badge */}
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            <Link href="/inicio" className="flex items-center gap-2">
              <Image
                alt="CofiRutas Logo"
                width={64}
                height={64}
                className="h-10 w-auto object-contain shrink-0"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqfCpxTt_0NUx_qjZYZzL3OadR2nTRCG90nn7iKKpNiQjpaiRAWSPNuFxkwRiIfzkswJG47FVpyhEHHVGTgZG3GVAaQ-DL6ZiIHnBZAxfvCqkz5sPl0x1jNKEhP6kc4kSiweKt_hnsbsJJqPyc50j0cnTKiasg90KhCWSTuAy3Z1dh5Fni6XrNxPEQkcOc9UHncE2C6uUFnIRITbj5hFuRsWJ1iF4zFP5CZZBBtCt8"
              />
              <div className="flex flex-col min-w-0 hidden sm:block">
                <span className="font-[family-name:var(--font-space-grotesk)] text-headline-sm uppercase tracking-tight text-espresso-ink truncate">
                  CofiRutas
                </span>
                <span className="px-2 py-0.5 bg-espresso-ink text-[#FFFFFF] font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold uppercase tracking-wider rounded border border-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A] whitespace-nowrap">
                  Oruro 3735M
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER: Nav + Geo Badge */}
          <div className="flex items-center gap-6 flex-1 justify-center min-w-0">
            <nav className="hidden lg:flex items-center gap-1" aria-label="Navegación principal">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-1.5 px-3 py-2 text-espresso-ink font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold uppercase tracking-wider rounded-lg border-2 border-transparent hover:border-espresso-ink hover:bg-[#EDE7DF] hover:shadow-[2px_2px_0px_0px_#1A0F0A] transition-all"
                    aria-label={item.label}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Geo/Weather Badge - always visible on desktop */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#FFFFFF] border-[3px] border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A] rounded-lg">
              <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] uppercase text-espresso-ink font-bold flex items-center gap-1">
                <Map className="w-3 h-3" />
                ORURO · 3.735 MSNM
              </span>
              <span className="px-1.5 py-0.5 bg-[#F48E6A] text-espresso-ink font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold uppercase rounded border border-espresso-ink">
                -2°C Sensación
              </span>
              <span className="px-1.5 py-0.5 bg-[#D8B18A] text-espresso-ink font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold uppercase rounded border border-espresso-ink rotate-3">
                🇧🇴 100% Boliviano
              </span>
            </div>
          </div>

          {/* RIGHT: CofiDúo Badge + Avatars */}
          <div className="flex items-center gap-3 shrink-0">
            {/* CofiDúo Status Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#E59840] border-[3px] border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A] rounded-lg">
              <Heart className="w-4 h-4 text-espresso-ink" />
              <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] uppercase text-espresso-ink font-bold">
                Carlos & Laura ☕
              </span>
              <span className="px-1.5 py-0.5 bg-espresso-ink text-[#FFFFFF] font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold uppercase rounded border border-espresso-ink">
                Día 125
              </span>
            </div>

            {/* Pairing Mode Button */}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F48E6A] rounded-full shadow-[2px_2px_0px_0px_#1A0F0A] text-[#1A0F0A] border-2 border-espresso-ink hover:shadow-[3px_3px_0px_0px_#1A0F0A] transition-shadow"
              aria-label="Modo de vinculación"
            >
              {mode === 'GROUP' ? <Users className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
              <span className={`font-[family-name:var(--font-space-grotesk)] text-[11px] tracking-wider uppercase font-bold text-[#1A0F0A] truncate max-w-[120px] ${mode === 'INDIVIDUAL' ? 'opacity-60' : 'opacity-100'}`}>
                {displayName}
              </span>
            </button>

            {/* Linked Avatars */}
            <div className="flex -space-x-2">
              {isAuthenticated && user?.avatarUrl ? (
                <Image
                  alt="Tu perfil"
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover border-2 border-espresso-ink bg-[#FFFFFF] shadow-[2px_2px_0px_0px_#1A0F0A]"
                  src={user.avatarUrl}
                />
              ) : (
                <Image
                  alt="Carlos y Laura"
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover border-2 border-espresso-ink bg-[#FFFFFF] shadow-[2px_2px_0px_0px_#1A0F0A]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhRyqwpk9IvUKenxoQjYqnLdENLU_87-QIG9jwRLnYcPkjBU6QVbAFHXhayih8NmnnlVWeuPzBRiXO6dVgBDizcN6TSuwkDfq34VJ_dQ0PF734J0To-eNM70ZyClEq9R8i2q2NtthbZf93Kt-7ipbzjybmqAFHV7-WmdLJUH3w-aonpbBtvpgTmt5D7RKguINAVqu7ZDdfy7VuVdYm3saXfQtz9R23NKfYQFtFCfS7"
                />
              )}
              <div className="w-9 h-9 rounded-full border-2 border-espresso-ink bg-[#E59840] flex items-center justify-center shadow-[2px_2px_0px_0px_#1A0F0A] ml-1">
                <Heart className="w-5 h-5 text-espresso-ink" />
              </div>
            </div>

            {/* Modal de vinculación */}
            {modalOpen && (
              <DuoLinkModal
                onClose={() => setModalOpen(false)}
                onLinked={handleLinked}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}