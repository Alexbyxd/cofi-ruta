import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load root .env before validation
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  BACKEND_PORT: z.coerce
    .number('BACKEND PORT debe ser un número')
    .default(3001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es requerida'),
  FRONTEND_URL: z
    .url('FRONTEND_URL debe ser una URL válida')
    .default('http://localhost:3000'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(8, 'JWT_ACCESS_SECRET debe tener al menos 8 caracteres'),
  JWT_ACCESS_EXPIRES_IN: z
    .string('JWT_ACCESS_EXPIRES_IN debe ser una cadena')
    .default('15m'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(8, 'JWT_REFRESH_SECRET debe tener al menos 8 caracteres'),
  JWT_REFRESH_EXPIRES_IN: z
    .string('JWT_REFRESH_EXPIRES_IN debe ser una cadena')
    .default('7d'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  // Better Auth
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'BETTER_AUTH_SECRET debe tener al menos 32 caracteres')
    .optional(),
  BETTER_AUTH_URL: z.url('BETTER_AUTH_URL debe ser una URL válida').optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(
  config: Record<string, unknown> = process.env,
): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((issue) => `  - [${issue.path.join('.')}]: ${issue.message}`)
      .join('\n');
    throw new Error(
      `\n❌ Las variables de entorno no son válidas:\n${errorMessages}\n`,
    );
  }

  return result.data;
}
