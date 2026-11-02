import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load root .env when running on the server/build time
if (typeof window === 'undefined') {
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001/api/v1'),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
});

export type ClientEnvConfig = z.infer<typeof envSchema>;

export function validateClientEnv(): ClientEnvConfig {
  const result = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  });

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((issue) => `  - [${issue.path.join('.')}]: ${issue.message}`)
      .join('\n');
    throw new Error(`\n❌ Frontend environment variable validation failed:\n${errorMessages}\n`);
  }

  return result.data;
}

export const clientEnv = validateClientEnv();
