'use client';

import React from 'react';
import { Verified, TrendingUp, AlertTriangle } from 'lucide-react';

// Chart 1: Growth Chart (Usuarios & Visitas Dúo)
interface GrowthChartProps {
  className?: string;
}
export const GrowthChart: React.FC<GrowthChartProps> = ({ className = '' }) => {
  const chartData = [
    { day: 'LUN', visitas: 120, duos: 60, heightVisitas: 36, heightDuos: 24 },
    { day: 'MAR', visitas: 190, duos: 110, heightVisitas: 57, heightDuos: 44 },
    { day: 'MIÉ', visitas: 160, duos: 90, heightVisitas: 48, heightDuos: 36 },
    { day: 'JUE', visitas: 220, duos: 140, heightVisitas: 66, heightDuos: 56 },
    { day: 'VIE', visitas: 380, duos: 260, heightVisitas: 100, heightDuos: 84, peak: true },
    { day: 'SÁB', visitas: 430, duos: 310, heightVisitas: 100, heightDuos: 100, peak: true },
    { day: 'DOM', visitas: 290, duos: 180, heightVisitas: 88, heightDuos: 72 },
  ];

  const maxHeight = 100;

  return (
    <div className={`bg-surface p-6 brutalist-border brutalist-shadow flex flex-col justify-between ${className}`} >
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-headline-sm text-headline-sm uppercase text-structural-ink font-bold">
              Crecimiento de Usuarios & Visitas Dúo
            </h4>
            <p className="font-body-md text-xs text-on-surface-variant">
              Comparativa semanal con picos de fin de semana en Oruro
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-label-md text-xs font-bold">
              <span className="w-3 h-3 bg-primary-container brutalist-border" />
              Visitas
            </span>
            <span className="flex items-center gap-1 font-label-md text-xs font-bold">
              <span className="w-3 h-3 bg-coffee-leaf brutalist-border" />
              Dúos
            </span>
          </div>
        </div>
        <div className="mt-6 h-48 flex items-end justify-between gap-2 pt-4 px-2 brutalist-border-b border-structural-ink bg-surface-container-low/40">
          {chartData.map((data) => (
            <div
              key={data.day}
              className={`flex-1 flex flex-col items-center gap-1 h-full justify-end ${
                data.peak ? 'bg-primary-action/20' : ''
              }`}
            >
              <div className="w-full flex items-end justify-center gap-1">
                <div
                  className="w-3 bg-primary-container brutalist-border"
                  style={{ height: `${data.heightVisitas}%` }}
                  title={`${data.day} Visitas: ${data.visitas}`}
                />
                <div
                  className="w-3 bg-coffee-leaf brutalist-border"
                  style={{ height: `${data.heightDuos}%` }}
                  title={`${data.day} Dúos: ${data.duos}`}
                />
              </div>
              <span className={`font-label-md text-[10px] font-bold ${
                data.peak ? 'text-structural-ink' : 'text-on-surface-variant'
              }`}>
                {data.day}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 pt-3 brutalist-border-t flex items-center justify-between text-xs">
        <span className="font-bold text-structural-ink">
          Pico histórico registrado: Sábado 18:00 (Feria & Socavón)
        </span>
        <span className="font-label-md text-primary font-bold hover:underline cursor-pointer">
          Ver detalle horario →
        </span>
      </div>
    </div>
  );
};

// Chart 2: CoffeeShops Status (Donut/Segment)
interface CoffeeShopsStatusChartProps {
  className?: string;
}
export const CoffeeShopsStatusChart: React.FC<CoffeeShopsStatusChartProps> = ({ className = '' }) => {
  const segments = [
    { label: '14 Alta Especialidad', value: 78, color: 'bg-primary-container' },
    { label: '3 Tradicionales', value: 17, color: 'bg-terracotta' },
    { label: '1 En Mantenimiento', value: 5, color: 'bg-structural-ink' },
  ];

  return (
    <div className={`bg-surface p-6 brutalist-border brutalist-shadow flex flex-col justify-between ${className}`} >
      <div>
        <h4 className="font-headline-sm text-headline-sm uppercase text-structural-ink font-bold">
          Estado Cafeterías
        </h4>
        <p className="font-body-md text-xs text-on-surface-variant">18 Comercios Registrados</p>
        <div className="my-4 flex items-center justify-center">
          <div className="relative w-36 h-36 rounded-full brutalist-border bg-surface-container-high flex items-center justify-center brutalist-shadow-sm overflow-hidden">
            {/* SVG donut chart */}
            <svg width="144" height="144" viewBox="0 0 144 144" className="transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="58"
                fill="none"
                stroke="#e5d8cd"
                strokeWidth="16"
              />
              <circle
                cx="72"
                cy="72"
                r="58"
                fill="none"
                stroke="#E59840"
                strokeWidth="16"
                strokeDasharray="364.4"
                strokeDashoffset="80"
                strokeLinecap="round"
              />
              <circle
                cx="72"
                cy="72"
                r="58"
                fill="none"
                stroke="#DE7C5A"
                strokeWidth="16"
                strokeDasharray="364.4"
                strokeDashoffset="444"
                strokeLinecap="round"
              />
              <circle
                cx="72"
                cy="72"
                r="58"
                fill="none"
                stroke="#1A0F0A"
                strokeWidth="16"
                strokeDasharray="364.4"
                strokeDashoffset="480"
                strokeLinecap="round"
              />
            </svg>
            <div className="relative w-20 h-20 rounded-full bg-surface brutalist-border flex flex-col items-center justify-center text-center z-10">
              <span className="font-headline-sm text-lg font-bold">18</span>
              <span className="font-label-md text-[9px] uppercase tracking-wider text-on-surface-variant">
                Total
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-1.5 text-xs font-label-md">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className={`w-3 h-3 ${seg.color} brutalist-border`} />
                {seg.label}
              </span>
              <span className="font-bold text-structural-ink">{seg.value}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 pt-3 brutalist-border-t">
        <button className="w-full bg-surface-container-high brutalist-border py-1 text-xs font-label-md font-bold uppercase hover:bg-surface-container-highest transition-colors">
          Inspeccionar Certificaciones
        </button>
      </div>
    </div>
  );
};

// Chart 3: PIN Verification Funnel
interface PINFunnelChartProps {
  className?: string;
}
export const PINFunnelChart: React.FC<PINFunnelChartProps> = ({ className = '' }) => {
  const steps = [
    { label: '1. Intento Check-in', value: 4120, percent: 100, color: 'bg-electric-cyan' },
    { label: '2. Código Solicitado', value: 4050, percent: 98, color: 'bg-primary-action' },
    { label: '3. Barista Valida PIN', value: 3940, percent: 95, color: 'bg-primary-container' },
    { label: '4. Sello Dúo Ganado', value: 3892, percent: 94.4, color: 'bg-coffee-leaf' },
  ];

  return (
    <div className={`bg-surface p-6 brutalist-border brutalist-shadow flex flex-col justify-between ${className}`} >
      <div>
        <h4 className="font-headline-sm text-headline-sm uppercase text-structural-ink font-bold">
          Embudo de PINs
        </h4>
        <p className="font-body-md text-xs text-on-surface-variant">Tasa de conversión en mostrador</p>
        <div className="mt-4 space-y-2.5">
          {steps.map((step, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs font-label-md mb-1 font-bold">
                <span>{step.label}</span>
                <span>{step.value} ({step.percent}%)</span>
              </div>
              <div className="w-full h-5 bg-surface-container-high brutalist-border overflow-hidden">
                <div
                  className={`h-full ${step.color}`}
                  style={{ width: `${step.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 pt-3 brutalist-border-t text-xs font-label-md flex items-center justify-between text-coffee-leaf font-bold">
        <span className="flex items-center gap-1">
          <Verified className="w-4 h-4" strokeWidth={2.5} />
          Fricción baja: {"<14s"}
        </span>
        <span className="text-structural-ink">Meta: 95%</span>
      </div>
    </div>
  );
};

export const AnalyticsCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <GrowthChart className="lg:col-span-6" />
      <CoffeeShopsStatusChart className="lg:col-span-3" />
      <PINFunnelChart className="lg:col-span-3" />
    </div>
  );
};