'use client';

import { useCallback, useEffect, useState } from 'react';
import { cafesService } from '@/services/cafes.service';
import type { CoffeeShopWithProducts, ListCafesQuery } from '@/types/cafes';
import { DEFAULT_CAFE_FILTER_CHIPS } from '@/types/cafes';

export interface UseInicioDataReturn {
  // Data
  cafes: CoffeeShopWithProducts[];
  featuredCafe: CoffeeShopWithProducts | undefined;
  // State
  loading: boolean;
  error: string | null;
  activeFilter: string | null;
  searchQuery: string;
  displayCount: number;
  hasMore: boolean;
  // Actions
  handleSearch: (query: string) => void;
  handleFilter: (value: string) => void;
  handleLoadMore: () => void;
  refresh: () => Promise<void>;
}

interface UseInicioDataOptions {
  initialDisplayCount?: number;
  loadOnMount?: boolean;
}

const INITIAL_DISPLAY_COUNT = 8;
const LOAD_MORE_INCREMENT = 4;

export function useInicioData(options: UseInicioDataOptions = {}): UseInicioDataReturn {
  const { initialDisplayCount = INITIAL_DISPLAY_COUNT, loadOnMount = true } = options;

  const [cafes, setCafes] = useState<CoffeeShopWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);
  const [hasMore, setHasMore] = useState(false);

  const loadCafes = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setDisplayCount(initialDisplayCount);
    }
    setError(null);
    try {
      const query: ListCafesQuery = {
        neighborhood: activeFilter || undefined,
        search: searchQuery || undefined,
        limit: reset ? initialDisplayCount : displayCount + LOAD_MORE_INCREMENT,
        offset: 0,
      };
      const response = await cafesService.listCafes(query);
      setCafes(response.cafes);
      setHasMore(response.cafes.length > (reset ? initialDisplayCount : displayCount));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las cafeterías.');
    } finally {
      if (reset) setLoading(false);
    }
  }, [activeFilter, searchQuery, displayCount, initialDisplayCount]);

  useEffect(() => {
    if (loadOnMount) {
      loadCafes(true);
    }
  }, [loadCafes, loadOnMount]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    loadCafes(true);
  }, [loadCafes]);

  const handleFilter = useCallback((value: string) => {
    setActiveFilter(value === activeFilter ? null : value);
    loadCafes(true);
  }, [activeFilter, loadCafes]);

  const handleLoadMore = useCallback(() => {
    setDisplayCount(prev => prev + LOAD_MORE_INCREMENT);
    loadCafes(false);
  }, [loadCafes]);

  const refresh = useCallback(async () => {
    await loadCafes(true);
  }, [loadCafes]);

  const featuredCafe = cafes.length > 0 ? cafes[0] : undefined;

  return {
    cafes,
    featuredCafe,
    loading,
    error,
    activeFilter,
    searchQuery,
    displayCount,
    hasMore,
    handleSearch,
    handleFilter,
    handleLoadMore,
    refresh,
  };
}

export { DEFAULT_CAFE_FILTER_CHIPS } from '@/types/cafes';