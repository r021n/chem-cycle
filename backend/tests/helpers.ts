import { client } from '../src/db/index.js';
import { createToken } from '../src/utils/jwt.js';

export async function initDatabaseSchema() {
  await client.execute('PRAGMA journal_mode = WAL;');
  await client.execute('PRAGMA busy_timeout = 5000;');
  await client.execute('PRAGMA foreign_keys = OFF;');

  // Drop existing tables so schema changes are always applied on a fresh database
  const dropStatements = [
    `DROP TABLE IF EXISTS discussion_likes;`,
    `DROP TABLE IF EXISTS discussion_comments;`,
    `DROP TABLE IF EXISTS discussion_posts;`,
    `DROP TABLE IF EXISTS activity_submissions;`,
    `DROP TABLE IF EXISTS activity_attachments;`,
    `DROP TABLE IF EXISTS activities;`,
    `DROP TABLE IF EXISTS attempt_answers;`,
    `DROP TABLE IF EXISTS quiz_attempts;`,
    `DROP TABLE IF EXISTS question_options;`,
    `DROP TABLE IF EXISTS questions;`,
    `DROP TABLE IF EXISTS quizzes;`,
    `DROP TABLE IF EXISTS materials;`,
    `DROP TABLE IF EXISTS users;`,
  ];

  for (const sql of dropStatements) {
    await client.execute(sql);
  }

  // Execute DDL statements sequentially
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      identity_number TEXT,
      role TEXT NOT NULL DEFAULT 'student',
      avatar_url TEXT,
      bio TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content_json TEXT NOT NULL,
      summary TEXT,
      estimated_read_time INTEGER DEFAULT 10,
      order_index INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      time_limit_minutes INTEGER,
      passing_score INTEGER NOT NULL DEFAULT 70,
      max_attempts INTEGER,
      is_published INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      prompt_json TEXT NOT NULL,
      question_type TEXT NOT NULL DEFAULT 'multiple_choice',
      score_weight INTEGER NOT NULL DEFAULT 10,
      order_index INTEGER NOT NULL DEFAULT 0,
      explanation_json TEXT,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS question_options (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      option_key TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      is_correct INTEGER NOT NULL DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      attempt_number INTEGER NOT NULL,
      total_score INTEGER NOT NULL DEFAULT 0,
      max_score INTEGER NOT NULL DEFAULT 100,
      is_passed INTEGER NOT NULL DEFAULT 0,
      started_at INTEGER NOT NULL,
      completed_at INTEGER
    );`,
    `CREATE TABLE IF NOT EXISTS attempt_answers (
      id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
      question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      selected_option_id TEXT REFERENCES question_options(id),
      essay_answer TEXT,
      is_correct INTEGER NOT NULL DEFAULT 0,
      score_earned INTEGER NOT NULL DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      instruction TEXT NOT NULL,
      due_date INTEGER,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS activity_attachments (
      id TEXT PRIMARY KEY,
      activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS activity_submissions (
      id TEXT PRIMARY KEY,
      activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'completed',
      completed_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS discussion_posts (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      media_url TEXT,
      like_count INTEGER NOT NULL DEFAULT 0,
      comment_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS discussion_comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES discussion_posts(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      parent_comment_id TEXT REFERENCES discussion_comments(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS discussion_likes (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES discussion_posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL
    );`,
  ];

  for (const sql of statements) {
    await client.execute(sql);
  }

  await client.execute('PRAGMA foreign_keys = ON;');
}

export async function createTestAdminToken(id = 'test-admin-id') {
  return createToken({
    id,
    username: 'admin_test',
    email: 'admin_test@chemcycle.id',
    role: 'admin',
    fullName: 'Admin Test Teacher',
  });
}

export async function createTestStudentToken(id = 'test-student-id') {
  return createToken({
    id,
    username: 'student_test',
    email: 'student_test@chemcycle.id',
    role: 'student',
    fullName: 'Student Test User',
  });
}
