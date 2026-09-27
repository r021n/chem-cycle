import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { quizzes, quizQuestions, auditLogs } from '../db/schema.js';
import { adminAuthMiddleware, AdminPayload } from '../middleware/auth.js';

export const quizzesRoutes = new Hono<{
  Variables: {
    admin: AdminPayload;
  };
}>();

const questionInputSchema = z.object({
  id: z.string().optional(),
  orderIndex: z.number().optional().default(1),
  questionText: z.string().default(''),
  stimulusImage: z.string().optional(),
  sections: z.array(z.any()).optional().default([]),
  choices: z.array(z.any()).optional().default([]),
  correctAnswerId: z.string().optional(),
  correctAnswerIds: z.array(z.string()).optional().default([]),
  explanation: z.string().optional().default(''),
});

const quizPackageSchema = z.object({
  title: z.string().min(1, 'Judul kuis harus diisi'),
  topic: z.string().min(1, 'Topik harus diisi'),
  description: z.string().optional().default(''),
  durationMinutes: z.number().optional().default(15),
  difficulty: z.enum(['Dasar', 'Menengah', 'Lanjutan']).default('Menengah'),
  orderIndex: z.number().optional().default(1),
  isPublished: z.boolean().optional().default(true),
  questions: z.array(questionInputSchema).optional().default([]),
});

// GET /api/quizzes (Public - Published only)
quizzesRoutes.get('/', async (c) => {
  const pkgs = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.isPublished, true))
    .orderBy(asc(quizzes.orderIndex))
    .all();

  const questionsList = await db
    .select()
    .from(quizQuestions)
    .orderBy(asc(quizQuestions.orderIndex))
    .all();

  const formatted = pkgs.map((pkg) => {
    const pkgQuestions = questionsList
      .filter((q) => q.quizId === pkg.id)
      .map((q) => {
        let sections = [];
        let choices = [];
        let correctAnswerIds: string[] = [];
        try {
          if (q.sectionsJson) sections = JSON.parse(q.sectionsJson);
        } catch {}
        try {
          if (q.choicesJson) choices = JSON.parse(q.choicesJson);
        } catch {}
        try {
          if (q.correctAnswerIdsJson) correctAnswerIds = JSON.parse(q.correctAnswerIdsJson);
        } catch {}

        return {
          id: q.id,
          orderIndex: q.orderIndex,
          questionText: q.questionText,
          stimulusImage: q.stimulusImage,
          sections,
          choices,
          correctAnswerIds,
          explanation: q.explanation,
        };
      });

    return {
      ...pkg,
      questionsCount: pkgQuestions.length,
      questions: pkgQuestions,
    };
  });

  return c.json({ success: true, data: formatted });
});

// GET /api/quizzes/admin/all (Protected - Includes drafts & full questions)
quizzesRoutes.get('/admin/all', adminAuthMiddleware, async (c) => {
  const pkgs = await db.select().from(quizzes).orderBy(asc(quizzes.orderIndex)).all();

  const questionsList = await db
    .select()
    .from(quizQuestions)
    .orderBy(asc(quizQuestions.orderIndex))
    .all();

  const formatted = pkgs.map((pkg) => {
    const pkgQuestions = questionsList
      .filter((q) => q.quizId === pkg.id)
      .map((q) => {
        let sections = [];
        let choices = [];
        let correctAnswerIds: string[] = [];
        try {
          if (q.sectionsJson) sections = JSON.parse(q.sectionsJson);
        } catch {}
        try {
          if (q.choicesJson) choices = JSON.parse(q.choicesJson);
        } catch {}
        try {
          if (q.correctAnswerIdsJson) correctAnswerIds = JSON.parse(q.correctAnswerIdsJson);
        } catch {}

        return {
          id: q.id,
          orderIndex: q.orderIndex,
          questionText: q.questionText,
          stimulusImage: q.stimulusImage,
          sections,
          choices,
          correctAnswerIds,
          explanation: q.explanation,
        };
      });

    return {
      ...pkg,
      questions: pkgQuestions,
    };
  });

  return c.json({ success: true, data: formatted });
});

// GET /api/quizzes/:id (Public - Loads full quiz package & questions for client-side local evaluation)
quizzesRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');

  const pkg = await db.select().from(quizzes).where(eq(quizzes.id, id)).get();
  if (!pkg) {
    return c.json({ success: false, message: 'Paket kuis tidak ditemukan' }, 404);
  }

  const questionsData = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, id))
    .orderBy(asc(quizQuestions.orderIndex))
    .all();

  const questions = questionsData.map((q) => {
    let sections = [];
    let choices = [];
    let correctAnswerIds: string[] = [];
    try {
      if (q.sectionsJson) sections = JSON.parse(q.sectionsJson);
    } catch {}
    try {
      if (q.choicesJson) choices = JSON.parse(q.choicesJson);
    } catch {}
    try {
      if (q.correctAnswerIdsJson) correctAnswerIds = JSON.parse(q.correctAnswerIdsJson);
    } catch {}

    return {
      id: q.id,
      orderIndex: q.orderIndex,
      questionText: q.questionText,
      stimulusImage: q.stimulusImage,
      sections,
      choices,
      correctAnswerIds,
      explanation: q.explanation,
    };
  });

  return c.json({
    success: true,
    data: {
      ...pkg,
      questions,
    },
  });
});

// POST /api/quizzes (Protected)
quizzesRoutes.post('/', adminAuthMiddleware, zValidator('json', quizPackageSchema), async (c) => {
  const body = c.req.valid('json');
  const admin = c.get('admin');

  const now = new Date().toISOString();
  const quizId = `quiz-${Date.now()}`;

  await db.insert(quizzes).values({
    id: quizId,
    title: body.title,
    topic: body.topic,
    description: body.description || '',
    durationMinutes: body.durationMinutes || 15,
    difficulty: body.difficulty || 'Menengah',
    orderIndex: body.orderIndex || 1,
    isPublished: body.isPublished ?? true,
    createdAt: now,
    updatedAt: now,
  });

  // Insert questions if provided
  if (body.questions && body.questions.length > 0) {
    for (let i = 0; i < body.questions.length; i++) {
      const q = body.questions[i];
      const qId = q.id || `q-${Date.now()}-${i}`;
      const correctIds = q.correctAnswerIds && q.correctAnswerIds.length > 0
        ? q.correctAnswerIds
        : q.correctAnswerId
        ? [q.correctAnswerId]
        : [];

      await db.insert(quizQuestions).values({
        id: qId,
        quizId,
        orderIndex: i + 1,
        questionText: q.questionText || '',
        stimulusImage: q.stimulusImage || null,
        sectionsJson: JSON.stringify(q.sections || []),
        choicesJson: JSON.stringify(q.choices || []),
        correctAnswerIdsJson: JSON.stringify(correctIds),
        explanation: q.explanation || '',
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  await db.insert(auditLogs).values({
    id: `log-${Date.now()}`,
    action: 'create',
    entityType: 'Kuis',
    entityTitle: body.title,
    author: admin.username,
    createdAt: now,
  });

  return c.json({ success: true, message: 'Paket kuis berhasil dibuat', data: { id: quizId } }, 201);
});

// PUT /api/quizzes/:id (Protected - Replaces/updates questions & meta)
quizzesRoutes.put('/:id', adminAuthMiddleware, zValidator('json', quizPackageSchema.partial()), async (c) => {
  const quizId = c.req.param('id');
  const body = c.req.valid('json');
  const admin = c.get('admin');

  const existing = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).get();
  if (!existing) {
    return c.json({ success: false, message: 'Paket kuis tidak ditemukan' }, 404);
  }

  const now = new Date().toISOString();

  // Update quiz metadata
  const metaUpdates: Partial<typeof quizzes.$inferInsert> = {
    updatedAt: now,
  };
  if (body.title !== undefined) metaUpdates.title = body.title;
  if (body.topic !== undefined) metaUpdates.topic = body.topic;
  if (body.description !== undefined) metaUpdates.description = body.description;
  if (body.durationMinutes !== undefined) metaUpdates.durationMinutes = body.durationMinutes;
  if (body.difficulty !== undefined) metaUpdates.difficulty = body.difficulty;
  if (body.orderIndex !== undefined) metaUpdates.orderIndex = body.orderIndex;
  if (body.isPublished !== undefined) metaUpdates.isPublished = body.isPublished;

  await db.update(quizzes).set(metaUpdates).where(eq(quizzes.id, quizId));

  // If questions array is supplied, replace all questions for this quiz
  if (body.questions) {
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, quizId));

    for (let i = 0; i < body.questions.length; i++) {
      const q = body.questions[i];
      const qId = q.id || `q-${Date.now()}-${i}`;
      const correctIds =
        q.correctAnswerIds && q.correctAnswerIds.length > 0
          ? q.correctAnswerIds
          : q.correctAnswerId
          ? [q.correctAnswerId]
          : [];

      await db.insert(quizQuestions).values({
        id: qId,
        quizId,
        orderIndex: i + 1,
        questionText: q.questionText || '',
        stimulusImage: q.stimulusImage || null,
        sectionsJson: JSON.stringify(q.sections || []),
        choicesJson: JSON.stringify(q.choices || []),
        correctAnswerIdsJson: JSON.stringify(correctIds),
        explanation: q.explanation || '',
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  await db.insert(auditLogs).values({
    id: `log-${Date.now()}`,
    action: 'update',
    entityType: 'Kuis',
    entityTitle: metaUpdates.title || existing.title,
    author: admin.username,
    createdAt: now,
  });

  return c.json({ success: true, message: 'Paket kuis berhasil diperbarui' });
});

// DELETE /api/quizzes/:id (Protected)
quizzesRoutes.delete('/:id', adminAuthMiddleware, async (c) => {
  const quizId = c.req.param('id');
  const admin = c.get('admin');

  const existing = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).get();
  if (!existing) {
    return c.json({ success: false, message: 'Paket kuis tidak ditemukan' }, 404);
  }

  // Delete questions and quiz package
  await db.delete(quizQuestions).where(eq(quizQuestions.quizId, quizId));
  await db.delete(quizzes).where(eq(quizzes.id, quizId));

  await db.insert(auditLogs).values({
    id: `log-${Date.now()}`,
    action: 'delete',
    entityType: 'Kuis',
    entityTitle: existing.title,
    author: admin.username,
    createdAt: new Date().toISOString(),
  });

  return c.json({ success: true, message: 'Paket kuis berhasil dihapus' });
});

// PATCH /api/quizzes/:id/publish (Protected)
quizzesRoutes.patch('/:id/publish', adminAuthMiddleware, async (c) => {
  const quizId = c.req.param('id');
  const admin = c.get('admin');

  const existing = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).get();
  if (!existing) {
    return c.json({ success: false, message: 'Paket kuis tidak ditemukan' }, 404);
  }

  const newStatus = !existing.isPublished;
  await db
    .update(quizzes)
    .set({ isPublished: newStatus, updatedAt: new Date().toISOString() })
    .where(eq(quizzes.id, quizId));

  await db.insert(auditLogs).values({
    id: `log-${Date.now()}`,
    action: newStatus ? 'publish' : 'update',
    entityType: 'Kuis',
    entityTitle: `${existing.title} (${newStatus ? 'Terbit' : 'Draf'})`,
    author: admin.username,
    createdAt: new Date().toISOString(),
  });

  return c.json({ success: true, isPublished: newStatus });
});
