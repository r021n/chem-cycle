import { describe, it, expect, beforeAll } from 'vitest';
import app from '../../src/index.js';
import { initDatabaseSchema, createTestAdminToken, createTestStudentToken } from '../helpers.js';
import { db } from '../../src/db/index.js';
import { users } from '../../src/db/schema.js';

describe('Quizzes and Exam Engine Integration', () => {
  let adminToken = '';
  let studentToken = '';
  const studentUserId = 'student-exam-tester';

  beforeAll(async () => {
    await initDatabaseSchema();
    adminToken = await createTestAdminToken('admin-exam-tester');
    studentToken = await createTestStudentToken(studentUserId);

    // Ensure student exists in DB for foreign key constraint
    await db
      .insert(users)
      .values({
        id: studentUserId,
        username: 'student_exam_tester',
        email: 'student_exam_tester@chemcycle.test',
        passwordHash: 'hash',
        fullName: 'Student Exam Tester',
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing();
  });

  let quizId = '';
  let questionId = '';
  let correctOptionId = '';
  let wrongOptionId = '';
  let attempt1Id = '';

  it('should allow admin to create a quiz', async () => {
    const res = await app.request('/api/v1/quizzes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Kuis Struktur Atom',
        slug: `kuis-atom-${Date.now()}`,
        description: 'Uji pemahaman nomor atom, nomor massa, dan konfigurasi elektron.',
        timeLimitMinutes: 20,
        passingScore: 70,
        maxAttempts: 3,
        isPublished: true,
      }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    quizId = body.data.id;
  });

  it('should allow admin to add question with options to the quiz', async () => {
    const res = await app.request(`/api/v1/quizzes/${quizId}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        promptJson: JSON.stringify([
          { type: 'paragraph', content: [{ type: 'text', text: 'Partikel penyusun inti atom adalah...' }] },
        ]),
        questionType: 'multiple_choice',
        scoreWeight: 100,
        orderIndex: 1,
        explanationJson: 'Inti atom tersusun atas proton yang bermuatan positif dan neutron yang netral.',
        options: [
          { optionKey: 'A', content: 'Proton dan Elektron', isCorrect: false },
          { optionKey: 'B', content: 'Proton dan Neutron', isCorrect: true },
          { optionKey: 'C', content: 'Elektron dan Neutron', isCorrect: false },
        ],
      }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    questionId = body.data.id;

    const optCorrect = body.data.options.find((o: any) => o.isCorrect === true);
    const optWrong = body.data.options.find((o: any) => o.isCorrect === false);
    expect(optCorrect).toBeDefined();
    expect(optWrong).toBeDefined();

    correctOptionId = optCorrect.id;
    wrongOptionId = optWrong.id;
  });

  it('should strip answer keys (isCorrect) when fetched by student', async () => {
    const res = await app.request(`/api/v1/quizzes/${quizId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);

    const q = body.data.questions[0];
    expect(q).toBeDefined();
    expect(q.options[0].isCorrect).toBeUndefined(); // Crucial security check!
    expect(q.explanationJson).toBeUndefined(); // Explanation stripped before submission
  });

  it('should start a new attempt for student (attempt #1)', async () => {
    const res = await app.request(`/api/v1/quizzes/${quizId}/attempts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.attemptNumber).toBe(1);
    expect(body.data.completedAt).toBeNull();
    attempt1Id = body.data.id;
  });

  it('should submit answers and evaluate score accurately', async () => {
    const res = await app.request(`/api/v1/attempts/${attempt1Id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        answers: [
          {
            questionId,
            selectedOptionId: correctOptionId,
          },
        ],
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.totalScore).toBe(100);
    expect(body.data.isPassed).toBe(true);
    expect(body.data.attempt.completedAt).not.toBeNull();
  });

  it('should prevent re-submitting an already completed attempt', async () => {
    const res = await app.request(`/api/v1/attempts/${attempt1Id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        answers: [
          {
            questionId,
            selectedOptionId: wrongOptionId,
          },
        ],
      }),
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.success).toBe(false);
    expect(body.message).toContain('sudah pernah disubmit');
  });

  it('should allow student to start attempt #2 and record attemptNumber sequentially', async () => {
    const res = await app.request(`/api/v1/quizzes/${quizId}/attempts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.attemptNumber).toBe(2);

    const attempt2Id = body.data.id;

    // Submit wrong answer
    const submitRes = await app.request(`/api/v1/attempts/${attempt2Id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        answers: [
          {
            questionId,
            selectedOptionId: wrongOptionId,
          },
        ],
      }),
    });

    expect(submitRes.status).toBe(200);
    const submitBody = (await submitRes.json()) as any;
    expect(submitBody.data.totalScore).toBe(0);
    expect(submitBody.data.isPassed).toBe(false);
  });

  it('should retrieve student quiz history with multiple attempts', async () => {
    const res = await app.request(`/api/v1/quizzes/${quizId}/my-attempts`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.length).toBe(2);
  });

  it('should provide teacher monitoring recap with students performance data', async () => {
    const res = await app.request(`/api/v1/quizzes/${quizId}/monitoring`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.totalStudentsAttempted).toBeGreaterThanOrEqual(1);

    const studentSummary = body.data.studentRecap.find((s: any) => s.userId === studentUserId);
    expect(studentSummary).toBeDefined();
    expect(studentSummary.attemptsCount).toBe(2);
    expect(studentSummary.highestScore).toBe(100);
    expect(studentSummary.latestScore).toBe(0);
  });

  it('should provide full review details for a completed attempt', async () => {
    const res = await app.request(`/api/v1/attempts/${attempt1Id}/details`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.questions[0].studentAnswer.isCorrect).toBe(true);
    expect(body.data.questions[0].explanationJson).toBeDefined();
  });
});
