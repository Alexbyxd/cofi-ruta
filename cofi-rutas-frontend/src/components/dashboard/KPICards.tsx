'use client';

import React from 'react';
import { TrendingUp, Users, Store, CheckCircle, Star, Heart, Zap, Activity, DollarSign } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  icon: React.ElementType;
  iconColor: string;
  badge?: string;
  badgeColor: string;
  footerLeft?: string;
  footerRight?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changePositive = true,
  icon: Icon,
  iconColor,
  badge,
  badgeColor,
  footerLeft,
  footerRight,
}) => {
  return (
    <div className="bg-surface p-4 brutalist-border brutalist-shadow brutalist-card transition-all">
      <div className="flex items-center justify-between">
        <span className="font-label-md text-xs font-bold uppercase text-on-surface-variant">{title}</span>
        {badge && (
          <span className={`px-2 py-0.5 ${badgeColor} font-label-md text-[10px] brutalist-border font-bold`}>
            {badge}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="font-headline-lg text-headline-lg font-bold text-structural-ink tracking-tight">{value}</span>
        {change && (
          <span className={`font-label-md text-xs font-bold flex items-center ${changePositive ? 'text-coffee-leaf' : 'text-error'}`}>
            <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
            {change}
          </span>
        )}
      </div>
      {(footerLeft || footerRight) && (
        <div className="mt-2 pt-2 border-t border-dashed border-outline-variant flex justify-between text-xs text-on-surface-variant">
          {footerLeft && <span>{footerLeft}</span>}
          {footerRight && <span className="font-bold text-structural-ink">{footerRight}</span>}
        </div>
      )}
    </div>
  );
};

const KPI_DATA = [
  {
    title: 'Usuarios Totales',
    value: '1,420',
    change: '+12%',
    icon: Users,
    iconColor: 'text-primary-container',
    badge: '#OruroActivo',
    badgeColor: 'bg-electric-cyan text-structural-ink',
    footerLeft: 'Nuevos hoy: +38',
    footerRight: '92% verificados',
  },
  {
    title: 'Cafeterías Red',
    value: '18',
    change: undefined,
    icon: Store,
    iconColor: 'text-coffee-leaf',
    badge: 'Verificadas',
    badgeColor: 'bg-primary-action text-structural-ink',
    footerLeft: '2 cerradas (descanso)',
    footerRight: 'Oruro Centro',
  },
  {
    title: 'PINs Validados',
    value: '3,892',
    change: undefined,
    icon: CheckCircle,
    iconColor: 'text-terracotta',
    badge: 'Certificados',
    badgeColor: 'bg-secondary-fixed text-structural-ink',
    footerLeft: 'Fallos: 1.6%',
    footerRight: 'Anti-fraude OK',
  },
  {
    title: 'Reseñas y Notas',
    value: '842',
    change: '+24 hoy',
    icon: Star,
    iconColor: 'text-primary',
    badge: '★ 4.8',
    badgeColor: 'bg-primary-fixed text-structural-ink',
    footerLeft: 'Mocaccino top #1',
    footerRight: '94% fotos',
  },
  {
    title: 'Parejas Dúo',
    value: '614',
    change: '+18 vinc.',
    icon: Heart,
    iconColor: 'text-secondary-container',
    badge: 'Social',
    badgeColor: 'bg-secondary-container text-structural-ink',
    footerLeft: 'Rutas completadas: 142',
    footerRight: 'Sello Doble',
  },
  {
    title: 'Sesiones Matcher',
    value: '1,205',
    change: '342 matches',
    icon: Zap,
    iconColor: 'text-tertiary-fixed',
    badge: 'Algoritmo',
    badgeColor: 'bg-tertiary-fixed text-structural-ink',
    footerLeft: 'Café Socavón favorito',
    footerRight: '28% match rate',
  },
  {
    title: 'Check-ins Hoy',
    value: '184',
    change: '+32% pico',
    icon: Activity,
    iconColor: 'text-coffee-leaf',
    badge: 'En Vivo',
    badgeColor: 'bg-coffee-leaf text-surface',
    footerLeft: 'Hora punta: 17:30',
    footerRight: 'Tarde fría',
  },
  {
    title: 'Consumo Impulsado',
    value: '48,920 Bs',
    change: '+8.2%',
    icon: DollarSign,
    iconColor: 'text-primary-container',
    badge: 'Económico',
    badgeColor: 'bg-primary-container text-structural-ink',
    footerLeft: 'Ticket prom: 38 Bs',
    footerRight: '18 Locales',
  },
];

export const KPICards: React.FC = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-headline-sm text-headline-sm uppercase text-structural-ink tracking-tight flex items-center gap-2">
          <span className="w-3 h-3 bg-primary-container brutalist-border inline-block" />
          Métricas Clave del Ecosistema
        </h3>
        <span className="font-label-md text-xs text-on-surface-variant uppercase font-bold">Actualizado hace 2 min</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_DATA.map((data, index) => (
          <KPICard
            key={index}
            title={data.title}
            value={data.value}
            change={data.change}
            icon={data.icon}
            iconColor={data.iconColor}
            badge={data.badge}
            badgeColor={data.badgeColor}
            footerLeft={data.footerLeft}
            footerRight={data.footerRight}
          />
        ))}
      </div>
    </div>
  );
};