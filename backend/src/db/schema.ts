import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. ADMINS TABLE (Only for platform administrators; zero student data collection)
export const admins = sqliteTable('admins', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull().default('Administrator'),
  role: text('role').notNull().default('admin'),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

// 2. MEDIA BLOBS TABLE (Binary storage for compressed images and documents)
export const mediaBlobs = sqliteTable('media_blobs', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  data: blob('data', { mode: 'buffer' }).notNull(),
  uploadedBy: text('uploaded_by'),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

// 3. MATERIALS TABLE (Learning modules / chapters)
export const materials = sqliteTable('materials', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  summary: text('summary'),
  coverUrl: text('cover_url'),
  orderIndex: integer('order_index').notNull().default(1),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
  contentJson: text('content_json').notNull(), // JSON string AST Block Notion
  category: text('category'),
  learningObjectivesJson: text('learning_objectives_json'),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

// 4. MATERIAL COMMENTS TABLE (DDoS and spam protected)
export const materialComments = sqliteTable('material_comments', {
  id: text('id').primaryKey(),
  materialId: text('material_id')
    .notNull()
    .references(() => materials.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email'),
  body: text('body').notNull(),
  ipHash: text('ip_hash').notNull(),
  isApproved: integer('is_approved', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

// 5. ACTIVITIES TABLE (Interactive lab announcements / modules)
export const activities = sqliteTable('activities', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  summary: text('summary'),
  orderIndex: integer('order_index').notNull().default(1),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
  contentJson: text('content_json').notNull(),
  attachmentsJson: text('attachments_json'),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

// 6. QUIZZES TABLE (Quiz packages)
export const quizzes = sqliteTable('quizzes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  topic: text('topic').notNull(),
  description: text('description'),
  durationMinutes: integer('duration_minutes').notNull().default(15),
  difficulty: text('difficulty').notNull().default('Menengah'),
  orderIndex: integer('order_index').notNull().default(1),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

// 7. QUIZ QUESTIONS TABLE
export const quizQuestions = sqliteTable('quiz_questions', {
  id: text('id').primaryKey(),
  quizId: text('quiz_id')
    .notNull()
    .references(() => quizzes.id, { onDelete: 'cascade' }),
  orderIndex: integer('order_index').notNull().default(1),
  questionText: text('question_text').notNull(),
  stimulusImage: text('stimulus_image'),
  sectionsJson: text('sections_json').notNull().default('[]'),
  choicesJson: text('choices_json').notNull().default('[]'),
  correctAnswerIdsJson: text('correct_answer_ids_json').notNull().default('[]'),
  explanation: text('explanation').notNull().default(''),
  wrongAnswerExplanation: text('wrong_answer_explanation').default(''),
  conceptSummary: text('concept_summary').notNull().default(''),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

// 8. AUDIT LOGS TABLE
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  action: text('action').notNull(), // 'create' | 'update' | 'delete' | 'publish'
  entityType: text('entity_type').notNull(), // 'Materi' | 'Aktivitas' | 'Kuis' | 'Pengaturan'
  entityTitle: text('entity_title').notNull(),
  author: text('author').notNull().default('Admin'),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});
