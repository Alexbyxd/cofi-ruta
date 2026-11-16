import { authClient } from "@/lib/auth-client";
import { NextRequest, NextResponse } from "next/server";
import type { BetterAuthUser, BetterAuthSession } from "@/lib/auth-client";

/**
 * API Route Authentication Helpers
 *
 * Use these in Next.js API routes (app/api/*) to validate Better Auth sessions
 */

export interface AuthenticatedRequest extends NextRequest {
  auth?: {
    user: BetterAuthUser;
    session: BetterAuthSession["session"];
  };
}

/**
 * Middleware wrapper for API routes
 * Validates session and attaches user to request
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const { data: session, error } = await authClient.getSession({
    fetchOptions: {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    },
  });

  if (error || !session?.user) {
    return NextResponse.json(
      { error: "No autenticado", code: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  // Attach auth info to request
  const authRequest = request as AuthenticatedRequest;
  authRequest.auth = {
    user: session.user as BetterAuthUser,
    session: session.session,
  };

  return handler(authRequest);
}

/**
 * Optional auth - doesn't fail if not authenticated, just attaches user if present
 */
export async function withOptionalAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    },
  });

  const authRequest = request as AuthenticatedRequest;
  if (session?.user) {
    authRequest.auth = {
      user: session.user as BetterAuthUser,
      session: session.session,
    };
  }

  return handler(authRequest);
}

/**
 * Require specific role
 */
export async function withRole(
  request: NextRequest,
  allowedRoles: string[],
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const { data: session, error } = await authClient.getSession({
    fetchOptions: {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    },
  });

  if (error || !session?.user) {
    return NextResponse.json(
      { error: "No autenticado", code: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  const user = session.user as BetterAuthUser;
  const userRole = user.role || "USER";
  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json(
      { error: "No autorizado", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  const authRequest = request as AuthenticatedRequest;
  authRequest.auth = {
    user,
    session: session.session,
  };

  return handler(authRequest);
}

/**
 * Get current user from request (for use in API routes without wrapper)
 */
export async function getCurrentUser(request: NextRequest): Promise<BetterAuthUser | null> {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    },
  });
  return (session?.user as BetterAuthUser) ?? null;
}

/**
 * Get access token for proxying to backend APIs
 */
export async function getBackendAccessToken(request: NextRequest): Promise<string | null> {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    },
  });
  return session?.session?.token ?? null;
}