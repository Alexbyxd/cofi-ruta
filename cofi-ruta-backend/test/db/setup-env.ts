import * as path from 'node:path';
import * as dotenv from 'dotenv';

const backendRoot = path.resolve(__dirname, '../..');

dotenv.config({ path: path.resolve(backendRoot, '../.env'), quiet: true });
dotenv.config({ path: path.resolve(backendRoot, '.env.test'), quiet: true });

if (!process.env.DATABASE_URL_TEST) {
  throw new Error('DATABASE_URL_TEST is required for DB tests');
}

process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
process.env.NODE_ENV = 'test';
