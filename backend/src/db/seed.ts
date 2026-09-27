import { client, db } from './index.js';
import { admins } from './schema.js';
import { hashPassword } from '../utils/hash.js';

async function initTables() {
  console.log('📦 Memeriksa & membuat tabel database SQLite...');

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT 'Administrator',
      role TEXT NOT NULL DEFAULT 'admin',
      avatar_url TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS media_blobs (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      data BLOB NOT NULL,
      uploaded_by TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      summary TEXT,
      cover_url TEXT,
      order_index INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      content_json TEXT NOT NULL,
      category TEXT,
      learning_objectives_json TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS material_comments (
      id TEXT PRIMARY KEY,
      material_id TEXT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT,
      body TEXT NOT NULL,
      ip_hash TEXT NOT NULL,
      is_approved INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      summary TEXT,
      order_index INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      content_json TEXT NOT NULL,
      attachments_json TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      description TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 15,
      difficulty TEXT NOT NULL DEFAULT 'Menengah',
      order_index INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      order_index INTEGER NOT NULL DEFAULT 1,
      question_text TEXT NOT NULL,
      stimulus_image TEXT,
      sections_json TEXT NOT NULL DEFAULT '[]',
      choices_json TEXT NOT NULL DEFAULT '[]',
      correct_answer_ids_json TEXT NOT NULL DEFAULT '[]',
      explanation TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_title TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'Admin',
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );
  `);

  console.log('✅ Skema tabel database SQLite siap.');
}

async function seedData() {
  await initTables();

  // Seed Admin
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

  console.log('🎉 Migrasi dan Seeding Database SQLite Selesai dengan Sukses!');
  process.exit(0);
}

seedData().catch((err) => {
  console.error('❌ Gagal melakukan seed database:', err);
  process.exit(1);
});
