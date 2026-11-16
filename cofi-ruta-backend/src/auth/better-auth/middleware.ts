import { auth } from './config';

/**
 * Better Auth middleware for Next.js App Router
 *
 * Usage in frontend middleware.ts:
 * ```ts
 * import { authMiddleware } from "@/../../backend/src/auth/better-auth/middleware";
 * export const middleware = authMiddleware;
 * export const config = { matcher: ["/dashboard/:path*", ...] };
 * ```
 *
 * Note: Better Auth v1.7 doesn't export .middleware directly.
 * Use the frontend authClient.getSession() approach instead (already implemented).
 */
export const authMiddleware = async (request: Request) => {
  return auth.api.getSession({ headers: request.headers });
};

/**
 * Better Auth handler for Express/NestJS
 */
export const authHandler = auth.handler;

/**
 * Helper to get session from request (for API routes)
 */
export async function getSessionFromRequest(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}

/**
 * Helper to require authentication in API routes
 */
export async function requireAuth(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}
