'use client';

import Link from 'next/link';
import { Heart, Users } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DuoLinkModal } from './DuoLinkModal';

type PairingMode = 'INDIVIDUAL' | 'DUO' | 'GROUP';

/**
 * Cabecera fija de la pantalla de Inicio.
 *
 * Logo CofiRutas con badge "Oruro 3735M", modo de vinculación (Individual /
 * Dúo / Grupo) mediante el ícono Heart y avatar de la pareja o grupo.
 *
 * El Heart ya no es estático: al hacer clic abre un modal para compartir o
 * escanear el QR de vinculación (Modo Dúo / Grupo) sin salir de Inicio.
 */
export function AppHeader() {
  const { user, isAuthenticated } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  // Determina el modo de vinculación actual a partir de la sesión.
  // Por defecto, uso personal -> Individual.
  const [mode, setMode] = useState<PairingMode>('INDIVIDUAL');

  const displayName =
    mode === 'DUO' ? 'Dúo Activo' : mode === 'GROUP' ? 'Grupo Activo' : 'Individual';

  const handleLinked = () => {
    // Al vincularse exitosamente, pasamos a modo Dúo y cerramos el modal.
    setMode('DUO');
    setModalOpen(false);
  };

  return (
    <header className="fixed top-0 w-full z-50 pt-2 pb-4 bg-[#FAF4EC]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/">
            <Image
              alt="CofiRutas Logo"
              width={64}
              height={64}
              className="h-8 w-auto object-contain shrink-0"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqfCpxTt_0NUx_qjZYZzL3OadR2nTRCG90nn7iKKpNiQjpaiRAWSPNuFxkwRiIfzkswJG47FVpyhEHHVGTgZG3GVAaQ-DL6ZiIHnBZAxfvCqkz5sPl0x1jNKEhP6kc4kSiweKt_hnsbsJJqPyc50j0cnTKiasg90KhCWSTuAy3Z1dh5Fni6XrNxPEQkcOc9UHncE2C6uUFnIRITbj5hFuRsWJ1iF4zFP5CZZBBtCt8"
            />
          </Link>
          <div className="flex flex-col min-w-0">
            <span className="font-[family-name:var(--font-space-grotesk)] text-headline-sm uppercase tracking-tight text-espresso-ink truncate">
              CofiRutas
            </span>
            <div className="inline-flex items-center gap-1 mt-0.5">
              <span className="px-1.5 py-0.5 bg-espresso-ink text-[#FFFFFF] font-[family-name:var(--font-space-grotesk)] text-[9px] font-bold uppercase tracking-wider rounded border border-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A]">
                Oruro 3735M
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Botón de modo de vinculación (Heart) */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                setModalOpen(true);
                return;
              }
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F48E6A] rounded-full shadow-[2px_2px_0px_0px_#1A0F0A] text-[#1A0F0A] border-2 border-espresso-ink"
            aria-label="Modo de vinculación"
          >
            {mode === 'GROUP' ? (
              <Users className="w-4 h-4 text-[#1A0F0A]" />
            ) : (
              <Heart className="w-4 h-4 text-[#1A0F0A]" />
            )}
            <span
              className={`font-[family-name:var(--font-space-grotesk)] text-[12px] tracking-wider uppercase font-bold text-[#1A0F0A] truncate max-w-[130px] ${
                mode === 'INDIVIDUAL'
                  ? 'opacity-60'
                  : 'opacity-100'
              }`}
            >
              {displayName}
            </span>
          </button>

          {/* Avatar de la pareja / usuario */}
          <div className="relative flex items-center justify-center p-0.5 rounded-full border-2 border-espresso-ink bg-[#FFFFFF] shadow-[2px_2px_0px_0px_#1A0F0A]">
            {isAuthenticated && user?.avatarUrl ? (
              <Image
                alt="Perfil"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
                src={user.avatarUrl}
              />
            ) : mode === 'GROUP' ? (
              <Users className="w-8 h-8 text-[#1A0F0A]" />
            ) : (
              <Image
                alt="Carlos y Laura"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhRyqwpk9IvUKenxoQjYqnLdENLU_87-QIG9jwRLnYcPkjBU6QVbAFHXhayih8NmnnlVWeuPzBRiXO6dVgBDizcN6TSuwkDfq34VJ_dQ0PF734J0To-eNM70ZyClEq9R8i2q2NtthbZf93Kt-7ipbzjybmqAFHV7-WmdLJUH3w-aonpbBtvpgTmt5D7RKguINAVqu7ZDdfy7VuVdYm3saXfQtz9R23NKfYQFtFCfS7"
              />
            )}
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
    </header>
  );
}
