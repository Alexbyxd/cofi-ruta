'use client';

import { useSyncExternalStore } from 'react';

/** Nothing to subscribe to: the value only changes once, during hydration. */
const subscribe = () => () => {};

/**
 * `false` during SSR and on the first client render, `true` once hydrated.
 *
 * This is the supported replacement for the old
 * `useState(false)` + `useEffect(() => setMounted(true), [])` pattern, which
 * called setState synchronously inside an effect and triggered
 * `react-hooks/set-state-in-effect`. `useSyncExternalStore` reads the value
 * during render and lets React reconcile the server snapshot with the client
 * one while hydrating, so there is no extra commit and no cascading render.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
