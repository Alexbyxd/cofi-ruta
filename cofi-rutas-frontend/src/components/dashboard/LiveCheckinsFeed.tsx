'use client';

import React from 'react';
import { Zap, Users, User, Shield, AlertTriangle, Clock } from 'lucide-react';

interface CheckinEvent {
  id: string;
  users: string;
  type: 'duo' | 'matcher' | 'solo' | 'alert';
  shop: string;
  consumption: string;
  amount: string;
  pin: string;
  status: 'validated' | 'failed';
  timeAgo: string;
}

const CHECKIN_EVENTS: CheckinEvent[] = [
  {
    id: '1',
    users: 'Carlos & Laura',
    type: 'duo',
    shop: 'Café del Socavón',
    consumption: 'Submarino con Churros',
    amount: '56 Bs',
    pin: '#4821',
    status: 'validated',
    timeAgo: 'Hace 1 min',
  },
  {
    id: '2',
    users: 'Sofía & Mateo',
    type: 'matcher',
    shop: 'Moccoa Artesanal',
    consumption: '2 Flat White + Brownie',
    amount: '44 Bs',
    pin: '#7718',
    status: 'validated',
    timeAgo: 'Hace 4 min',
  },
  {
    id: '3',
    users: 'Alejandro V.',
    type: 'solo',
    shop: 'Café Central Oruro',
    consumption: 'Café Filtrado V60',
    amount: '22 Bs',
    pin: '#9304',
    status: 'validated',
    timeAgo: 'Hace 8 min',
  },
  {
    id: '4',
    users: 'Valeria & Diego',
    type: 'duo',
    shop: 'Grano & Alma',
    consumption: 'Mocaccino + Tarta de Nuez',
    amount: '38 Bs',
    pin: '#5530',
    status: 'validated',
    timeAgo: 'Hace 12 min',
  },
  {
    id: '5',
    users: 'Intento Bloqueado IP 190.181.44',
    type: 'alert',
    shop: 'Sistema Anti-Fraude',
    consumption: 'PIN Erróneo 3 intentos',
    amount: '—',
    pin: '—',
    status: 'failed',
    timeAgo: 'Hace 15 min',
  },
  {
    id: '6',
    users: 'Mariana & Pablo',
    type: 'matcher',
    shop: 'Vainilla & Canela',
    consumption: '2 Submarinos + Waffles',
    amount: '52 Bs',
    pin: '#5530',
    status: 'validated',
    timeAgo: 'Hace 18 min',
  },
  {
    id: '7',
    users: 'Roberto (Solo)',
    type: 'solo',
    shop: 'Café 3735',
    consumption: 'Espresso Doble Altura',
    amount: '18 Bs',
    pin: '#8819',
    status: 'validated',
    timeAgo: 'Hace 22 min',
  },
];

const TYPE_CONFIG = {
  duo: { label: 'Dúo Ruta', color: 'bg-secondary-fixed text-structural-ink', icon: Users },
  matcher: { label: 'Matcher Match', color: 'bg-tertiary-fixed text-structural-ink', icon: Zap },
  solo: { label: 'Explorador', color: 'bg-surface-container-high text-structural-ink', icon: User },
  alert: { label: 'ALERTA FALLO', color: 'bg-error text-on-error', icon: AlertTriangle },
};

export const LiveCheckinsFeed: React.FC = () => {
  return (
    <div className="bg-surface p-6 brutalist-border brutalist-shadow space-y-4">
      <div className="flex items-center justify-between pb-2 brutalist-border-b">
        <div>
          <h4 className="font-headline-sm text-headline-sm uppercase text-structural-ink font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-coffee-leaf" strokeWidth={2.5} />
            Check-ins en Vivo
          </h4>
          <p className="font-body-md text-xs text-on-surface-variant">Feed en tiempo real de transacciones validadas</p>
        </div>
        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-coffee-leaf/10 text-coffee-leaf font-label-md text-xs font-bold brutalist-border">
          <span className="w-2 h-2 rounded-full bg-coffee-leaf animate-pulse" />
          Live Feed
        </span>
      </div>
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {CHECKIN_EVENTS.map((event) => {
          const config = TYPE_CONFIG[event.type];
          const Icon = config.icon;
          const isAlert = event.type === 'alert';

          return (
            <div
              key={event.id}
              className={`p-3 bg-canvas brutalist-border brutalist-shadow-sm flex items-start justify-between gap-3 ${
                isAlert ? 'border-error/50 bg-error/5' : ''
              }`}
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-label-md text-xs font-bold text-structural-ink truncate">{event.users}</span>
                  <span className={`px-1.5 py-0.2 ${config.color} text-[10px] font-label-md font-bold brutalist-border shrink-0`}>
                    {config.label}
                  </span>
                  {isAlert && (
                    <Shield className="w-3 h-3 text-error" strokeWidth={2.5} />
                  )}
                </div>
                <div className="text-xs text-on-surface-variant font-medium truncate">
                  <span className="font-bold text-structural-ink">{event.shop}</span> • {event.consumption}
                </div>
                <div className="text-[11px] font-label-md text-primary font-bold">
                  Consumo: {event.amount} | PIN: {event.pin}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] font-label-md text-on-surface-variant font-bold">{event.timeAgo}</span>
                <span className={`px-2 py-0.5 text-[10px] font-label-md font-bold uppercase brutalist-border ${
                  event.status === 'validated'
                    ? 'bg-coffee-leaf text-surface'
                    : 'bg-error text-on-error'
                }`}>
                  {event.status === 'validated' ? 'Validado' : 'Bloqueado'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="pt-2 brutalist-border-t flex items-center justify-between text-xs">
        <span className="text-on-surface-variant font-label-md">
          Auto-refresh: <span className="font-bold text-coffee-leaf">ON</span> | Filtro: Todos
        </span>
        <button className="px-2 py-1 bg-surface-container-high brutalist-border font-label-md font-bold hover:bg-surface-container-highest transition-colors">
          Ver Historial Completo
        </button>
      </div>
    </div>
  );
};