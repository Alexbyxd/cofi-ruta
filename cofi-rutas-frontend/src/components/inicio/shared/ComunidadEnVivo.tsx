'use client';

import { Users, Heart, MapPin, Coffee, Zap, Clock, TrendingUp, Route, Award, Camera } from 'lucide-react';

type Variant = 'mobile' | 'desktop';

interface ActivityItem {
  id: string;
  couple: string;
  action: string;
  location: string;
  time: string;
  timeGroup: 'now' | 'recent' | 'today';
  icon: React.ElementType;
  iconBg: string;
  borderColor: string;
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  { id: '1', couple: 'Ana & Miguel', action: 'hicieron match en', location: 'Café del Socavón', time: 'Hace 2 min', timeGroup: 'now', icon: Heart, iconBg: 'bg-[#F48E6A]', borderColor: 'border-[#F48E6A]' },
  { id: '2', couple: 'Sofía & Carlos', action: 'visitaron', location: 'Moccoa Artesanal', time: 'Hace 5 min', timeGroup: 'now', icon: Coffee, iconBg: 'bg-[#984628]', borderColor: 'border-[#984628]' },
  { id: '3', couple: 'Laura & Pablo', action: 'validaron PIN en', location: 'Grano & Alma', time: 'Hace 8 min', timeGroup: 'now', icon: Zap, iconBg: 'bg-[#6B8E4E]', borderColor: 'border-[#6B8E4E]' },
  { id: '4', couple: 'María & José', action: 'completaron ruta', location: 'Circuito Centro Histórico', time: 'Hace 25 min', timeGroup: 'recent', icon: MapPin, iconBg: 'bg-[#E59840]', borderColor: 'border-[#E59840]' },
  { id: '5', couple: 'Carmen & Roberto', action: 'ganaron sello en', location: 'Rincón del Barista', time: 'Hace 42 min', timeGroup: 'recent', icon: Award, iconBg: 'bg-[#6B8E4E]', borderColor: 'border-[#6B8E4E]' },
  { id: '6', couple: 'Patricia & Daniel', action: 'comenzaron ruta', location: 'Ruta Dulce: Churros & Chocolate', time: 'Hace 1h', timeGroup: 'recent', icon: Route, iconBg: 'bg-[#D8B18A]', borderColor: 'border-[#D8B18A]' },
  { id: '7', couple: 'Elena & Fernando', action: 'subieron foto en', location: 'Café Central Oruro', time: '8:30 AM', timeGroup: 'today', icon: Camera, iconBg: 'bg-[#984628]', borderColor: 'border-[#984628]' },
  { id: '8', couple: 'Verónica & Andrés', action: 'desbloquearon badge', location: 'Explorador Nocturno', time: '7:15 AM', timeGroup: 'today', icon: TrendingUp, iconBg: 'bg-[#F48E6A]', borderColor: 'border-[#F48E6A]' },
];

const TIME_GROUPS = [
  { key: 'now' as const, label: 'Ahora Mismo', icon: Zap, color: 'text-[#6B8E4E]', bg: 'bg-[#6B8E4E]/10', iconColor: '#6B8E4E' },
  { key: 'recent' as const, label: 'Hace 1 Hora', icon: Clock, color: 'text-[#984628]', bg: 'bg-[#984628]/10', iconColor: '#984628' },
  { key: 'today' as const, label: 'Hoy en la Mañana', icon: Coffee, color: 'text-[#E59840]', bg: 'bg-[#E59840]/10', iconColor: '#E59840' },
];

const DEFAULT_STATS = {
  activeCouples: 18,
  checkinsToday: 47,
  activeRoutes: 12,
};

interface ComunidadEnVivoProps {
  variant: Variant;
  activities?: ActivityItem[];
  stats?: typeof DEFAULT_STATS;
}

export function ComunidadEnVivo({ variant, activities = DEFAULT_ACTIVITIES, stats = DEFAULT_STATS }: ComunidadEnVivoProps) {
  if (variant === 'mobile') {
    return (
      <div className="p-3 bg-[#EDE7DF] rounded-lg border-2 border-espresso-ink flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#6B8E4E] shrink-0 animate-pulse" />
          <p className="font-[family-name:var(--font-dm-sans)] text-[12px] text-espresso-ink truncate">
            <strong className="font-bold">18 parejas</strong> están explorando cafeterías ahora mismo en el centro de Oruro.
          </p>
        </div>
        <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] uppercase bg-[#FFFFFF] px-2 py-0.5 rounded border border-espresso-ink shrink-0 font-bold text-espresso-ink">
          En Vivo
        </span>
      </div>
    );
  }

  // Desktop variant - Grouped feed for sidebar
  return (
    <aside className="bg-[#FFFFFF] p-4 lg:p-5 rounded-xl border-[3px] border-espresso-ink shadow-[4px_4px_0px_0px_#1A0F0A] flex flex-col space-y-4 sticky top-24 lg:top-28 mt-4 lg:mt-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative p-2 bg-[#6B8E4E] rounded-lg border-2 border-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A]">
            <Users className="w-5 h-5 text-[#FFFFFF]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#6B8E4E] border-2 border-[#FAF4EC] animate-pulse" />
          </div>
          <div>
            <h4 className="font-[family-name:var(--font-space-grotesk)] text-[15px] uppercase text-espresso-ink">
              Comunidad en Vivo
            </h4>
            <span className="font-[family-name:var(--font-dm-sans)] text-[11px] text-[#524437]">
              {stats.activeCouples} parejas explorando ahora
            </span>
          </div>
        </div>
        <span className="px-2 py-1 bg-[#6B8E4E] text-[#FFFFFF] brutal-border rounded shadow-[1px_1px_0px_0px_#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold uppercase flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF] animate-pulse" />
          EN VIVO
        </span>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
        {TIME_GROUPS.map((group) => {
          const groupActivities = activities.filter(a => a.timeGroup === group.key);
          if (groupActivities.length === 0) return null;

          return (
            <div key={group.key} className="space-y-2">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: group.bg.replace('bg-', '') }}>
                <group.icon className="w-4 h-4" style={{ color: group.iconColor }} />
                <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] uppercase font-bold" style={{ color: group.iconColor }}>
                  {group.label}
                </span>
                <span className="ml-auto text-[9px] font-[family-name:var(--font-space-grotesk)] font-bold uppercase" style={{ color: group.iconColor }}>
                  {groupActivities.length}
                </span>
              </div>

              <div className="space-y-1.5 ml-1 border-l-2 border-espresso-ink/20 pl-3">
                {groupActivities.map((activity) => (
                  <div key={activity.id} className="group relative p-2.5 rounded-lg bg-[#FAF4EC]/50 border border-espresso-ink/20 hover:bg-[#F3EDE5] hover:border-espresso-ink/40 transition-all">
                    <div className="flex items-start gap-2">
                      <div className={`p-1.5 rounded border-2 shadow-[1px_1px_0px_0px_#1A0F0A] shrink-0 ${activity.iconBg} ${activity.borderColor}`}>
                        <activity.icon className="w-3.5 h-3.5 text-[#FFFFFF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-[family-name:var(--font-dm-sans)] text-[12px] text-espresso-ink leading-snug">
                          <strong className="font-bold text-[#1A0F0A]">{activity.couple}</strong>{' '}
                          {activity.action}{' '}
                          <strong className="text-[#4A2E1B]">{activity.location}</strong>
                        </p>
                        <p className="font-[family-name:var(--font-space-grotesk)] text-[10px] text-[#795741] font-bold uppercase tracking-wider mt-0.5">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 bg-[#FFFFFF] border border-espresso-ink rounded shadow-[1px_1px_0px_0px_#1A0F0A] text-espresso-ink/60 hover:text-espresso-ink hover:shadow-[2px_2px_0px_0px_#1A0F0A] transition-all">
                        <span className="w-3 h-3">→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t-2 border-espresso-ink flex items-center justify-between">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-[#EDE7DF] rounded-lg border border-espresso-ink">
            <div className="font-[family-name:var(--font-space-grotesk)] text-[18px] font-black text-espresso-ink">{stats.activeCouples}</div>
            <div className="font-[family-name:var(--font-space-grotesk)] text-[9px] uppercase text-[#795741]">Activas</div>
          </div>
          <div className="p-2 bg-[#FFD1B5]/50 rounded-lg border border-espresso-ink">
            <div className="font-[family-name:var(--font-space-grotesk)] text-[18px] font-black text-espresso-ink">{stats.checkinsToday}</div>
            <div className="font-[family-name:var(--font-space-grotesk)] text-[9px] uppercase text-[#795741]">Check-ins</div>
          </div>
          <div className="p-2 bg-[#D8B18A]/30 rounded-lg border border-espresso-ink">
            <div className="font-[family-name:var(--font-space-grotesk)] text-[18px] font-black text-espresso-ink">{stats.activeRoutes}</div>
            <div className="font-[family-name:var(--font-space-grotesk)] text-[9px] uppercase text-[#795741]">Rutas</div>
          </div>
        </div>
      </div>
    </aside>
  );
}