'use client';

import { Palette, Map, QrCode, BookOpen, Route, Camera, HeartPulse, Sparkles } from 'lucide-react';
import Link from 'next/link';

type Variant = 'mobile' | 'desktop';

const ICON_MAP = {
  palette: Palette,
  map: Map,
  qr_code: QrCode,
  book: BookOpen,
  route: Route,
  camera: Camera,
  heart: HeartPulse,
  sparkles: Sparkles,
};

interface QuickActionItem {
  icon: keyof typeof ICON_MAP;
  badge: string;
  title: string;
  subtitle: string;
  href: string;
  bg: string;
  text: string;
}

const ACTIONS: QuickActionItem[] = [
  { icon: 'palette', badge: 'SWIPE', title: 'CofiMatcher', subtitle: 'Hagan match de antojo', href: '/matcher', bg: 'bg-[#984628]', text: 'text-[#FFFFFF]' },
  { icon: 'route', badge: '12 SPOTS', title: 'Explorar Rutas', subtitle: 'Cafés de altura cerca', href: '/explorar', bg: 'bg-[#FFFFFF]', text: 'text-espresso-ink' },
  { icon: 'qr_code', badge: '+50 PTS', title: 'Validar PIN', subtitle: 'Check-in rápido en mesa', href: '/check-in', bg: 'bg-[#6B8E4E]', text: 'text-[#FFFFFF]' },
  { icon: 'book', badge: '24 FOTOS', title: 'Diario Dúo', subtitle: 'Recuerdos & notas', href: '/duo', bg: 'bg-[#D8B18A]', text: 'text-espresso-ink' },
];

interface QuickActionsProps {
  variant: Variant;
}

export function QuickActions({ variant }: QuickActionsProps) {
  if (variant === 'mobile') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] uppercase text-espresso-ink font-bold tracking-wider">
            Acciones Rápidas
          </span>
          <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] text-[#795741] font-bold">
            Atajos de Mesa
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ACTIONS.map((action) => {
            const Icon = ICON_MAP[action.icon];
            return (
              <Link
                key={action.title}
                href={action.href}
                className={`flex flex-col justify-between p-3.5 ${action.bg} ${action.text} rounded-lg border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all min-h-[110px]`}
              >
                <div className="flex justify-between items-start">
                  <Icon className={`w-5 h-5 bg-espresso-ink text-[#FFFFFF] p-1 rounded border border-[#FFFFFF]`} />
                  <span className="text-[10px] font-[family-name:var(--font-space-grotesk)] font-bold bg-[#FFFFFF] text-espresso-ink px-1 rounded">
                    {action.badge}
                  </span>
                </div>
                <div>
                  <span className="font-[family-name:var(--font-space-grotesk)] text-[16px] uppercase block leading-tight">
                    {action.title}
                  </span>
                  <span className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[#524437] opacity-90">
                    {action.subtitle}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop variant - 2x2 grid with hover effects
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-space-grotesk)] text-[14px] uppercase text-espresso-ink font-bold tracking-wider">
          Acciones Rápidas
        </h3>
        <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] text-[#795741] font-bold hidden sm:block">
          Atajos de Mesa
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        {ACTIONS.map((action) => {
          const Icon = ICON_MAP[action.icon];
          return (
            <Link
              key={action.title}
              href={action.href}
              className={`group flex flex-col justify-between p-4 ${action.bg} ${action.text} rounded-xl border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all min-h-[120px] hover:shadow-[6px_6px_0px_0px_#1A0F0A] hover:-translate-y-0.5 hover:-translate-x-0.5`}
            >
              <div className="flex justify-between items-start">
                <Icon className={`w-6 h-6 bg-espresso-ink text-[#FFFFFF] p-1.5 rounded border-2 border-[#FFFFFF] shadow-[2px_2px_0px_0px_#1A0F0A] group-hover:rotate-6 transition-transform`} />
                <span className="text-[10px] font-[family-name:var(--font-space-grotesk)] font-bold bg-[#FFFFFF] text-espresso-ink px-2 py-0.5 rounded border border-espresso-ink shadow-[1px_1px_0px_0px_#1A0F0A]">
                  {action.badge}
                </span>
              </div>
              <div>
                <span className="font-[family-name:var(--font-space-grotesk)] text-[18px] uppercase block leading-tight group-hover:tracking-wider transition-all">
                  {action.title}
                </span>
                <span className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#524437] opacity-90 mt-0.5 block">
                  {action.subtitle}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}