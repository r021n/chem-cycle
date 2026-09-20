import { describe, it, expect, beforeAll } from 'vitest';
import app from '../../src/index.js';
import { initDatabaseSchema, createTestAdminToken, createTestStudentToken } from '../helpers.js';
import { db } from '../../src/db/index.js';
import { users } from '../../src/db/schema.js';

describe('Discussions and Threaded Comments Integration', () => {
  let adminToken = '';
  let studentToken = '';
  const adminId = 'admin-disc-tester';
  const studentId = 'student-disc-tester';

  beforeAll(async () => {
    await initDatabaseSchema();
    adminToken = await createTestAdminToken(adminId);
    studentToken = await createTestStudentToken(studentId);

    await db
      .insert(users)
      .values([
        {
          id: adminId,
          username: 'admin_disc',
          email: 'admin_disc@chemcycle.test',
          passwordHash: 'hash',
          fullName: 'Admin Disc Tester',
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: studentId,
          username: 'student_disc',
          email: 'student_disc@chemcycle.test',
          passwordHash: 'hash',
          fullName: 'Student Disc Tester',
          role: 'student',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .onConflictDoNothing();
  });

  let postId = '';
  let parentCommentId = '';

  it('should allow student to create a discussion post', async () => {
    const res = await app.request('/api/v1/discussions/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        content: 'Bagaimana cara menentukan apakah reaksi spontan atau tidak menggunakan energi bebas Gibbs (ΔG)?',
      }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.id).toBeDefined();
    postId = body.data.id;
  });

  it('should toggle like on the post', async () => {
    // 1. Like
    const likeRes = await app.request(`/api/v1/discussions/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    expect(likeRes.status).toBe(200);
    const likeBody = (await likeRes.json()) as any;
    expect(likeBody.success).toBe(true);
    expect(likeBody.data.hasLiked).toBe(true);
    expect(likeBody.data.likeCount).toBe(1);

    // 2. Unlike
    const unlikeRes = await app.request(`/api/v1/discussions/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    expect(unlikeRes.status).toBe(200);
    const unlikeBody = (await unlikeRes.json()) as any;
    expect(unlikeBody.success).toBe(true);
    expect(unlikeBody.data.hasLiked).toBe(false);
    expect(unlikeBody.data.likeCount).toBe(0);
  });

  it('should add a parent comment and a nested reply comment', async () => {
    // 1. Add parent comment from teacher
    const commentRes = await app.request(`/api/v1/discussions/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        content: 'Reaksi spontan terjadi jika ΔG < 0 (negatif), dihitung dengan rumus ΔG = ΔH - TΔS.',
      }),
    });

    expect(commentRes.status).toBe(201);
    const commentBody = (await commentRes.json()) as any;
    expect(commentBody.success).toBe(true);
    parentCommentId = commentBody.data.id;

    // 2. Add reply to parent comment from student
    const replyRes = await app.request(`/api/v1/discussions/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        content: 'Berarti jika suhunya sangat tinggi dan ΔS positif, reaksi endoterm bisa menjadi spontan ya bu?',
        parentCommentId: parentCommentId,
      }),
    });

    expect(replyRes.status).toBe(201);
    const replyBody = (await replyRes.json()) as any;
    expect(replyBody.success).toBe(true);
    expect(replyBody.data.parentCommentId).toBe(parentCommentId);
  });

  it('should return hierarchical threaded comments tree', async () => {
    const res = await app.request(`/api/v1/discussions/posts/${postId}/comments`, {
      method: 'GET',
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(1); // 1 root comment

    const rootComment = body.data[0];
    expect(rootComment.id).toBe(parentCommentId);
    expect(rootComment.replies.length).toBe(1); // 1 nested reply
    expect(rootComment.replies[0].parentCommentId).toBe(parentCommentId);
  });
});
