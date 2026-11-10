'use client';

import { useState, useCallback, useMemo } from 'react';
import { Zap, Clock, Coffee, Heart, MapPin, Camera, TrendingUp, Route, Award } from 'lucide-react';

export type TimeGroup = 'now' | 'recent' | 'today';

export interface ActivityItem {
  id: string;
  couple: string;
  action: string;
  location: string;
  time: string;
  timeGroup: TimeGroup;
  icon: React.ElementType;
  iconBg: string;
  borderColor: string;
}

export interface ComunidadStats {
  activeCouples: number;
  checkinsToday: number;
  activeRoutes: number;
}

export interface UseComunidadDataReturn {
  activities: ActivityItem[];
  groupedActivities: Record<TimeGroup, ActivityItem[]>;
  stats: ComunidadStats;
  timeGroups: Array<{ key: TimeGroup; label: string; icon: React.ElementType; color: string; bg: string }>;
  addActivity: (activity: Omit<ActivityItem, 'id'>) => void;
  removeActivity: (id: string) => void;
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

const TIME_GROUPS_CONFIG = [
  { key: 'now' as TimeGroup, label: 'Ahora Mismo', icon: Zap, color: 'text-[#6B8E4E]', bg: 'bg-[#6B8E4E]/10' },
  { key: 'recent' as TimeGroup, label: 'Hace 1 Hora', icon: Clock, color: 'text-[#984628]', bg: 'bg-[#984628]/10' },
  { key: 'today' as TimeGroup, label: 'Hoy en la Mañana', icon: Coffee, color: 'text-[#E59840]', bg: 'bg-[#E59840]/10' },
];

const DEFAULT_STATS: ComunidadStats = {
  activeCouples: 18,
  checkinsToday: 47,
  activeRoutes: 12,
};

export function useComunidadData(initialActivities?: ActivityItem[]): UseComunidadDataReturn {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities || DEFAULT_ACTIVITIES);
  const [stats] = useState<ComunidadStats>(DEFAULT_STATS);

  const groupedActivities = useMemo(() => {
    const groups: Record<TimeGroup, ActivityItem[]> = {
      now: [],
      recent: [],
      today: [],
    };
    activities.forEach(a => groups[a.timeGroup].push(a));
    return groups;
  }, [activities]);

  const addActivity = useCallback((activity: Omit<ActivityItem, 'id'>) => {
    const newActivity = { ...activity, id: Date.now().toString() };
    setActivities(prev => [newActivity, ...prev]);
  }, []);

  const removeActivity = useCallback((id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  }, []);

  return {
    activities,
    groupedActivities,
    stats,
    timeGroups: TIME_GROUPS_CONFIG,
    addActivity,
    removeActivity,
  };
}