'use client';

import { useState, useCallback, useMemo } from 'react';
import { Award, CheckCircle, Bookmark, MapPin } from 'lucide-react';

export interface Stamp {
  name: string;
  initial: string;
  date: string;
  bg: string;
  border: string;
  text: string;
  icon: 'check' | 'add' | 'verified';
  fill: boolean;
  rotation: number;
  neighborhood?: string;
}

export interface PasaporteState {
  stamps: Stamp[];
  totalStamps: number;
  completedStamps: number;
  nextReward: string;
  altitudeTip: string;
}

export interface UsePasaporteReturn extends PasaporteState {
  progress: number;
  stampsRemaining: number;
  addStamp: (stamp: Omit<Stamp, 'fill' | 'rotation'> & { fill: true; rotation: number }) => void;
  completeNextStamp: () => void;
  resetProgress: () => void;
}

const DEFAULT_STAMPS: Stamp[] = [
  { name: 'Kory Café', initial: 'K', date: '14 Oct', bg: 'bg-[#6B8E4E]/20', border: 'border-[#6B8E4E]', text: 'text-[#6B8E4E]', icon: 'verified', fill: true, rotation: -3, neighborhood: 'Centro' },
  { name: 'El Pagador', initial: 'E', date: '22 Oct', bg: 'bg-[#F48E6A]/30', border: 'border-[#F48E6A]', text: 'text-[#984628]', icon: 'verified', fill: true, rotation: 2, neighborhood: 'Mercado' },
  { name: 'Chocolatería', initial: 'C', date: 'Ayer', bg: 'bg-[#E59840]/30', border: 'border-[#E59840]', text: 'text-[#8a5100]', icon: 'verified', fill: true, rotation: -2, neighborhood: 'Plaza' },
  { name: 'Café Central', initial: 'C', date: 'Hoy', bg: 'bg-[#D8B18A]/30', border: 'border-[#D8B18A]', text: 'text-[#7A5842]', icon: 'check', fill: true, rotation: 1, neighborhood: 'Centro' },
  { name: 'Siguiente', initial: '+', date: 'Pendiente', bg: 'bg-[#FFFFFF]', border: 'border-espresso-ink/40', text: 'text-espresso-ink/50', icon: 'add', fill: false, rotation: 0, neighborhood: '?' },
];

const DEFAULT_PASAPORTE_STATE: Omit<PasaporteState, 'stamps'> = {
  totalStamps: DEFAULT_STAMPS.length - 1,
  completedStamps: DEFAULT_STAMPS.filter(s => s.fill).length,
  nextReward: 'Cheesecake de Maracuyá gratis',
  altitudeTip: 'Pide tu café con granos de Caranavi tostado medio para mantener la calidez corporal sin elevar tu presión a 3.735m.',
};

export function usePasaporte(initialStamps?: Stamp[]): UsePasaporteReturn {
  const [stamps, setStamps] = useState<Stamp[]>(initialStamps || DEFAULT_STAMPS);

  const completedStamps = useMemo(() => stamps.filter(s => s.fill).length, [stamps]);
  const totalStamps = useMemo(() => stamps.length - 1, [stamps]); // Exclude "Siguiente"
  const progress = useMemo(() => Math.round((completedStamps / totalStamps) * 100), [completedStamps, totalStamps]);
  const stampsRemaining = useMemo(() => Math.max(0, totalStamps - completedStamps), [completedStamps, totalStamps]);

  const addStamp = useCallback((stamp: Omit<Stamp, 'fill' | 'rotation'> & { fill: true; rotation: number }) => {
    setStamps(prev => {
      // Replace "Siguiente" or append before it
      const siguienteIndex = prev.findIndex(s => s.name === 'Siguiente');
      if (siguienteIndex >= 0) {
        const next = prev[siguienteIndex];
        const newStamps = [...prev];
        newStamps[siguienteIndex] = { ...stamp, name: stamp.name, initial: stamp.initial, date: stamp.date, bg: stamp.bg, border: stamp.border, text: stamp.text, icon: stamp.icon };
        newStamps.splice(siguienteIndex + 1, 0, { ...next, name: 'Siguiente', initial: '+', date: 'Pendiente' });
        return newStamps;
      }
      return [...prev, { ...stamp, fill: true }];
    });
  }, []);

  const completeNextStamp = useCallback(() => {
    setStamps(prev => {
      const siguienteIndex = prev.findIndex(s => s.name === 'Siguiente');
      if (siguienteIndex > 0) {
        const prevStamp = prev[siguienteIndex - 1];
        if (!prevStamp.fill) {
          const newStamps = [...prev];
          newStamps[siguienteIndex - 1] = { ...prevStamp, fill: true, icon: 'verified' as const, bg: 'bg-[#6B8E4E]/20', border: 'border-[#6B8E4E]', text: 'text-[#6B8E4E]' };
          return newStamps;
        }
      }
      return prev;
    });
  }, []);

  const resetProgress = useCallback(() => {
    setStamps(DEFAULT_STAMPS);
  }, []);

  return {
    stamps,
    totalStamps,
    completedStamps,
    progress,
    stampsRemaining,
    nextReward: DEFAULT_PASAPORTE_STATE.nextReward,
    altitudeTip: DEFAULT_PASAPORTE_STATE.altitudeTip,
    addStamp,
    completeNextStamp,
    resetProgress,
  };
}

export { DEFAULT_STAMPS };