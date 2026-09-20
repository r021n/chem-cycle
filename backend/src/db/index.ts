import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.js';
import * as dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'file:chemcycle.db';
const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

export const client = createClient({
  url: databaseUrl,
  authToken: authToken,
});

if (databaseUrl.startsWith('file:')) {
  client.execute('PRAGMA journal_mode = WAL;').catch(() => {});
  client.execute('PRAGMA busy_timeout = 5000;').catch(() => {});
}

export const db = drizzle(client, { schema });
