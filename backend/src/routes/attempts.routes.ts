import { Hono } from 'hono';
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  quizAttempts,
  quizzes,
  attemptAnswers,
  questions,
  questionOptions,
} from '../db/schema.js';
import { submitAttemptSchema } from '../schemas/quiz.schema.js';
import { validate } from '../utils/validator.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import { evaluateQuizAnswers } from '../services/quiz-evaluator.service.js';

export const attemptsRoutes = new Hono();

// POST /:attemptId/submit - Submit quiz attempt answers
attemptsRoutes.post(
  '/:attemptId/submit',
  authMiddleware,
  validate('json', submitAttemptSchema),
  async (c) => {
    const attemptId = c.req.param('attemptId') as string;
    const user = c.get('user')!;
    const body = c.req.valid('json');

    const matchedAttempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.id, attemptId));

    if (matchedAttempts.length === 0) {
      return c.json({ success: false, message: 'Sesi percobaan kuis tidak ditemukan' }, 404);
    }

    const attempt = matchedAttempts[0];

    // Verify ownership (or admin)
    if (attempt.userId !== user.id && user.role !== 'admin') {
      return c.json(
        {
          success: false,
          message: 'Akses ditolak: Anda tidak memiliki akses ke sesi pengerjaan ini',
        },
        403
      );
    }

    // Prevent re-submitting already completed attempts
    if (attempt.completedAt) {
      return c.json(
        {
          success: false,
          message: 'Sesi percobaan ini sudah pernah disubmit sebelumnya',
        },
        400
      );
    }

    // Fetch quiz
    const matchedQuizzes = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, attempt.quizId));

    if (matchedQuizzes.length === 0) {
      return c.json({ success: false, message: 'Kuis tidak ditemukan' }, 404);
    }

    const quiz = matchedQuizzes[0];

    // Evaluate answers
    const evaluation = await evaluateQuizAnswers(quiz, body.answers);
    const now = new Date();

    // Save individual attempt answers
    for (const evaluated of evaluation.evaluatedAnswers) {
      await db.insert(attemptAnswers).values({
        id: crypto.randomUUID(),
        attemptId,
        questionId: evaluated.questionId,
        selectedOptionId: evaluated.selectedOptionId || null,
        essayAnswer: evaluated.essayAnswer || null,
        isCorrect: evaluated.isCorrect,
        scoreEarned: evaluated.scoreEarned,
      });
    }

    // Update attempt record
    const [updatedAttempt] = await db
      .update(quizAttempts)
      .set({
        totalScore: evaluation.totalScore,
        maxScore: evaluation.maxScore,
        isPassed: evaluation.isPassed,
        completedAt: now,
      })
      .where(eq(quizAttempts.id, attemptId))
      .returning();

    return c.json({
      success: true,
      message: 'Jawaban kuis berhasil dikumpulkan dan dinilai',
      data: {
        attempt: updatedAttempt,
        totalScore: evaluation.totalScore,
        maxScore: evaluation.maxScore,
        isPassed: evaluation.isPassed,
        passingScore: quiz.passingScore,
      },
    });
  }
);

// GET /:attemptId/details - View detailed answers and explanations for an attempt
attemptsRoutes.get('/:attemptId/details', authMiddleware, async (c) => {
  const attemptId = c.req.param('attemptId') as string;
  const user = c.get('user')!;

  const matchedAttempts = await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.id, attemptId));

  if (matchedAttempts.length === 0) {
    return c.json({ success: false, message: 'Sesi percobaan kuis tidak ditemukan' }, 404);
  }

  const attempt = matchedAttempts[0];

  // Verify ownership or admin
  if (attempt.userId !== user.id && user.role !== 'admin') {
    return c.json(
      {
        success: false,
        message: 'Akses ditolak: Anda tidak memiliki akses ke lembar jawaban ini',
      },
      403
    );
  }

  // Fetch quiz
  const quiz = await db.select().from(quizzes).where(eq(quizzes.id, attempt.quizId));

  // Fetch all questions for this quiz
  const quizQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, attempt.quizId));

  // Fetch question options
  const allOptions = await db.select().from(questionOptions);
  const optionsByQuestionId = new Map<string, typeof allOptions>();
  for (const opt of allOptions) {
    const list = optionsByQuestionId.get(opt.questionId) || [];
    list.push(opt);
    optionsByQuestionId.set(opt.questionId, list);
  }

  // Fetch student's submitted answers for this attempt
  const answersList = await db
    .select()
    .from(attemptAnswers)
    .where(eq(attemptAnswers.attemptId, attemptId));

  const answersByQuestionId = new Map<string, typeof answersList[0]>();
  for (const ans of answersList) {
    answersByQuestionId.set(ans.questionId, ans);
  }

  const detailedQuestions = quizQuestions.map((q) => {
    const studentAns = answersByQuestionId.get(q.id);
    const opts = optionsByQuestionId.get(q.id) || [];

    return {
      questionId: q.id,
      promptJson: q.promptJson,
      questionType: q.questionType,
      scoreWeight: q.scoreWeight,
      explanationJson: q.explanationJson,
      options: opts.map((opt) => ({
        id: opt.id,
        optionKey: opt.optionKey,
        content: opt.content,
        imageUrl: opt.imageUrl,
        isCorrect: opt.isCorrect,
      })),
      studentAnswer: studentAns
        ? {
            selectedOptionId: studentAns.selectedOptionId,
            essayAnswer: studentAns.essayAnswer,
            isCorrect: studentAns.isCorrect,
            scoreEarned: studentAns.scoreEarned,
          }
        : null,
    };
  });

  return c.json({
    success: true,
    data: {
      attempt,
      quiz: quiz[0] || null,
      questions: detailedQuestions,
    },
    message: 'Detail lembar jawaban berhasil diambil',
  });
});
