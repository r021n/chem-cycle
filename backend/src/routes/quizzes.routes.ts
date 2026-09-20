import { Hono } from 'hono';
import crypto from 'node:crypto';
import { eq, and, asc, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  quizzes,
  questions,
  questionOptions,
  quizAttempts,
  modules,
  users,
} from '../db/schema.js';
import {
  createQuizSchema,
  updateQuizSchema,
  createQuestionSchema,
  updateQuestionSchema,
} from '../schemas/quiz.schema.js';
import { validate } from '../utils/validator.js';
import { slugify } from '../utils/slug.js';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth-middleware.js';
import { requireRole } from '../middlewares/role-middleware.js';

export const quizzesRoutes = new Hono();

// GET / - List all quizzes
quizzesRoutes.get('/', async (c) => {
  const allQuizzes = await db
    .select({
      id: quizzes.id,
      moduleId: quizzes.moduleId,
      title: quizzes.title,
      slug: quizzes.slug,
      description: quizzes.description,
      timeLimitMinutes: quizzes.timeLimitMinutes,
      passingScore: quizzes.passingScore,
      maxAttempts: quizzes.maxAttempts,
      isPublished: quizzes.isPublished,
      createdAt: quizzes.createdAt,
      updatedAt: quizzes.updatedAt,
    })
    .from(quizzes)
    .orderBy(desc(quizzes.createdAt));

  const allModules = await db.select().from(modules);
  const moduleMap = new Map(allModules.map((m) => [m.id, m]));

  // Get question counts
  const allQuestions = await db.select({ id: questions.id, quizId: questions.quizId }).from(questions);
  const questionCountMap = new Map<string, number>();
  for (const q of allQuestions) {
    questionCountMap.set(q.quizId, (questionCountMap.get(q.quizId) || 0) + 1);
  }

  const result = allQuizzes.map((q) => ({
    ...q,
    module: q.moduleId ? moduleMap.get(q.moduleId) || null : null,
    totalQuestions: questionCountMap.get(q.id) || 0,
  }));

  return c.json({
    success: true,
    data: result,
    message: 'Daftar kuis berhasil diambil',
  });
});

// GET /:id - Get quiz metadata and questions (strip answer keys for students!)
quizzesRoutes.get('/:id', optionalAuthMiddleware, async (c) => {
  const id = c.req.param('id') as string;
  const user = c.get('user');
  const isAdmin = user?.role === 'admin';

  const matched = await db.select().from(quizzes).where(eq(quizzes.id, id));
  if (matched.length === 0) {
    return c.json({ success: false, message: 'Kuis tidak ditemukan' }, 404);
  }

  const quiz = matched[0];

  const quizQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, id))
    .orderBy(asc(questions.orderIndex), asc(questions.createdAt));

  const allOptions = await db.select().from(questionOptions);
  const optionsByQuestionId = new Map<string, typeof allOptions>();
  for (const opt of allOptions) {
    const list = optionsByQuestionId.get(opt.questionId) || [];
    list.push(opt);
    optionsByQuestionId.set(opt.questionId, list);
  }

  const formattedQuestions = quizQuestions.map((q) => {
    const rawOptions = optionsByQuestionId.get(q.id) || [];
    const sanitizedOptions = rawOptions.map((opt) => ({
      id: opt.id,
      optionKey: opt.optionKey,
      content: opt.content,
      imageUrl: opt.imageUrl,
      // Only admin sees isCorrect flag!
      ...(isAdmin ? { isCorrect: opt.isCorrect } : {}),
    }));

    return {
      id: q.id,
      promptJson: q.promptJson,
      questionType: q.questionType,
      scoreWeight: q.scoreWeight,
      orderIndex: q.orderIndex,
      // Only admin sees explanation before submission
      ...(isAdmin ? { explanationJson: q.explanationJson } : {}),
      options: sanitizedOptions,
    };
  });

  return c.json({
    success: true,
    data: {
      ...quiz,
      questions: formattedQuestions,
    },
    message: 'Detail kuis berhasil diambil',
  });
});

// POST / - Create new quiz (Admin only)
quizzesRoutes.post(
  '/',
  authMiddleware,
  requireRole(['admin']),
  validate('json', createQuizSchema),
  async (c) => {
    const body = c.req.valid('json');
    const slug = body.slug || slugify(body.title) || `kuis-${Date.now()}`;
    const id = crypto.randomUUID();
    const now = new Date();

    const [created] = await db
      .insert(quizzes)
      .values({
        id,
        moduleId: body.moduleId || null,
        title: body.title,
        slug,
        description: body.description || null,
        timeLimitMinutes: body.timeLimitMinutes || null,
        passingScore: body.passingScore ?? 70,
        maxAttempts: body.maxAttempts || null,
        isPublished: body.isPublished ?? false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return c.json(
      {
        success: true,
        data: created,
        message: 'Kuis berhasil dibuat',
      },
      201
    );
  }
);

// PUT /:id - Update quiz (Admin only)
quizzesRoutes.put(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  validate('json', updateQuizSchema),
  async (c) => {
    const id = c.req.param('id') as string;
    const body = c.req.valid('json');

    const matched = await db.select().from(quizzes).where(eq(quizzes.id, id));
    if (matched.length === 0) {
      return c.json({ success: false, message: 'Kuis tidak ditemukan' }, 404);
    }

    const updateData: Partial<typeof quizzes.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.moduleId !== undefined) updateData.moduleId = body.moduleId;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.timeLimitMinutes !== undefined) updateData.timeLimitMinutes = body.timeLimitMinutes;
    if (body.passingScore !== undefined) updateData.passingScore = body.passingScore;
    if (body.maxAttempts !== undefined) updateData.maxAttempts = body.maxAttempts;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;

    const [updated] = await db
      .update(quizzes)
      .set(updateData)
      .where(eq(quizzes.id, id))
      .returning();

    return c.json({
      success: true,
      data: updated,
      message: 'Kuis berhasil diperbarui',
    });
  }
);

// DELETE /:id - Delete quiz (Admin only)
quizzesRoutes.delete('/:id', authMiddleware, requireRole(['admin']), async (c) => {
  const id = c.req.param('id') as string;
  const matched = await db.select().from(quizzes).where(eq(quizzes.id, id));

  if (matched.length === 0) {
    return c.json({ success: false, message: 'Kuis tidak ditemukan' }, 404);
  }

  await db.delete(quizzes).where(eq(quizzes.id, id));

  return c.json({
    success: true,
    message: 'Kuis berhasil dihapus',
  });
});

// POST /:id/questions - Add question to quiz (Admin only)
quizzesRoutes.post(
  '/:id/questions',
  authMiddleware,
  requireRole(['admin']),
  validate('json', createQuestionSchema),
  async (c) => {
    const quizId = c.req.param('id') as string;
    const body = c.req.valid('json');

    const quiz = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
    if (quiz.length === 0) {
      return c.json({ success: false, message: 'Kuis tidak ditemukan' }, 404);
    }

    const questionId = crypto.randomUUID();
    const now = new Date();

    const [newQuestion] = await db
      .insert(questions)
      .values({
        id: questionId,
        quizId,
        promptJson: body.promptJson,
        questionType: body.questionType || 'multiple_choice',
        scoreWeight: body.scoreWeight ?? 10,
        orderIndex: body.orderIndex ?? 0,
        explanationJson: body.explanationJson || null,
        createdAt: now,
      })
      .returning();

    const insertedOptions = [];
    if (body.options && body.options.length > 0) {
      for (const opt of body.options) {
        const optionId = opt.id || crypto.randomUUID();
        const [o] = await db
          .insert(questionOptions)
          .values({
            id: optionId,
            questionId,
            optionKey: opt.optionKey,
            content: opt.content,
            imageUrl: opt.imageUrl || null,
            isCorrect: opt.isCorrect ?? false,
          })
          .returning();
        insertedOptions.push(o);
      }
    }

    return c.json(
      {
        success: true,
        data: {
          ...newQuestion,
          options: insertedOptions,
        },
        message: 'Soal berhasil ditambahkan ke kuis',
      },
      201
    );
  }
);

// PUT /questions/:questionId - Update question (Admin only)
quizzesRoutes.put(
  '/questions/:questionId',
  authMiddleware,
  requireRole(['admin']),
  validate('json', updateQuestionSchema),
  async (c) => {
    const questionId = c.req.param('questionId') as string;
    const body = c.req.valid('json');

    const matched = await db.select().from(questions).where(eq(questions.id, questionId));
    if (matched.length === 0) {
      return c.json({ success: false, message: 'Soal tidak ditemukan' }, 404);
    }

    const updateData: Partial<typeof questions.$inferInsert> = {};
    if (body.promptJson !== undefined) updateData.promptJson = body.promptJson;
    if (body.questionType !== undefined) updateData.questionType = body.questionType;
    if (body.scoreWeight !== undefined) updateData.scoreWeight = body.scoreWeight;
    if (body.orderIndex !== undefined) updateData.orderIndex = body.orderIndex;
    if (body.explanationJson !== undefined) updateData.explanationJson = body.explanationJson;

    let updatedQuestion = matched[0];
    if (Object.keys(updateData).length > 0) {
      const [uq] = await db
        .update(questions)
        .set(updateData)
        .where(eq(questions.id, questionId))
        .returning();
      updatedQuestion = uq;
    }

    // Replace options if provided
    if (body.options !== undefined) {
      await db.delete(questionOptions).where(eq(questionOptions.questionId, questionId));
      for (const opt of body.options) {
        await db.insert(questionOptions).values({
          id: opt.id || crypto.randomUUID(),
          questionId,
          optionKey: opt.optionKey,
          content: opt.content,
          imageUrl: opt.imageUrl || null,
          isCorrect: opt.isCorrect ?? false,
        });
      }
    }

    const updatedOptions = await db
      .select()
      .from(questionOptions)
      .where(eq(questionOptions.questionId, questionId));

    return c.json({
      success: true,
      data: {
        ...updatedQuestion,
        options: updatedOptions,
      },
      message: 'Soal berhasil diperbarui',
    });
  }
);

// DELETE /questions/:questionId - Delete question (Admin only)
quizzesRoutes.delete(
  '/questions/:questionId',
  authMiddleware,
  requireRole(['admin']),
  async (c) => {
    const questionId = c.req.param('questionId') as string;
    const matched = await db.select().from(questions).where(eq(questions.id, questionId));

    if (matched.length === 0) {
      return c.json({ success: false, message: 'Soal tidak ditemukan' }, 404);
    }

    await db.delete(questions).where(eq(questions.id, questionId));

    return c.json({
      success: true,
      message: 'Soal berhasil dihapus',
    });
  }
);

// POST /:id/attempts - Start a new quiz attempt (Student / Authenticated)
quizzesRoutes.post('/:id/attempts', authMiddleware, async (c) => {
  const quizId = c.req.param('id') as string;
  const user = c.get('user')!;

  const matched = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
  if (matched.length === 0) {
    return c.json({ success: false, message: 'Kuis tidak ditemukan' }, 404);
  }

  const quiz = matched[0];

  // Fetch previous attempts
  const prevAttempts = await db
    .select()
    .from(quizAttempts)
    .where(and(eq(quizAttempts.quizId, quizId), eq(quizAttempts.userId, user.id)))
    .orderBy(desc(quizAttempts.attemptNumber));

  if (quiz.maxAttempts && prevAttempts.length >= quiz.maxAttempts) {
    return c.json(
      {
        success: false,
        message: `Batas maksimum percobaan (${quiz.maxAttempts} kali) telah tercapai`,
      },
      400
    );
  }

  // Check if there is an unfinished attempt
  const unfinishedAttempt = prevAttempts.find((a) => !a.completedAt);
  if (unfinishedAttempt) {
    return c.json({
      success: true,
      message: 'Melanjutkan sesi pengerjaan yang belum disubmit',
      data: unfinishedAttempt,
    });
  }

  const nextAttemptNumber = prevAttempts.length + 1;
  const attemptId = crypto.randomUUID();
  const now = new Date();

  const [attempt] = await db
    .insert(quizAttempts)
    .values({
      id: attemptId,
      quizId,
      userId: user.id,
      attemptNumber: nextAttemptNumber,
      totalScore: 0,
      maxScore: 100,
      isPassed: false,
      startedAt: now,
      completedAt: null,
    })
    .returning();

  return c.json(
    {
      success: true,
      data: attempt,
      message: `Percobaan ke-${nextAttemptNumber} berhasil dimulai`,
    },
    201
  );
});

// GET /:id/my-attempts - Get current student's attempts on this quiz
quizzesRoutes.get('/:id/my-attempts', authMiddleware, async (c) => {
  const quizId = c.req.param('id') as string;
  const user = c.get('user')!;

  const attempts = await db
    .select()
    .from(quizAttempts)
    .where(and(eq(quizAttempts.quizId, quizId), eq(quizAttempts.userId, user.id)))
    .orderBy(desc(quizAttempts.attemptNumber));

  return c.json({
    success: true,
    data: attempts,
    message: 'Riwayat pengerjaan kuis berhasil diambil',
  });
});

// GET /:id/monitoring - Teacher monitoring recap (Admin only)
quizzesRoutes.get('/:id/monitoring', authMiddleware, requireRole(['admin']), async (c) => {
  const quizId = c.req.param('id') as string;

  const quiz = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
  if (quiz.length === 0) {
    return c.json({ success: false, message: 'Kuis tidak ditemukan' }, 404);
  }

  const allAttempts = await db
    .select({
      id: quizAttempts.id,
      quizId: quizAttempts.quizId,
      userId: quizAttempts.userId,
      attemptNumber: quizAttempts.attemptNumber,
      totalScore: quizAttempts.totalScore,
      maxScore: quizAttempts.maxScore,
      isPassed: quizAttempts.isPassed,
      startedAt: quizAttempts.startedAt,
      completedAt: quizAttempts.completedAt,
      userName: users.fullName,
      userEmail: users.email,
      identityNumber: users.identityNumber,
    })
    .from(quizAttempts)
    .innerJoin(users, eq(quizAttempts.userId, users.id))
    .where(eq(quizAttempts.quizId, quizId))
    .orderBy(desc(quizAttempts.attemptNumber), desc(quizAttempts.startedAt));

  // Group by student
  const studentMap = new Map<
    string,
    {
      userId: string;
      fullName: string;
      email: string;
      identityNumber: string | null;
      attemptsCount: number;
      highestScore: number;
      latestScore: number;
      isPassedLatest: boolean;
      lastAttemptDate: Date | null;
      attempts: typeof allAttempts;
    }
  >();

  for (const att of allAttempts) {
    const existing = studentMap.get(att.userId);
    if (!existing) {
      studentMap.set(att.userId, {
        userId: att.userId,
        fullName: att.userName,
        email: att.userEmail,
        identityNumber: att.identityNumber,
        attemptsCount: 1,
        highestScore: att.totalScore,
        latestScore: att.totalScore,
        isPassedLatest: att.isPassed,
        lastAttemptDate: att.completedAt || att.startedAt,
        attempts: [att],
      });
    } else {
      existing.attemptsCount += 1;
      if (att.totalScore > existing.highestScore) {
        existing.highestScore = att.totalScore;
      }
      existing.attempts.push(att);
    }
  }

  return c.json({
    success: true,
    data: {
      quiz: quiz[0],
      totalStudentsAttempted: studentMap.size,
      totalAttempts: allAttempts.length,
      studentRecap: Array.from(studentMap.values()),
    },
    message: 'Data monitoring kuis berhasil diambil',
  });
});
