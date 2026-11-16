/**
 * Popup machinery for the Google OAuth flows (login and account linking).
 *
 * Kept free of React and of the app's `@/` aliases so it can be unit tested
 * directly with vitest.
 */

export const GOOGLE_POPUP_WIDTH = 500;
export const GOOGLE_POPUP_HEIGHT = 600;
export const GOOGLE_POPUP_TIMEOUT_MS = 5 * 60 * 1000;
export const GOOGLE_POPUP_POLL_MS = 300;

/**
 * Fallback channel used by `/auth/callback`.
 *
 * Google's COOP can sever `window.opener`, so the popup cannot always deliver
 * a `postMessage`. Both windows share the same origin, so localStorage is a
 * reliable second channel that does not depend on the opener.
 */
export const OAUTH_RESULT_STORAGE_KEY = 'cofi_oauth_result';

export type GooglePopupResult =
  | { type: 'GOOGLE_AUTH_SUCCESS' }
  | { type: 'GOOGLE_AUTH_ERROR'; code?: string; message?: string };

export type GooglePopupOutcome =
  | { kind: 'result'; result: GooglePopupResult }
  | { kind: 'closed' }
  | { kind: 'timeout' };

export function openGooglePopup(url: string): Window | null {
  const width = GOOGLE_POPUP_WIDTH;
  const height = GOOGLE_POPUP_HEIGHT;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  return window.open(
    url,
    'cofi-google-oauth',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
  );
}

/**
 * Reads the result the callback page left behind.
 *
 * Only a result written at or after the attempt started counts, so an entry
 * from a previous attempt can never settle the current one. The entry is
 * always consumed to keep the channel clean.
 */
export function readStoredOAuthResult(
  notBefore: number
): GooglePopupResult | null {
  try {
    const raw = window.localStorage.getItem(OAUTH_RESULT_STORAGE_KEY);
    if (!raw) return null;

    window.localStorage.removeItem(OAUTH_RESULT_STORAGE_KEY);

    const parsed = JSON.parse(raw) as {
      type?: string;
      code?: string;
      message?: string;
      at?: number;
    };

    if (typeof parsed?.at !== 'number' || parsed.at < notBefore) return null;

    if (parsed.type === 'GOOGLE_AUTH_SUCCESS') {
      return { type: 'GOOGLE_AUTH_SUCCESS' };
    }
    if (parsed.type === 'GOOGLE_AUTH_ERROR') {
      return {
        type: 'GOOGLE_AUTH_ERROR',
        code: parsed.code,
        message: parsed.message,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Waits for the Google popup to report a result, close, or time out.
 *
 * Three signals are combined on purpose: `postMessage` is the fastest, the
 * localStorage handshake survives a severed opener, and the popup-close event
 * covers a cancelled flow. The caller decides what a bare close means.
 */
export function waitForGooglePopup(
  popup: Window,
  openedAt: number
): Promise<GooglePopupOutcome> {
  return new Promise<GooglePopupOutcome>((resolve) => {
    let settled = false;
    const timers: {
      poll?: ReturnType<typeof setInterval>;
      timeout?: ReturnType<typeof setTimeout>;
    } = {};

    const cleanup = () => {
      if (timers.poll) clearInterval(timers.poll);
      if (timers.timeout) clearTimeout(timers.timeout);
      window.removeEventListener('message', handleMessage);
    };

    const finish = (outcome: GooglePopupOutcome) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(outcome);
    };

    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        finish({ kind: 'result', result: { type: 'GOOGLE_AUTH_SUCCESS' } });
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        finish({
          kind: 'result',
          result: {
            type: 'GOOGLE_AUTH_ERROR',
            code: event.data.code,
            message: event.data.message,
          },
        });
      }
    }

    window.addEventListener('message', handleMessage);

    timers.poll = setInterval(() => {
      const stored = readStoredOAuthResult(openedAt);
      if (stored) {
        finish({ kind: 'result', result: stored });
        return;
      }
      if (popup.closed) {
        finish({ kind: 'closed' });
      }
    }, GOOGLE_POPUP_POLL_MS);

    timers.timeout = setTimeout(() => {
      if (!popup.closed) popup.close();
      finish({ kind: 'timeout' });
    }, GOOGLE_POPUP_TIMEOUT_MS);
  });
}
