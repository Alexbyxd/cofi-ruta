'use client';

import { useState, useCallback } from 'react';

export interface CofiDuoState {
  streakWeeks: number;
  currentStamps: number;
  targetStamps: number;
  nextReward: string;
  sharedTastes: string[];
  isActive: boolean;
  duoDay: number;
  duoNames: [string, string];
}

export interface UseCofiDuoReturn extends CofiDuoState {
  progress: number;
  stampsRemaining: number;
  incrementStamps: (count?: number) => void;
  decrementStamps: (count?: number) => void;
  setStreakWeeks: (weeks: number) => void;
  toggleActive: () => void;
}

const DEFAULT_DUO_STATE: CofiDuoState = {
  streakWeeks: 18,
  currentStamps: 8,
  targetStamps: 10,
  nextReward: 'Cheesecake de Maracuyá gratis',
  sharedTastes: ['Filtro V60', 'Churros caseros', 'Chocolate caliente', 'Tostadas de aguacate'],
  isActive: true,
  duoDay: 125,
  duoNames: ['Carlos', 'Laura'],
};

export function useCofiDuo(initialState?: Partial<CofiDuoState>): UseCofiDuoReturn {
  const [state, setState] = useState<CofiDuoState>({
    ...DEFAULT_DUO_STATE,
    ...initialState,
  });

  const progress = Math.min(100, (state.currentStamps / state.targetStamps) * 100);
  const stampsRemaining = Math.max(0, state.targetStamps - state.currentStamps);

  const incrementStamps = useCallback((count = 1) => {
    setState(prev => ({
      ...prev,
      currentStamps: Math.min(prev.targetStamps, prev.currentStamps + count),
    }));
  }, []);

  const decrementStamps = useCallback((count = 1) => {
    setState(prev => ({
      ...prev,
      currentStamps: Math.max(0, prev.currentStamps - count),
    }));
  }, []);

  const setStreakWeeks = useCallback((weeks: number) => {
    setState(prev => ({ ...prev, streakWeeks: weeks }));
  }, []);

  const toggleActive = useCallback(() => {
    setState(prev => ({ ...prev, isActive: !prev.isActive }));
  }, []);

  return {
    ...state,
    progress,
    stampsRemaining,
    incrementStamps,
    decrementStamps,
    setStreakWeeks,
    toggleActive,
  };
}