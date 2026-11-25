import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { useIsMounted } from './useIsMounted';

/**
 * The panels that use this hook branch on it to avoid a hydration mismatch:
 * SSR must render "not mounted" so the server output matches the first client
 * render. There is no jsdom here, so only the server half is executed; the
 * client half is the documented `useSyncExternalStore` snapshot flip.
 */
function Probe() {
  return React.createElement('span', null, String(useIsMounted()));
}

describe('useIsMounted', () => {
  it('renders false during SSR/prerender', () => {
    expect(renderToString(React.createElement(Probe))).toContain('false');
  });
});
