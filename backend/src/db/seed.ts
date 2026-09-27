import 'dotenv/config';
import { getDb } from './index.js';
import { admins } from './schema.js';
import { hashPassword } from '../utils/hash.js';

async function seedData() {
  const db = getDb();

  console.log('👤 Melakukan seed akun Administrator...');
  const defaultEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@ecoinclusive.edu';
  const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
  const passwordHash = await hashPassword(defaultPass);

  const existingAdmin = await db.select().from(admins).all();
  if (existingAdmin.length === 0) {
    await db.insert(admins).values({
      id: 'adm-primary',
      username: 'admin',
      email: defaultEmail,
      passwordHash,
      name: 'Pengelola Pembelajaran',
      role: 'admin',
      avatarUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`   Akun admin default dibuat: ${defaultEmail} / ${defaultPass}`);
  } else {
    console.log('   Admin sudah ada di database, lewati pembuatan akun.');
  }

  console.log('🎉 Seeding database selesai dengan sukses!');
  process.exit(0);
}

seedData().catch((err) => {
  console.error('❌ Gagal melakukan seed database:', err);
  process.exit(1);
});
