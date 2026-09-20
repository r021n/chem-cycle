import { Hono } from 'hono';
import crypto from 'node:crypto';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  activities,
  activityAttachments,
  activitySubmissions,
  users,
} from '../db/schema.js';
import {
  createActivitySchema,
  updateActivitySchema,
  attachmentSchema,
} from '../schemas/activity.schema.js';
import { validate } from '../utils/validator.js';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth-middleware.js';
import { requireRole } from '../middlewares/role-middleware.js';

export const activitiesRoutes = new Hono();

// GET / - Feed of classroom activities
activitiesRoutes.get('/', optionalAuthMiddleware, async (c) => {
  const user = c.get('user');

  const allActivities = await db
    .select({
      id: activities.id,
      authorId: activities.authorId,
      title: activities.title,
      instruction: activities.instruction,
      dueDate: activities.dueDate,
      isPinned: activities.isPinned,
      createdAt: activities.createdAt,
      updatedAt: activities.updatedAt,
      authorName: users.fullName,
      authorRole: users.role,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(activities)
    .innerJoin(users, eq(activities.authorId, users.id))
    .orderBy(desc(activities.isPinned), desc(activities.createdAt));

  const allAttachments = await db.select().from(activityAttachments);
  const attachmentsByActivityId = new Map<string, typeof allAttachments>();
  for (const att of allAttachments) {
    const list = attachmentsByActivityId.get(att.activityId) || [];
    list.push(att);
    attachmentsByActivityId.set(att.activityId, list);
  }

  // If user is logged in, check their completion status
  const userSubmissionsMap = new Map<string, typeof activitySubmissions.$inferSelect>();
  if (user) {
    const subs = await db
      .select()
      .from(activitySubmissions)
      .where(eq(activitySubmissions.userId, user.id));
    for (const s of subs) {
      userSubmissionsMap.set(s.activityId, s);
    }
  }

  const result = allActivities.map((act) => {
    const userSub = userSubmissionsMap.get(act.id);
    return {
      id: act.id,
      title: act.title,
      instruction: act.instruction,
      dueDate: act.dueDate,
      isPinned: act.isPinned,
      createdAt: act.createdAt,
      updatedAt: act.updatedAt,
      author: {
        id: act.authorId,
        fullName: act.authorName,
        role: act.authorRole,
        avatarUrl: act.authorAvatarUrl,
      },
      attachments: attachmentsByActivityId.get(act.id) || [],
      isDone: !!userSub,
      submission: userSub || null,
    };
  });

  return c.json({
    success: true,
    data: result,
    message: 'Daftar aktivitas kelas berhasil diambil',
  });
});

// POST / - Publish new activity (Admin only)
activitiesRoutes.post(
  '/',
  authMiddleware,
  requireRole(['admin']),
  validate('json', createActivitySchema),
  async (c) => {
    const user = c.get('user')!;
    const body = c.req.valid('json');

    const activityId = crypto.randomUUID();
    const now = new Date();

    const [newActivity] = await db
      .insert(activities)
      .values({
        id: activityId,
        authorId: user.id,
        title: body.title,
        instruction: body.instruction,
        dueDate: body.dueDate || null,
        isPinned: body.isPinned ?? false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const insertedAttachments = [];
    if (body.attachments && body.attachments.length > 0) {
      for (const att of body.attachments) {
        const [a] = await db
          .insert(activityAttachments)
          .values({
            id: crypto.randomUUID(),
            activityId,
            type: att.type,
            title: att.title,
            url: att.url,
            fileSize: att.fileSize || null,
            mimeType: att.mimeType || null,
            createdAt: now,
          })
          .returning();
        insertedAttachments.push(a);
      }
    }

    return c.json(
      {
        success: true,
        data: {
          ...newActivity,
          attachments: insertedAttachments,
        },
        message: 'Aktivitas kelas berhasil diterbitkan',
      },
      201
    );
  }
);

// PUT /:id - Update activity (Admin only)
activitiesRoutes.put(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  validate('json', updateActivitySchema),
  async (c) => {
    const id = c.req.param('id') as string;
    const body = c.req.valid('json');

    const matched = await db.select().from(activities).where(eq(activities.id, id));
    if (matched.length === 0) {
      return c.json({ success: false, message: 'Aktivitas tidak ditemukan' }, 404);
    }

    const updateData: Partial<typeof activities.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.instruction !== undefined) updateData.instruction = body.instruction;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate;
    if (body.isPinned !== undefined) updateData.isPinned = body.isPinned;

    const [updated] = await db
      .update(activities)
      .set(updateData)
      .where(eq(activities.id, id))
      .returning();

    return c.json({
      success: true,
      data: updated,
      message: 'Aktivitas berhasil diperbarui',
    });
  }
);

// DELETE /:id - Delete activity (Admin only)
activitiesRoutes.delete('/:id', authMiddleware, requireRole(['admin']), async (c) => {
  const id = c.req.param('id') as string;
  const matched = await db.select().from(activities).where(eq(activities.id, id));

  if (matched.length === 0) {
    return c.json({ success: false, message: 'Aktivitas tidak ditemukan' }, 404);
  }

  await db.delete(activities).where(eq(activities.id, id));

  return c.json({
    success: true,
    message: 'Aktivitas berhasil dihapus',
  });
});

// POST /:id/attachments - Add attachment to activity (Admin only)
activitiesRoutes.post(
  '/:id/attachments',
  authMiddleware,
  requireRole(['admin']),
  validate('json', attachmentSchema),
  async (c) => {
    const activityId = c.req.param('id') as string;
    const body = c.req.valid('json');

    const matched = await db.select().from(activities).where(eq(activities.id, activityId));
    if (matched.length === 0) {
      return c.json({ success: false, message: 'Aktivitas tidak ditemukan' }, 404);
    }

    const [newAttachment] = await db
      .insert(activityAttachments)
      .values({
        id: crypto.randomUUID(),
        activityId,
        type: body.type,
        title: body.title,
        url: body.url,
        fileSize: body.fileSize || null,
        mimeType: body.mimeType || null,
        createdAt: new Date(),
      })
      .returning();

    return c.json(
      {
        success: true,
        data: newAttachment,
        message: 'Lampiran berhasil ditambahkan',
      },
      201
    );
  }
);

// DELETE /attachments/:attachmentId - Delete attachment (Admin only)
activitiesRoutes.delete(
  '/attachments/:attachmentId',
  authMiddleware,
  requireRole(['admin']),
  async (c) => {
    const attachmentId = c.req.param('attachmentId') as string;
    const matched = await db
      .select()
      .from(activityAttachments)
      .where(eq(activityAttachments.id, attachmentId));

    if (matched.length === 0) {
      return c.json({ success: false, message: 'Lampiran tidak ditemukan' }, 404);
    }

    await db.delete(activityAttachments).where(eq(activityAttachments.id, attachmentId));

    return c.json({
      success: true,
      message: 'Lampiran berhasil dihapus',
    });
  }
);

// POST /:id/toggle-done - Toggle student completion status
activitiesRoutes.post('/:id/toggle-done', authMiddleware, async (c) => {
  const activityId = c.req.param('id') as string;
  const user = c.get('user')!;

  const matched = await db.select().from(activities).where(eq(activities.id, activityId));
  if (matched.length === 0) {
    return c.json({ success: false, message: 'Aktivitas tidak ditemukan' }, 404);
  }

  // Check existing submission
  const existing = await db
    .select()
    .from(activitySubmissions)
    .where(
      and(
        eq(activitySubmissions.activityId, activityId),
        eq(activitySubmissions.userId, user.id)
      )
    );

  if (existing.length > 0) {
    // Unmark as completed
    await db
      .delete(activitySubmissions)
      .where(eq(activitySubmissions.id, existing[0].id));

    return c.json({
      success: true,
      message: 'Aktivitas ditandai belum selesai',
      data: { isDone: false, submission: null },
    });
  }

  // Mark as completed
  const now = new Date();
  const [created] = await db
    .insert(activitySubmissions)
    .values({
      id: crypto.randomUUID(),
      activityId,
      userId: user.id,
      status: 'completed',
      completedAt: now,
    })
    .returning();

  return c.json({
    success: true,
    message: 'Aktivitas berhasil ditandai selesai',
    data: { isDone: true, submission: created },
  });
});
