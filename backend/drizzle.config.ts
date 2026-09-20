import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:chemcycle.db',
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  },
});
