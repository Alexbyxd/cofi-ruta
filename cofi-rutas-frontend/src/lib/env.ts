import { z } from 'zod';

// Las variables de entorno las carga Next.js automáticamente desde .env.
// NEXT_PUBLIC_* están disponibles también en el cliente; el resto solo en el servidor.
// No usar dotenv aquí: este módulo se importa desde Componentes de Cliente
// ('use client') y no puede requerir built-ins de Node (child_process, os, path).
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
