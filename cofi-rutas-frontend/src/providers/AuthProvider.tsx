"use client";

import { ReactNode } from "react";

/**
 * AuthProvider - Wrapper for auth initialization
 *
 * Better Auth v1.7+ handles session via cookies automatically.
 * No SessionProvider is needed - useSession() hook works directly.
 * This provider can be used for future auth initialization if needed.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}