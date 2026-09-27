import { drizzle } from 'drizzle-orm/libsql/web';
import { createClient } from '@libsql/client/web';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema.js';

type Db = LibSQLDatabase<typeof schema>;

let instance: Db | undefined;

function resolveConfig(): { url: string; authToken?: string } {
  const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL (atau TURSO_DATABASE_URL) belum di-set. Contoh: libsql://<db>-<org>.turso.io'
    );
  }
  if (url.startsWith('file:') || url.startsWith(':memory:')) {
    throw new Error(
      'Mode file: SQLite tidak didukung oleh @libsql/client/web. Gunakan Turso (libsql:// atau https://) — lihat .env.example.'
    );
  }
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return { url, authToken };
}

export function getDb(): Db {
  if (!instance) {
    const { url, authToken } = resolveConfig();
    const client = createClient({ url, authToken });
    instance = drizzle(client, { schema });
  }
  return instance;
}

export { schema };
