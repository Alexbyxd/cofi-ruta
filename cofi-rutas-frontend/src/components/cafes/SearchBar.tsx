'use client';

import React, { useState, useCallback } from 'react';

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

/**
 * Buscador de Antojos neobrutalista.
 * Input blanco con borde 3px negro, sombra dura 2px, y botón lupa amarillo.
 * Focus: sombra cambia a color crema gold #E59840.
 */
export function SearchBar({
  placeholder = "¿Qué café o postre se te antoja hoy? (ej. Submarino, Waffle...)",
  onSearch,
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(query.trim());
    },
    [query, onSearch],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full flex flex-col sm:flex-row gap-3 ${className}`}
    >
      <div className="flex-1 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="brutal-input w-full px-4 py-3.5 text-base font-[family-name:var(--font-dm-sans)] text-espresso-ink placeholder:text-espresso-ink/50"
        />
        <button
          type="submit"
          className="absolute right-1 top-1 bottom-1 px-3 bg-[#FFDE59] text-espresso-ink font-[family-name:var(--font-space-grotesk)] font-bold uppercase text-xs tracking-wider brutal-border rounded-l-none rounded-r-lg shadow-[2px_2px_0px_0px_#1A0F0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          aria-label="Buscar"
        >
          🔍
        </button>
      </div>
    </form>
  );
}
