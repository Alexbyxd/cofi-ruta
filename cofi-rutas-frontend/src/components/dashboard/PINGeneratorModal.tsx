'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface CoffeeShop {
  id: string;
  name: string;
  address: string;
  pin?: string;
  baristas: number;
  status: 'open' | 'closed';
}

interface PINGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmit: (shopId: string, pin: string) => void;
}

const COFFEE_SHOPS: CoffeeShop[] = [
  { id: 'cs1', name: 'Café del Socavón', address: 'Calle Murguía #420', pin: '4821', baristas: 3, status: 'open' },
  { id: 'cs2', name: 'Café Central Oruro', address: 'Plaza 10 de Febrero #12', pin: '9304', baristas: 4, status: 'open' },
  { id: 'cs3', name: 'Moccoa Artesanal', address: 'Calle La Plata #89', pin: '7718', baristas: 2, status: 'open' },
  { id: 'cs4', name: 'Grano & Alma', address: 'Calle Bolívar & 6 de Octubre', pin: '----', baristas: 1, status: 'closed' },
  { id: 'cs5', name: 'Vainilla & Canela', address: 'Av. 6 de Agosto #104', pin: '5530', baristas: 3, status: 'open' },
];

export const PINGeneratorModal: React.FC<PINGeneratorModalProps> = ({
  isOpen,
  onClose,
  onEmit,
}) => {
  const [selectedShop, setSelectedShop] = useState<CoffeeShop>(COFFEE_SHOPS[0]);
  const [generatedPin, setGeneratedPin] = useState('4821');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentDate] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateNewPin = () => {
    setIsGenerating(true);
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    setTimeout(() => {
      setGeneratedPin(newPin);
      setSelectedShop(prev => ({ ...prev, pin: newPin }));
      setIsGenerating(false);
    }, 500);
  };

  const handleEmit = () => {
    onEmit(selectedShop.id, generatedPin);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface w-full max-w-2xl brutalist-border brutalist-shadow-lg relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary-action p-4 brutalist-border-b flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary-action text-structural-ink font-label-md text-xs font-bold brutalist-border">
                MESA DE CONTROL OPERATIVA
              </span>
              <span className="font-label-md text-xs font-bold text-coffee-leaf flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-coffee-leaf animate-ping" />
                SINCRONIZACIÓN AUTOMÁTICA ACTIVA
              </span>
            </div>
            <h3 className="text-headline-md font-headline-md font-bold text-structural-ink">
              Generador Instantáneo de PIN Diario
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-surface brutalist-border brutalist-shadow-sm flex items-center justify-center hover:bg-surface-container-high transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 text-structural-ink" strokeWidth={2.5} />
          </button>
        </div>

        {/* Description */}
        <div className="p-4 bg-surface-container-low/50 brutalist-border-b border-dashed border-outline-variant">
          <p className="font-body-md text-xs text-on-surface-variant max-w-xl">
            Emite códigos criptográficos de rotación diaria para validar consumos en cafeterías afiliadas de Oruro. Se sincroniza con la terminal móvil del barista en segundos.
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-4 bg-surface p-4 brutalist-border brutalist-shadow">
            {/* Shop Selector */}
            <div className="flex-1 min-w-[200px] relative" ref={dropdownRef}>
              <label className="block font-label-md text-xs font-bold uppercase text-structural-ink mb-1">
                Cafetería Destino
              </label>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full bg-canvas font-label-md text-xs font-bold py-2 px-3 brutalist-border focus:outline-none flex items-center justify-between"
              >
                <span>{selectedShop.name}</span>
                {showDropdown ? (
                  <ChevronUp className="w-4 h-4 text-structural-ink" strokeWidth={2.5} />
                ) : (
                  <ChevronDown className="w-4 h-4 text-structural-ink" strokeWidth={2.5} />
                )}
              </button>
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface brutalist-border brutalist-shadow-lg z-10 max-h-60 overflow-y-auto">
                  {COFFEE_SHOPS.map((shop) => (
                    <button
                      key={shop.id}
                      onClick={() => {
                        setSelectedShop(shop);
                        setGeneratedPin(shop.pin || '----');
                        setShowDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-surface-container-high transition-colors ${
                        shop.id === selectedShop.id ? 'bg-primary-action/20' : ''
                      }`}
                    >
                      <div className="font-label-md text-xs font-bold text-structural-ink">{shop.name}</div>
                      <div className="text-[10px] text-on-surface-variant">{shop.address}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`px-1.5 py-0.5 text-[9px] font-label-md font-bold brutalist-border ${
                          shop.status === 'open' ? 'bg-coffee-leaf text-surface' : 'bg-surface-container-highest text-structural-ink'
                        }`}>
                          {shop.status === 'open' ? 'Abierto' : 'Cerrado'}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">{shop.baristas} Baristas</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date & Shift */}
            <div className="flex-1 min-w-[180px]">
              <label className="block font-label-md text-xs font-bold uppercase text-structural-ink mb-1">
                Turno / Fecha
              </label>
              <div className="bg-canvas font-label-md text-xs font-bold py-2 px-3 brutalist-border flex items-center justify-between">
                <span>{currentDate} - Turno Tarde</span>
              </div>
            </div>

            {/* PIN Display */}
            <div className="flex-1 min-w-[160px]">
              <label className="block font-label-md text-xs font-bold uppercase text-structural-ink mb-1">
                PIN Generado
              </label>
              <div className="flex gap-1.5">
                {generatedPin.split('').map((digit, i) => (
                  <span
                    key={i}
                    className="w-10 h-12 bg-surface-container brutalist-border font-headline-sm text-xl font-bold flex items-center justify-center text-structural-ink"
                  >
                    {digit}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-end min-w-[160px]">
              <label className="block font-label-md text-xs font-bold uppercase text-transparent mb-1">
                Acción
              </label>
              <div className="flex gap-2">
                <button
                  onClick={generateNewPin}
                  disabled={isGenerating}
                  className="brutalist-btn bg-surface px-3 py-2 brutalist-border brutalist-shadow-sm font-label-md text-xs font-bold uppercase text-structural-ink hover:bg-surface-container-high transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  aria-label="Regenerar PIN"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Regenerar</span>
                </button>
                <button
                  onClick={handleEmit}
                  className="brutalist-btn bg-primary-action px-4 py-2 brutalist-border brutalist-shadow-sm font-label-md text-xs font-bold uppercase text-structural-ink hover:bg-primary-container transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" strokeWidth={2.5} />
                  <span>Emitir & Notificar a Barista</span>
                </button>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <p className="font-body-md text-xs text-on-surface-variant/70 border-t border-dashed border-outline-variant pt-4">
            El PIN se sincroniza automáticamente con la app del barista vía WebSocket. Validez: 24 horas o hasta regeneración manual.
          </p>
        </div>
      </div>
    </div>
  );
};
