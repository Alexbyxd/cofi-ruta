'use client';

import React from 'react';
import { RefreshCw, Edit, MapPin, Users, Shield } from 'lucide-react';

interface CoffeeShopRow {
  id: string;
  name: string;
  shortName: string;
  specialty: string;
  address: string;
  pin: string;
  baristas: number;
  status: 'open' | 'closed';
}

const COFFEE_SHOPS_DATA: CoffeeShopRow[] = [
  { id: 'cs1', name: 'Café del Socavón', shortName: 'CS', specialty: 'Especialidad Typica', address: 'Calle Murguía #420', pin: '4821', baristas: 3, status: 'open' },
  { id: 'cs2', name: 'Café Central Oruro', shortName: 'CC', specialty: 'Tradicional & Pastelería', address: 'Plaza 10 de Febrero #12', pin: '9304', baristas: 4, status: 'open' },
  { id: 'cs3', name: 'Moccoa Artesanal', shortName: 'MA', specialty: 'Micro-lotes Caranavi', address: 'Calle La Plata #89', pin: '7718', baristas: 2, status: 'open' },
  { id: 'cs4', name: 'Grano & Alma', shortName: 'GA', specialty: 'Tostaduría en Vivo', address: 'Calle Bolívar & 6 de Octubre', pin: '----', baristas: 1, status: 'closed' },
  { id: 'cs5', name: 'Vainilla & Canela', shortName: 'VC', specialty: 'Cafetería & Waffles', address: 'Av. 6 de Agosto #104', pin: '5530', baristas: 3, status: 'open' },
  { id: 'cs6', name: 'El Rincón Café', shortName: 'RC', specialty: 'Espresso & Brunch', address: 'Calle Sucre #210', pin: '3342', baristas: 2, status: 'open' },
  { id: 'cs7', name: 'Café 3735', shortName: 'C37', specialty: 'Altura Extrema', address: 'Av. Cívica #55', pin: '8819', baristas: 2, status: 'open' },
  { id: 'cs8', name: 'La Tahona', shortName: 'LT', specialty: 'Panadería & Café', address: 'Calle Potosí #78', pin: '1205', baristas: 3, status: 'closed' },
];

export const CoffeeShopsTable: React.FC = () => {
  return (
    <div className="bg-surface p-6 brutalist-border brutalist-shadow space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 brutalist-border-b">
        <div>
          <h4 className="font-headline-sm text-headline-sm uppercase text-structural-ink font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-terracotta" strokeWidth={2.5} />
            Cafeterías de Oruro - Estado & PIN Activo
          </h4>
          <p className="font-body-md text-xs text-on-surface-variant">Monitoreo y rotación de tokens por establecimiento</p>
        </div>
        <span className="px-2.5 py-1 bg-surface-container-high brutalist-border text-xs font-label-md font-bold self-start">
          {COFFEE_SHOPS_DATA.length} Registradas
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low font-label-md text-xs uppercase text-structural-ink brutalist-border">
              <th className="p-3">Cafetería</th>
              <th className="p-3">Ubicación / Zona</th>
              <th className="p-3">PIN Diario</th>
              <th className="p-3">Baristas</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-structural-ink/20 font-body-md text-xs">
            {COFFEE_SHOPS_DATA.map((shop) => (
              <tr key={shop.id} className="hover:bg-canvas transition-colors">
                <td className="p-3 font-bold text-structural-ink flex items-center gap-2">
                  <div className="w-7 h-7 bg-primary-fixed brutalist-border flex items-center justify-center font-bold text-xs">
                    {shop.shortName}
                  </div>
                  <div>
                    <div className="font-label-md font-bold">{shop.name}</div>
                    <div className="text-[10px] text-on-surface-variant font-normal">{shop.specialty}</div>
                  </div>
                </td>
                <td className="p-3 text-on-surface-variant font-medium">{shop.address}</td>
                <td className="p-3">
                  <span className="bg-primary-action px-2 py-0.5 brutalist-border font-label-md font-bold tracking-widest text-structural-ink font-mono">
                    {shop.pin}
                  </span>
                </td>
                <td className="p-3 font-label md">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-on-surface-variant" strokeWidth={2.5} />
                    <span>{shop.baristas} activos</span>
                  </div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 font-label-md text-[10px] font-bold uppercase brutalist-border ${
                    shop.status === 'open'
                      ? 'bg-coffee-leaf text-surface'
                      : 'bg-surface-container-highest text-structural-ink'
                  }`}>
                    {shop.status === 'open' ? 'Abierto' : 'Cerrado'}
                  </span>
                </td>
                <td className="p-3 text-right space-x-1">
                  <button
                    className="p-1 brutalist-border bg-surface hover:bg-surface-container-high transition-colors"
                    title="Regenerar PIN"
                    aria-label={`Regenerar PIN para ${shop.name}`}
                  >
                    <RefreshCw className="w-4 h-4 text-structural-ink" strokeWidth={2.5} />
                  </button>
                  <button
                    className="p-1 brutalist-border bg-surface hover:bg-surface-container-high transition-colors"
                    title="Editar Ficha"
                    aria-label={`Editar ficha de ${shop.name}`}
                  >
                    <Edit className="w-4 h-4 text-structural-ink" strokeWidth={2.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pt-2 flex items-center justify-between text-xs font-label-md">
        <span className="text-on-surface-variant">Mostrando {COFFEE_SHOPS_DATA.length} de {COFFEE_SHOPS_DATA.length} locales</span>
        <div className="flex gap-1">
          <button className="px-2 py-1 bg-surface brutalist-border font-bold hover:bg-surface-container-high transition-colors disabled:opacity-50" disabled>
            Anterior
          </button>
          <button className="px-2 py-1 bg-primary-action brutalist-border font-bold">1</button>
          <button className="px-2 py-1 bg-surface brutalist-border font-bold hover:bg-surface-container-high transition-colors">2</button>
          <button className="px-2 py-1 bg-surface brutalist-border font-bold hover:bg-surface-container-high transition-colors">Siguiente</button>
        </div>
      </div>
    </div>
  );
};