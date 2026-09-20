import { describe, it, expect, beforeAll } from 'vitest';
import app from '../../src/index.js';
import { initDatabaseSchema, createTestAdminToken, createTestStudentToken } from '../helpers.js';
import { db } from '../../src/db/index.js';
import { users } from '../../src/db/schema.js';

describe('Activities Classroom Integration', () => {
  let adminToken = '';
  let studentToken = '';
  const adminId = 'admin-act-tester';
  const studentId = 'student-act-tester';

  beforeAll(async () => {
    await initDatabaseSchema();
    adminToken = await createTestAdminToken(adminId);
    studentToken = await createTestStudentToken(studentId);

    await db
      .insert(users)
      .values([
        {
          id: adminId,
          username: 'admin_act',
          email: 'admin_act@chemcycle.test',
          passwordHash: 'hash',
          fullName: 'Admin Activity Tester',
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: studentId,
          username: 'student_act',
          email: 'student_act@chemcycle.test',
          passwordHash: 'hash',
          fullName: 'Student Activity Tester',
          role: 'student',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .onConflictDoNothing();
  });

  let activityId = '';

  it('should allow admin to publish a new activity with attachments', async () => {
    const res = await app.request('/api/v1/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Praktikum Virtual PhET: Kesetimbangan Kimia',
        instruction: 'Buka tautan simulasi berikut dan catat pergeseran arah reaksi saat suhu dinaikkan.',
        isPinned: true,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        attachments: [
          {
            type: 'link',
            title: 'Simulasi Reversible Reactions PhET',
            url: 'https://phet.colorado.edu/sims/html/reversible-reactions/latest/reversible-reactions_all.html',
          },
        ],
      }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.id).toBeDefined();
    expect(body.data.attachments.length).toBe(1);
    activityId = body.data.id;
  });

  it('should allow users to fetch activities stream', async () => {
    const res = await app.request('/api/v1/activities', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    const act = body.data.find((a: any) => a.id === activityId);
    expect(act).toBeDefined();
    expect(act.attachments.length).toBe(1);
    expect(act.isDone).toBe(false);
  });

  it('should allow student to toggle mark-as-done', async () => {
    // 1. Mark as done
    const res = await app.request(`/api/v1/activities/${activityId}/toggle-done`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.isDone).toBe(true);

    // 2. Unmark
    const unmarkRes = await app.request(`/api/v1/activities/${activityId}/toggle-done`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    expect(unmarkRes.status).toBe(200);
    const unmarkBody = (await unmarkRes.json()) as any;
    expect(unmarkBody.success).toBe(true);
    expect(unmarkBody.data.isDone).toBe(false);
  });
});
