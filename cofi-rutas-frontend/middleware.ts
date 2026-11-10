import { authClient } from "@/lib/auth-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { BetterAuthUser } from "@/lib/auth-client";

/**
 * Next.js Middleware - Route Protection with Better Auth Client
 *
 * Uses authClient.getSession() to validate session on edge/runtime
 * Redirects unauthenticated users to /login with redirect parameter
 */

const protectedPaths = [
  "/dashboard",
  "/profile",
  "/settings",
  "/api/protected",
];

function isProtected(pathname: string): boolean {
  return protectedPaths.some((path) => pathname.startsWith(path));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isProtected(pathname)) {
    try {
      // Get session from Better Auth (uses cookies automatically)
      const { data: session, error } = await authClient.getSession({
        fetchOptions: {
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        },
      });

      if (error || !session?.user) {
        // Not authenticated - redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Authenticated - add user info to headers for downstream use
      const user = session.user as BetterAuthUser;
      const response = NextResponse.next();
      response.headers.set("x-user-id", user.id);
      response.headers.set("x-user-email", user.email);
      response.headers.set("x-user-role", user.role || "USER");
      return response;
    } catch (err) {
      console.error("[Middleware] Auth check failed:", err);
      // On error, redirect to login for safety
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/api/protected/:path*",
  ],
};