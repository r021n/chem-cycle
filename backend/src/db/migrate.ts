import 'dotenv/config';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { getDb } from './index.js';

async function main() {
  console.log('📦 Menjalankan migrasi drizzle ke database...');
  await migrate(getDb(), { migrationsFolder: './drizzle' });
  console.log('✅ Migrasi selesai.');
}

main().catch((err) => {
  console.error('❌ Migrasi gagal:', err);
  process.exit(1);
});
