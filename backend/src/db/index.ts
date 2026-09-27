import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let rawUrl = process.env.DATABASE_URL || 'file:chem-cycle.db';
if (rawUrl.startsWith('file:')) {
  const filePath = rawUrl.slice(5);
  if (!path.isAbsolute(filePath)) {
    const resolvedPath = path.resolve(__dirname, '../../', filePath);
    rawUrl = `file:${resolvedPath.replace(/\\/g, '/')}`;
  }
} else if (
  !rawUrl.startsWith('http:') &&
  !rawUrl.startsWith('https:') &&
  !rawUrl.startsWith('libsql:')
) {
  const resolvedPath = path.isAbsolute(rawUrl)
    ? rawUrl
    : path.resolve(__dirname, '../../', rawUrl);
  rawUrl = `file:${resolvedPath.replace(/\\/g, '/')}`;
}

export const client = createClient({ url: rawUrl });
export const db = drizzle(client, { schema });
export { schema };
