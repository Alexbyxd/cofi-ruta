import { execSync } from 'node:child_process';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

export default function globalSetup(): void {
  const backendRoot = path.resolve(__dirname, '../..');

  dotenv.config({ path: path.resolve(backendRoot, '../.env'), quiet: true });
  dotenv.config({ path: path.resolve(backendRoot, '.env.test'), quiet: true });

  const testUrl = process.env.DATABASE_URL_TEST;

  if (!testUrl) {
    throw new Error(
      'DATABASE_URL_TEST is required for DB tests. Point it to a dedicated *_test database.',
    );
  }

  const databaseName = new URL(testUrl).pathname.replace(/^\//, '');
  if (!databaseName.endsWith('_test')) {
    throw new Error(
      `Refusing to run destructive DB tests against "${databaseName}". The database name must end with "_test".`,
    );
  }

  execSync('npx prisma migrate deploy', {
    cwd: backendRoot,
    env: { ...process.env, DATABASE_URL: testUrl },
    stdio: 'inherit',
  });
}
