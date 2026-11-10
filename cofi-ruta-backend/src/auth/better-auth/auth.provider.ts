import type { Auth } from './config';

let instance: Auth | undefined;

/**
 * Lazily loads the Better Auth instance.
 *
 * better-auth ships ESM-only builds. Jest runs on Node 22 through ts-jest/CJS
 * and cannot `require()` that graph, so module-level imports of `./config` make
 * every unit test that touches a guard fail with ERR_REQUIRE_ESM. Resolving the
 * instance only when a request actually authenticates keeps the unit tests
 * independent from the auth library while production behavior is unchanged.
 */
export function getAuth(): Auth {
  if (!instance) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    instance = (require('./config') as typeof import('./config')).auth;
  }
  return instance;
}
