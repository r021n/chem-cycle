import { sqliteTable, text, integer, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// --- 1. USERS & AUTH ---
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  identityNumber: text('identity_number'),
  role: text('role', { enum: ['admin', 'student'] }).notNull().default('student'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// --- 2. LEARNING MATERIALS ---
export const materials = sqliteTable('materials', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  contentJson: text('content_json').notNull(),
  summary: text('summary'),
  estimatedReadTime: integer('estimated_read_time').default(10),
  orderIndex: integer('order_index').notNull().default(0),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// --- 3. QUIZZES, QUESTIONS, ATTEMPTS & ANSWERS ---
export const quizzes = sqliteTable('quizzes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  timeLimitMinutes: integer('time_limit_minutes'),
  passingScore: integer('passing_score').notNull().default(70),
  maxAttempts: integer('max_attempts'),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  quizId: text('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  promptJson: text('prompt_json').notNull(),
  questionType: text('question_type', { enum: ['multiple_choice', 'essay'] }).notNull().default('multiple_choice'),
  scoreWeight: integer('score_weight').notNull().default(10),
  orderIndex: integer('order_index').notNull().default(0),
  explanationJson: text('explanation_json'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const questionOptions = sqliteTable('question_options', {
  id: text('id').primaryKey(),
  questionId: text('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  optionKey: text('option_key').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull().default(false),
});

export const quizAttempts = sqliteTable('quiz_attempts', {
  id: text('id').primaryKey(),
  quizId: text('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  attemptNumber: integer('attempt_number').notNull(),
  totalScore: integer('total_score').notNull().default(0),
  maxScore: integer('max_score').notNull().default(100),
  isPassed: integer('is_passed', { mode: 'boolean' }).notNull().default(false),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

export const attemptAnswers = sqliteTable('attempt_answers', {
  id: text('id').primaryKey(),
  attemptId: text('attempt_id').notNull().references(() => quizAttempts.id, { onDelete: 'cascade' }),
  questionId: text('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  selectedOptionId: text('selected_option_id').references(() => questionOptions.id),
  essayAnswer: text('essay_answer'),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull().default(false),
  scoreEarned: integer('score_earned').notNull().default(0),
});

// --- 4. CLASSROOM ACTIVITIES & SUBMISSIONS ---
export const activities = sqliteTable('activities', {
  id: text('id').primaryKey(),
  authorId: text('author_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  instruction: text('instruction').notNull(),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const activityAttachments = sqliteTable('activity_attachments', {
  id: text('id').primaryKey(),
  activityId: text('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['document', 'link'] }).notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const activitySubmissions = sqliteTable('activity_submissions', {
  id: text('id').primaryKey(),
  activityId: text('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['submitted', 'completed'] }).notNull().default('completed'),
  completedAt: integer('completed_at', { mode: 'timestamp' }).notNull(),
});

// --- 5. SOCIAL DISCUSSIONS, COMMENTS & LIKES ---
export const discussionPosts = sqliteTable('discussion_posts', {
  id: text('id').primaryKey(),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  mediaUrl: text('media_url'),
  likeCount: integer('like_count').notNull().default(0),
  commentCount: integer('comment_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const discussionComments = sqliteTable('discussion_comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => discussionPosts.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentCommentId: text('parent_comment_id').references((): AnySQLiteColumn => discussionComments.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const discussionLikes = sqliteTable('discussion_likes', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => discussionPosts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// --- RELATIONS ---
export const usersRelations = relations(users, ({ many }) => ({
  activities: many(activities),
  quizAttempts: many(quizAttempts),
  activitySubmissions: many(activitySubmissions),
  discussionPosts: many(discussionPosts),
  discussionComments: many(discussionComments),
  discussionLikes: many(discussionLikes),
}));

export const quizzesRelations = relations(quizzes, ({ many }) => ({
  questions: many(questions),
  attempts: many(quizAttempts),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, { fields: [questions.quizId], references: [quizzes.id] }),
  options: many(questionOptions),
  attemptAnswers: many(attemptAnswers),
}));

export const questionOptionsRelations = relations(questionOptions, ({ one }) => ({
  question: one(questions, { fields: [questionOptions.questionId], references: [questions.id] }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one, many }) => ({
  quiz: one(quizzes, { fields: [quizAttempts.quizId], references: [quizzes.id] }),
  user: one(users, { fields: [quizAttempts.userId], references: [users.id] }),
  answers: many(attemptAnswers),
}));

export const attemptAnswersRelations = relations(attemptAnswers, ({ one }) => ({
  attempt: one(quizAttempts, { fields: [attemptAnswers.attemptId], references: [quizAttempts.id] }),
  question: one(questions, { fields: [attemptAnswers.questionId], references: [questions.id] }),
  selectedOption: one(questionOptions, { fields: [attemptAnswers.selectedOptionId], references: [questionOptions.id] }),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  author: one(users, { fields: [activities.authorId], references: [users.id] }),
  attachments: many(activityAttachments),
  submissions: many(activitySubmissions),
}));

export const activityAttachmentsRelations = relations(activityAttachments, ({ one }) => ({
  activity: one(activities, { fields: [activityAttachments.activityId], references: [activities.id] }),
}));

export const activitySubmissionsRelations = relations(activitySubmissions, ({ one }) => ({
  activity: one(activities, { fields: [activitySubmissions.activityId], references: [activities.id] }),
  user: one(users, { fields: [activitySubmissions.userId], references: [users.id] }),
}));

export const discussionPostsRelations = relations(discussionPosts, ({ one, many }) => ({
  author: one(users, { fields: [discussionPosts.authorId], references: [users.id] }),
  comments: many(discussionComments),
  likes: many(discussionLikes),
}));

export const discussionCommentsRelations = relations(discussionComments, ({ one, many }) => ({
  post: one(discussionPosts, { fields: [discussionComments.postId], references: [discussionPosts.id] }),
  author: one(users, { fields: [discussionComments.authorId], references: [users.id] }),
  parent: one(discussionComments, { fields: [discussionComments.parentCommentId], references: [discussionComments.id], relationName: 'replies' }),
  replies: many(discussionComments, { relationName: 'replies' }),
}));

export const discussionLikesRelations = relations(discussionLikes, ({ one }) => ({
  post: one(discussionPosts, { fields: [discussionLikes.postId], references: [discussionPosts.id] }),
  user: one(users, { fields: [discussionLikes.userId], references: [users.id] }),
}));
