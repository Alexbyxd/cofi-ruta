import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

// Load env directly (no path aliases)
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  BACKEND_PORT: parseInt(process.env.BACKEND_PORT || '3001'),
  DATABASE_URL: process.env.DATABASE_URL || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || '',
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
};

/**
 * Better Auth takes the router base path from the pathname of `baseURL`
 * whenever that URL has one, silently ignoring an explicit `basePath`. Keep the
 * origin here so `basePath` is always the single source of truth.
 */
function toOrigin(value: string, fallbackPort: number): string {
  try {
    return new URL(value).origin;
  } catch {
    return `http://localhost:${fallbackPort}`;
  }
}

const authBaseURL = toOrigin(
  env.BETTER_AUTH_URL || `http://localhost:${env.BACKEND_PORT}`,
  env.BACKEND_PORT,
);

// Create Prisma client with pg adapter (same as PrismaService)
const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Better Auth configuration
 */
export const auth = betterAuth({
  // === DATABASE ===
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // === BASE URL ===
  // Neither value may include a path: Better Auth builds the router base path
  // from baseURL + basePath, and a path inside baseURL would silently override
  // basePath. Both must agree with the Nest mount and the frontend auth client.
  baseURL: authBaseURL,
  basePath: '/api/v1/auth',

  // === SECRET ===
  secret: env.BETTER_AUTH_SECRET || env.JWT_ACCESS_SECRET,

  // === EMAIL & PASSWORD ===
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
    // Existing and migrated hashes are bcrypt cost 12; Better Auth defaults to
    // scrypt, so both hashing paths must stay bcrypt to keep credentials valid.
    password: {
      hash: async (password: string) => bcrypt.hash(password, BCRYPT_ROUNDS),
      verify: async ({ hash, password }: { hash: string; password: string }) =>
        bcrypt.compare(password, hash),
    },
  },

  // === SOCIAL PROVIDERS ===
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      scope: ['openid', 'email', 'profile'],
    },
  },

  // === ACCOUNT LINKING ===
  // Linking an existing email/password account to Google must be an explicit
  // user decision, so implicit linking on sign-in is disabled: signing in with
  // Google on an email that already exists returns `account_not_linked`
  // instead of silently merging the accounts. The frontend then offers the
  // link through `linkSocial()` while the user has an active session.
  // `allowDifferentEmails` stays false: a Google account with a different
  // email is never merged into another account. The Google identity wins, so
  // the user ends up signed in as that Google account.
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
      disableImplicitLinking: true,
      allowDifferentEmails: false,
    },
  },

  // === SESSION CONFIGURATION ===
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // Refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min cache
    },
  },

  // === CUSTOM USER FIELDS ===
  user: {
    // Better Auth field -> existing column. `fullName` and `avatarUrl` are the
    // app's display model, so they stay as the single stored source of truth.
    fields: {
      name: 'fullName',
      image: 'avatarUrl',
    },
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        input: false,
        defaultValue: 'USER',
      },
      isActive: {
        type: 'boolean',
        required: false,
        input: false,
        defaultValue: true,
      },
      specialty: {
        type: 'string',
        required: false,
        input: true,
        nullable: true,
      },
    },
  },

  // === SECURITY ===
  rateLimit: {
    window: 60,
    max: 100,
  },
  trustedOrigins: [env.FRONTEND_URL],

  // === LOGGER ===
  logger: {
    level: env.NODE_ENV === 'production' ? 'warn' : 'debug',
  },
});

// Types will be inferred by frontend from authClient.$Infer
// Server types available via auth.$Infer.Session etc.
export type Auth = typeof auth;
