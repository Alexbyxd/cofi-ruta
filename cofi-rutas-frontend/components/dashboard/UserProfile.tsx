'use client';

import React from 'react';
import { ShieldCheck, User } from 'lucide-react';
import type { AuthUser } from '@/types/auth';

export interface UserProfileProps {
  user: AuthUser;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const initials = user.fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarUrl = user.avatarUrl || undefined;

  return (
    <section className="w-full px-4 sm:px-6 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Avatar Card */}
        <div className="relative flex flex-col items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`Avatar de ${user.fullName}`}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] object-cover bg-surface-card"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] flex items-center justify-center bg-surface-card text-espresso-ink font-black text-sm sm:text-base uppercase">
                {initials || '?'}
              </div>
            )}
            <ShieldCheck
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-badge-matcha text-white border-[2px] border-white rounded-full shadow-[2px_2px_0px_0px_#1A0F0A]"
              strokeWidth={2.5}
            />
          </div>
          <p className="font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider text-espresso-ink/80">
            Pasaporte Cafetero
          </p>
        </div>

        {/* User Info */}
        <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-col sm:items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container border-[3px] border-espresso-ink rounded-lg shadow-[2px_2px_0px_0px_#1A0F0A]">
            <User className="w-4 h-4 shrink-0 text-espresso-ink" strokeWidth={2.5} />
            <span className="font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider text-espresso-ink">
              Cuenta verificada con Google
            </span>
          </div>

          <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl sm:text-3xl font-black uppercase text-espresso-ink tracking-tight">
            {user.fullName}
          </h2>

          <p className="font-[family-name:var(--font-dm-sans)] text-base text-on-surface-variant font-medium">
            {user.email}
          </p>

          {user.role && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container border-[2px] border-espresso-ink rounded text-[10px] font-bold uppercase tracking-wider text-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A]">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              {user.role}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 w-full">
        <p className="font-[family-name:var(--font-dm-sans)] text-xs text-on-surface-variant/70 font-medium">
          Bienvenido de vuelta a tu pasaporte cafetero en Oruro. Desde aquí
          podés gestionar tus citas de pareja, tus check-ins y tu diario CofiDúo.
        </p>
      </div>
    </section>
  );
};
