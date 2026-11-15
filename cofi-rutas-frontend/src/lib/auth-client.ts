import { createAuthClient } from "better-auth/react";

/**
 * Better Auth Client Configuration
 *
 * Points to the backend Better Auth handler at /api/v1/auth/*
 * The baseURL must be the full auth base path, not just the API root.
 *
 * - Client-side (browser): uses NEXT_PUBLIC_API_URL (default: http://localhost:3001/api/v1)
 * - Server-side (middleware): uses INTERNAL_API_URL (default: http://backend:3001/api/v1)
 */
const getClientBaseURL = () => {
  // Client-side: use public URL (browser-accessible)
  if (typeof window !== "undefined") {
    return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1").replace(/\/+$/, "");
  }
  // Server-side: use internal Docker URL
  return (process.env.INTERNAL_API_URL || "http://backend:3001/api/v1").replace(/\/+$/, "");
};

export const authClient = createAuthClient({
  // Better Auth appends the endpoint path directly to this URL, so it must be
  // the full auth base path, not just the API root.
  baseURL: `${getClientBaseURL()}/auth`,
  // credentials: "include" is default for browser
});

/**
 * Export core auth methods
 */
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  changePassword,
  // Account linking: `linkSocial` starts the OAuth flow for the signed-in
  // user, `listAccounts` reports which providers are already linked.
  linkSocial,
  listAccounts,
  // resetPassword,
  // verifyEmail,
  // Organization plugin - use when plugin is enabled on server
  // organization,
  // Two-Factor plugin - use when plugin is enabled on server
  // twoFactor,
  // Passkey plugin - use when plugin is enabled on server
  // passkey,
  // API Key plugin - use when plugin is enabled on server
  // apiKey,
} = authClient;

/**
 * Type exports for frontend use
 * These are inferred from the Better Auth server configuration
 * Custom fields (fullName, avatarUrl, role, isActive, specialty) need to be declared
 */
export interface BetterAuthUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Custom fields from our schema
  fullName?: string;
  avatarUrl?: string | null;
  role?: string;
  isActive?: boolean;
  specialty?: string | null;
}

export interface BetterAuthSession {
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: BetterAuthUser;
}

/**
 * Helper to get access token for API calls
 * Better Auth stores session in httpOnly cookies, but we can get the session token
 */
export async function getAccessToken(): Promise<string | null> {
  const { data: session } = await getSession();
  return session?.session?.token ?? null;
}

/**
 * Helper to get current user (non-reactive)
 */
export async function getCurrentUser(): Promise<BetterAuthUser | null> {
  const { data: session } = await getSession();
  return session?.user ?? null;
}

/**
 * Check if user is authenticated (non-reactive)
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: session } = await getSession();
  return !!session?.user;
}