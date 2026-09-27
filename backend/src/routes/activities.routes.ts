import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, or, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { activities, auditLogs } from '../db/schema.js';
import { adminAuthMiddleware, AdminPayload } from '../middleware/auth.js';
import { generateSlug } from '../utils/hash.js';

export const activitiesRoutes = new Hono<{
  Variables: {
    admin: AdminPayload;
  };
}>();

const activitySchema = z.object({
  title: z.string().min(1, 'Judul aktivitas harus diisi'),
  slug: z.string().optional(),
  summary: z.string().optional(),
  orderIndex: z.number().optional().default(1),
  isPublished: z.boolean().optional().default(true),
  contentJson: z.union([z.string(), z.array(z.any()), z.record(z.any())]).optional(),
  attachments: z.array(z.any()).optional(),
});

// GET /api/activities (Public - Published only)
activitiesRoutes.get('/', async (c) => {
  const items = await db
    .select()
    .from(activities)
    .where(eq(activities.isPublished, true))
    .orderBy(asc(activities.orderIndex))
    .all();

  const formatted = items.map((a) => {
    let content: any = [];
    try {
      if (a.contentJson) content = JSON.parse(a.contentJson);
    } catch {}
    let attachments: any = [];
    try {
      if (a.attachmentsJson) attachments = JSON.parse(a.attachmentsJson);
    } catch {}

    return {
      ...a,
      contentJson: content,
      attachments,
    };
  });

  return c.json({ success: true, data: formatted });
});

// GET /api/activities/admin/all (Protected - Includes drafts)
activitiesRoutes.get('/admin/all', adminAuthMiddleware, async (c) => {
  const items = await db
    .select()
    .from(activities)
    .orderBy(asc(activities.orderIndex))
    .all();

  const formatted = items.map((a) => {
    let content: any = [];
    try {
      if (a.contentJson) content = JSON.parse(a.contentJson);
    } catch {}
    let attachments: any = [];
    try {
      if (a.attachmentsJson) attachments = JSON.parse(a.attachmentsJson);
    } catch {}

    return {
      ...a,
      contentJson: content,
      attachments,
    };
  });

  return c.json({ success: true, data: formatted });
});

// GET /api/activities/:idOrSlug (Public)
activitiesRoutes.get('/:idOrSlug', async (c) => {
  const param = c.req.param('idOrSlug');

  const item = await db
    .select()
    .from(activities)
    .where(or(eq(activities.id, param), eq(activities.slug, param)))
    .get();

  if (!item) {
    return c.json({ success: false, message: 'Aktivitas tidak ditemukan' }, 404);
  }

  let content: any = [];
  try {
    if (item.contentJson) content = JSON.parse(item.contentJson);
  } catch {}
  let attachments: any = [];
  try {
    if (item.attachmentsJson) attachments = JSON.parse(item.attachmentsJson);
  } catch {}

  return c.json({
    success: true,
    data: {
      ...item,
      contentJson: content,
      attachments,
    },
  });
});

// POST /api/activities (Protected)
activitiesRoutes.post('/', adminAuthMiddleware, zValidator('json', activitySchema), async (c) => {
  const body = c.req.valid('json');
  const admin = c.get('admin');

  const now = new Date().toISOString();
  const id = `act-${Date.now()}`;
  const slug = body.slug?.trim() || generateSlug(body.title);

  const contentJsonStr = body.contentJson
    ? typeof body.contentJson === 'string'
      ? body.contentJson
      : JSON.stringify(body.contentJson)
    : '[]';

  const attachmentsStr = body.attachments ? JSON.stringify(body.attachments) : '[]';

  await db.insert(activities).values({
    id,
    title: body.title,
    slug,
    summary: body.summary || '',
    orderIndex: body.orderIndex || 1,
    isPublished: body.isPublished ?? true,
    contentJson: contentJsonStr,
    attachmentsJson: attachmentsStr,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(auditLogs).values({
    id: `log-${Date.now()}`,
    action: 'create',
    entityType: 'Aktivitas',
    entityTitle: body.title,
    author: admin.username,
    createdAt: now,
  });

  return c.json({ success: true, message: 'Aktivitas berhasil dibuat', data: { id, slug } }, 201);
});

// PUT /api/activities/:id (Protected)
activitiesRoutes.put(
  '/:id',
  adminAuthMiddleware,
  zValidator('json', activitySchema.partial()),
  async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    const admin = c.get('admin');

    const existing = await db.select().from(activities).where(eq(activities.id, id)).get();
    if (!existing) {
      return c.json({ success: false, message: 'Aktivitas tidak ditemukan' }, 404);
    }

    const updates: Partial<typeof activities.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.title !== undefined) updates.title = body.title;
    if (body.slug !== undefined) updates.slug = body.slug || generateSlug(body.title || existing.title);
    if (body.summary !== undefined) updates.summary = body.summary;
    if (body.orderIndex !== undefined) updates.orderIndex = body.orderIndex;
    if (body.isPublished !== undefined) updates.isPublished = body.isPublished;
    if (body.contentJson !== undefined) {
      updates.contentJson =
        typeof body.contentJson === 'string' ? body.contentJson : JSON.stringify(body.contentJson);
    }
    if (body.attachments !== undefined) {
      updates.attachmentsJson = JSON.stringify(body.attachments);
    }

    await db.update(activities).set(updates).where(eq(activities.id, id));

    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      action: 'update',
      entityType: 'Aktivitas',
      entityTitle: updates.title || existing.title,
      author: admin.username,
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, message: 'Aktivitas berhasil diperbarui' });
  }
);

// DELETE /api/activities/:id (Protected)
activitiesRoutes.delete('/:id', adminAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const admin = c.get('admin');

  const existing = await db.select().from(activities).where(eq(activities.id, id)).get();
  if (!existing) {
    return c.json({ success: false, message: 'Aktivitas tidak ditemukan' }, 404);
  }

  await db.delete(activities).where(eq(activities.id, id));

  await db.insert(auditLogs).values({
    id: `log-${Date.now()}`,
    action: 'delete',
    entityType: 'Aktivitas',
    entityTitle: existing.title,
    author: admin.username,
    createdAt: new Date().toISOString(),
  });

  return c.json({ success: true, message: 'Aktivitas berhasil dihapus' });
});

// PATCH /api/activities/:id/publish (Protected)
activitiesRoutes.patch('/:id/publish', adminAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const admin = c.get('admin');

  const existing = await db.select().from(activities).where(eq(activities.id, id)).get();
  if (!existing) {
    return c.json({ success: false, message: 'Aktivitas tidak ditemukan' }, 404);
  }

  const newStatus = !existing.isPublished;
  await db
    .update(activities)
    .set({ isPublished: newStatus, updatedAt: new Date().toISOString() })
    .where(eq(activities.id, id));

  await db.insert(auditLogs).values({
    id: `log-${Date.now()}`,
    action: newStatus ? 'publish' : 'update',
    entityType: 'Aktivitas',
    entityTitle: `${existing.title} (${newStatus ? 'Terbit' : 'Draf'})`,
    author: admin.username,
    createdAt: new Date().toISOString(),
  });

  return c.json({ success: true, isPublished: newStatus });
});
