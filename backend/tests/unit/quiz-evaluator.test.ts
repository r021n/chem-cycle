import { describe, it, expect, beforeAll } from 'vitest';
import { evaluateQuizAnswers } from '../../src/services/quiz-evaluator.service.js';
import { db } from '../../src/db/index.js';
import { quizzes, questions, questionOptions, users } from '../../src/db/schema.js';
import { eq } from 'drizzle-orm';
import { initDatabaseSchema } from '../helpers.js';

describe('Quiz Evaluator Service', () => {
  const testQuizId = 'quiz-eval-test-1';
  const teacherId = 'teacher-eval-1';
  const q1Id = 'q-eval-1';
  const q2Id = 'q-eval-2';
  const opt1Correct = 'opt-eval-1-correct';
  const opt1Wrong = 'opt-eval-1-wrong';
  const opt2Correct = 'opt-eval-2-correct';
  const opt2Wrong = 'opt-eval-2-wrong';

  beforeAll(async () => {
    await initDatabaseSchema();

    // Ensure teacher user exists
    await db
      .insert(users)
      .values({
        id: teacherId,
        username: 'eval_teacher',
        email: 'eval_teacher@chemcycle.id',
        passwordHash: 'hash',
        fullName: 'Eval Teacher',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing();

    // Create test quiz
    await db
      .insert(quizzes)
      .values({
        id: testQuizId,
        title: 'Quiz Evaluator Test',
        slug: 'quiz-evaluator-test',
        passingScore: 70,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing();

    // Create 2 questions with scoreWeight = 10 each
    await db
      .insert(questions)
      .values([
        {
          id: q1Id,
          quizId: testQuizId,
          promptJson: JSON.stringify([{ type: 'paragraph', text: 'Soal 1' }]),
          questionType: 'multiple_choice',
          scoreWeight: 10,
          orderIndex: 1,
          createdAt: new Date(),
        },
        {
          id: q2Id,
          quizId: testQuizId,
          promptJson: JSON.stringify([{ type: 'paragraph', text: 'Soal 2' }]),
          questionType: 'multiple_choice',
          scoreWeight: 10,
          orderIndex: 2,
          createdAt: new Date(),
        },
      ])
      .onConflictDoNothing();

    // Create options
    await db
      .insert(questionOptions)
      .values([
        { id: opt1Correct, questionId: q1Id, optionKey: 'A', content: 'Benar', isCorrect: true },
        { id: opt1Wrong, questionId: q1Id, optionKey: 'B', content: 'Salah', isCorrect: false },
        { id: opt2Correct, questionId: q2Id, optionKey: 'A', content: 'Benar', isCorrect: true },
        { id: opt2Wrong, questionId: q2Id, optionKey: 'B', content: 'Salah', isCorrect: false },
      ])
      .onConflictDoNothing();
  });

  it('should calculate 100% score and mark passed when all answers are correct', async () => {
    const quiz = (await db.select().from(quizzes).where(eq(quizzes.id, testQuizId)))[0];
    const result = await evaluateQuizAnswers(quiz, [
      { questionId: q1Id, selectedOptionId: opt1Correct },
      { questionId: q2Id, selectedOptionId: opt2Correct },
    ]);

    expect(result.totalScore).toBe(100);
    expect(result.isPassed).toBe(true);
    expect(result.evaluatedAnswers).toHaveLength(2);
    expect(result.evaluatedAnswers[0].isCorrect).toBe(true);
    expect(result.evaluatedAnswers[1].isCorrect).toBe(true);
  });

  it('should calculate 50% score and mark failed when passingScore is 70 and only 1 answer is correct', async () => {
    const quiz = (await db.select().from(quizzes).where(eq(quizzes.id, testQuizId)))[0];
    const result = await evaluateQuizAnswers(quiz, [
      { questionId: q1Id, selectedOptionId: opt1Correct },
      { questionId: q2Id, selectedOptionId: opt2Wrong },
    ]);

    expect(result.totalScore).toBe(50);
    expect(result.isPassed).toBe(false);
    expect(result.evaluatedAnswers[0].isCorrect).toBe(true);
    expect(result.evaluatedAnswers[1].isCorrect).toBe(false);
  });

  it('should handle unselected or unanswered questions with 0 score', async () => {
    const quiz = (await db.select().from(quizzes).where(eq(quizzes.id, testQuizId)))[0];
    const result = await evaluateQuizAnswers(quiz, []);

    expect(result.totalScore).toBe(0);
    expect(result.isPassed).toBe(false);
    expect(result.evaluatedAnswers.every((a) => !a.isCorrect)).toBe(true);
  });
});
