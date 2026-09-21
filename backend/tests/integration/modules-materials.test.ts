import { describe, it, expect, beforeAll } from 'vitest';
import app from '../../src/index.js';
import { initDatabaseSchema, createTestAdminToken, createTestStudentToken } from '../helpers.js';

import { db } from '../../src/db/index.js';
import { users } from '../../src/db/schema.js';

describe('Materials Integration', () => {
  let adminToken = '';
  let studentToken = '';
  const adminId = 'admin-mat-tester';
  const studentId = 'student-mat-tester';

  beforeAll(async () => {
    await initDatabaseSchema();
    adminToken = await createTestAdminToken(adminId);
    studentToken = await createTestStudentToken(studentId);

    await db
      .insert(users)
      .values([
        {
          id: adminId,
          username: 'admin_mat_tester',
          email: 'admin_mat@chemcycle.test',
          passwordHash: 'hash',
          fullName: 'Admin Mat Tester',
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: studentId,
          username: 'student_mat_tester',
          email: 'student_mat@chemcycle.test',
          passwordHash: 'hash',
          fullName: 'Student Mat Tester',
          role: 'student',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .onConflictDoNothing();
  });

  let createdMaterialId = '';
  const testMaterialSlug = `kinetika-reaksi-${Date.now()}`;

  it('should prevent student from creating a material (403 Forbidden)', async () => {
    const res = await app.request('/api/v1/materials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Kinetika Kimia Siswa',
        contentJson: [],
      }),
    });

    expect(res.status).toBe(403);
  });

  it('should allow admin to create material with BlockNote AST structure', async () => {
    const blockNoteAst = [
      {
        id: 'block-k-1',
        type: 'heading',
        props: { level: 1 },
        content: [{ type: 'text', text: 'Konsep Laju Reaksi', styles: {} }],
      },
      {
        id: 'block-k-2',
        type: 'paragraph',
        props: {},
        content: [{ type: 'text', text: 'Laju reaksi menyatakan berkurangnya konsentrasi reaktan...', styles: {} }],
      },
    ];

    const res = await app.request('/api/v1/materials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Pengertian Laju Reaksi',
        slug: testMaterialSlug,
        contentJson: blockNoteAst,
        summary: 'Definisi dasar dan rumus laju reaksi kimia.',
        estimatedReadTime: 12,
        orderIndex: 1,
        isPublished: true,
      }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.slug).toBe(testMaterialSlug);
    createdMaterialId = body.data.id;
  });

  it('should fetch materials list', async () => {
    const res = await app.request('/api/v1/materials', {
      method: 'GET',
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.some((m: any) => m.slug === testMaterialSlug)).toBe(true);
  });

  it('should fetch material details by slug', async () => {
    const res = await app.request(`/api/v1/materials/${testMaterialSlug}`, {
      method: 'GET',
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.title).toBe('Pengertian Laju Reaksi');
    expect(body.data.contentJson).toContain('Konsep Laju Reaksi');
  });

  it('should allow admin to update material content (autosave)', async () => {
    const updatedAst = [
      {
        id: 'block-k-1',
        type: 'heading',
        props: { level: 1 },
        content: [{ type: 'text', text: 'Konsep Laju Reaksi Terupdate', styles: {} }],
      },
    ];

    const res = await app.request(`/api/v1/materials/${createdMaterialId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Pengertian Laju Reaksi (Revisi)',
        contentJson: updatedAst,
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.title).toBe('Pengertian Laju Reaksi (Revisi)');
  });
});