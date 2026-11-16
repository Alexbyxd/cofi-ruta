'use client';

import React, { useState } from 'react';
import { Shield, AlertTriangle, X, Check, Loader2 } from 'lucide-react';

interface EmergencyFreezeButtonProps {
  onFreeze?: () => void;
  onUnfreeze?: () => void;
  initiallyFrozen?: boolean;
}

export const EmergencyFreezeButton: React.FC<EmergencyFreezeButtonProps> = ({
  onFreeze,
  onUnfreeze,
  initiallyFrozen = false,
}) => {
  const [isFrozen, setIsFrozen] = useState(initiallyFrozen);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [frozen, setFrozen] = useState(initiallyFrozen);

  const handleClick = () => {
    if (isFrozen) {
      setShowConfirm(true);
    } else {
      setShowConfirm(true);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      if (isFrozen) {
        await onUnfreeze?.();
        setFrozen(false);
      } else {
        await onFreeze?.();
        setFrozen(true);
      }
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      {/* Main Button */}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`w-full ${isFrozen ? 'bg-surface-container-high' : 'bg-terracotta'} text-surface brutalist-border brutalist-shadow-sm px-3 py-2 font-label-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
          isFrozen
            ? 'hover:bg-surface-container-highest text-structural-ink'
            : 'hover:brightness-110 active:translate-x-0.5 active:translate-y-0.5'
        } ${isLoading ? 'opacity-75 cursor-wait' : ''}`}
        aria-pressed={isFrozen}
      >
        <Shield className={`w-4 h-4 ${isFrozen ? 'text-error' : ''}`} strokeWidth={2.5} />
        {isFrozen ? 'SISTEMA CONGELADO' : 'EMERGENCY FREEZE'}
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />}
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={handleCancel}>
          <div
            className={`bg-surface w-full max-w-md brutalist-border brutalist-shadow-lg relative overflow-hidden ${
              isFrozen ? 'border-error' : 'border-terracotta'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-4 brutalist-border-b flex items-center justify-between ${
              isFrozen ? 'bg-error/10' : 'bg-terracotta/10'
            }`}>
              <div className="flex items-center gap-2">
                {isFrozen ? (
                  <AlertTriangle className="w-5 h-5 text-error" strokeWidth={2.5} />
                ) : (
                  <Shield className="w-5 h-5 text-terracotta" strokeWidth={2.5} />
                )}
                <h3 className="font-headline-sm text-xs font-bold text-structural-ink">
                  {isFrozen ? 'Descongelar Sistema' : 'Congelar Rotación de PINs'}
                </h3>
              </div>
              <button
                onClick={handleCancel}
                className="w-8 h-8 bg-surface brutalist-border brutalist-shadow-sm flex items-center justify-center hover:bg-surface-container-high transition-colors"
              >
                <X className="w-4 h-4 text-structural-ink" strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-4">
              <p className="font-body-md text-xs text-on-surface-variant mb-4">
                {isFrozen
                  ? 'Esto reactivará la generación automática de PINs diarios y la sincronización con terminales de baristas. ¿Confirmar?'
                  : 'Esto detendrá INMEDIATAMENTE la emisión de nuevos PINs diarios en todas las cafeterías afiliadas. Las validaciones en curso no se verán afectadas. ¿Confirmar congelación de emergencia?'}
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancel}
                  className="brutalist-btn bg-surface px-4 py-2 brutalist-border brutalist-shadow-sm font-label-md text-xs font-bold uppercase text-structural-ink hover:bg-surface-container-high transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`brutalist-btn px-4 py-2 brutalist-border brutalist-shadow-sm font-label-md text-xs font-bold uppercase transition-all ${
                    isFrozen
                      ? 'bg-primary-action text-structural-ink hover:bg-primary-container'
                      : 'bg-terracotta text-surface hover:brightness-110'
                  } ${isLoading ? 'opacity-75 cursor-wait' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                      Procesando...
                    </>
                  ) : isFrozen ? (
                    <>
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                      Descongelar
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" strokeWidth={2.5} />
                      Congelar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      {isFrozen && (
        <div className="mt-2 p-2 bg-error/10 brutalist-border border-error text-error text-xs font-label-md flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3" strokeWidth={2.5} />
          <span>Rotación de PINs CONGELADA - Modo Seguridad Activo</span>
        </div>
      )}
    </>
  );
};

// Hook version for global state management
export const useEmergencyFreeze = () => {
  const [isFrozen, setIsFrozen] = useState(false);
  const [timestamp, setTimestamp] = useState<Date | null>(null);

  const freeze = async () => {
    setIsFrozen(true);
    setTimestamp(new Date());
    // TODO: Call API to freeze PIN rotation globally
    console.log('[EmergencyFreeze] PIN rotation frozen at', new Date().toISOString());
  };

  const unfreeze = async () => {
    setIsFrozen(false);
    setTimestamp(null);
    // TODO: Call API to unfreeze PIN rotation globally
    console.log('[EmergencyFreeze] PIN rotation unfrozen at', new Date().toISOString());
  };

  return { isFrozen, freeze, unfreeze, timestamp };
};