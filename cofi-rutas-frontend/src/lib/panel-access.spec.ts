import { describe, expect, it, vi } from 'vitest';
import { PANEL_ACCESS_TIMEOUT_MS, fetchPanelAccess } from './panel-access';

const BASE = 'http://localhost:3001/api/v1';

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

/**
 * Fetch que nunca responde: sólo rechaza cuando el `AbortSignal` que recibió
 * dispara. Es la forma de probar el timeout sin esperar los 8 segundos reales.
 */
function hangingFetch(): typeof fetch {
  return ((_url: string, init?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => {
        reject(new DOMException('The operation timed out.', 'TimeoutError'));
      });
    })) as unknown as typeof fetch;
}

describe('fetchPanelAccess', () => {
  it('returns the payload the backend answered, asking with credentials', async () => {
    const fetchImpl = vi.fn((url: string, init?: RequestInit) =>
      Promise.resolve(jsonResponse({ accountRole: 'USER', merchantRole: 'OWNER' })),
    ) as unknown as typeof fetch;

    await expect(fetchPanelAccess(BASE, { fetchImpl })).resolves.toEqual({
      accountRole: 'USER',
      merchantRole: 'OWNER',
    });

    const [url, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE}/panel-access`);
    expect(init.credentials).toBe('include');
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('returns null when the backend denies the route', async () => {
    const fetchImpl = (() =>
      Promise.resolve(jsonResponse({ message: 'Forbidden' }, 403))) as unknown as typeof fetch;

    await expect(fetchPanelAccess(BASE, { fetchImpl })).resolves.toBeNull();
  });

  it('gives up when the backend does not answer within the timeout', async () => {
    await expect(
      fetchPanelAccess(BASE, { fetchImpl: hangingFetch(), timeoutMs: 10 }),
    ).resolves.toBeNull();
  });

  it('returns null when the request itself fails', async () => {
    const fetchImpl = (() =>
      Promise.reject(new TypeError('Failed to fetch'))) as unknown as typeof fetch;

    await expect(fetchPanelAccess(BASE, { fetchImpl })).resolves.toBeNull();
  });

  it('defaults to a bounded timeout instead of waiting forever', () => {
    expect(PANEL_ACCESS_TIMEOUT_MS).toBeGreaterThan(0);
    expect(PANEL_ACCESS_TIMEOUT_MS).toBeLessThanOrEqual(10_000);
  });
});
