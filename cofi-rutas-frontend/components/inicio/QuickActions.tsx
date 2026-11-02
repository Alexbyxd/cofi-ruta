'use client';

import { Palette, Map, QrCode, BookOpen } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  style: Palette,
  map: Map,
  qr_code_scanner: QrCode,
  menu_book: BookOpen,
};

/**
 * Hub de acciones rápidas: 4 tarjetas neobrutalistas (Matcher, Rutas, PIN, Diario).
 */
export function QuickActions() {
  const actions = [
    {
      icon: 'style',
      badge: 'SWIPE',
      title: 'CofiMatcher',
      subtitle: 'Hagan match de antojo',
      bg: 'bg-[#984628]',
      text: 'text-[#FFFFFF]',
    },
    {
      icon: 'map',
      badge: '12 SPOTS',
      title: 'Explorar Rutas',
      subtitle: 'Cafés de altura cerca',
      bg: 'bg-[#FFFFFF]',
      text: 'text-espresso-ink',
    },
    {
      icon: 'qr_code_scanner',
      badge: '+50 PTS',
      title: 'Validar PIN',
      subtitle: 'Check-in rápido en mesa',
      bg: 'bg-[#6B8E4E]',
      text: 'text-[#FFFFFF]',
    },
    {
      icon: 'menu_book',
      badge: '24 FOTOS',
      title: 'Diario Dúo',
      subtitle: 'Recuerdos & notas',
      bg: 'bg-[#D8B18A]',
      text: 'text-espresso-ink',
    },
  ];

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
        {actions.map((action) => {
          const Icon = ICON_MAP[action.icon];
          return (
            <a
              key={action.title}
              href="#"
              className={`flex flex-col justify-between p-3.5 ${action.bg} ${action.text} rounded-lg border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all min-h-[110px]`}
            >
              <div className="flex justify-between items-start">
                <Icon
                  className={`w-5 h-5 bg-espresso-ink text-[#FFFFFF] p-1 rounded border border-[#FFFFFF]`}
                />
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
            </a>
          );
        })}
      </div>
    </div>
  );
}
