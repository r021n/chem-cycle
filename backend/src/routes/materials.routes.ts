import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, or, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { materials, auditLogs } from '../db/schema.js';
import { adminAuthMiddleware, AdminPayload } from '../middleware/auth.js';
import { generateSlug } from '../utils/hash.js';

export const materialsRoutes = new Hono<{
  Variables: {
    admin: AdminPayload;
  };
}>();

const materialSchema = z.object({
  title: z.string().min(1, 'Judul materi harus diisi'),
  slug: z.string().optional(),
  summary: z.string().optional(),
  coverUrl: z.string().optional(),
  orderIndex: z.number().optional().default(1),
  isPublished: z.boolean().optional().default(true),
  contentJson: z.union([z.string(), z.array(z.any()), z.record(z.any())]),
  category: z.string().optional(),
  learningObjectives: z.array(z.string()).optional(),
});

// GET /api/materials (Public - Published only)
materialsRoutes.get('/', async (c) => {
  const items = await db
    .select()
    .from(materials)
    .where(eq(materials.isPublished, true))
    .orderBy(asc(materials.orderIndex))
    .all();

  const formatted = items.map((m) => {
    let content: any = m.contentJson;
    try {
      content = JSON.parse(m.contentJson);
    } catch {}
    let learningObjectives: string[] = [];
    try {
      if (m.learningObjectivesJson) learningObjectives = JSON.parse(m.learningObjectivesJson);
    } catch {}

    return {
      ...m,
      contentJson: content,
      learningObjectives,
    };
  });

  return c.json({ success: true, data: formatted });
});

// GET /api/materials/admin/all (Protected - Includes drafts)
materialsRoutes.get('/admin/all', adminAuthMiddleware, async (c) => {
  const items = await db
    .select()
    .from(materials)
    .orderBy(asc(materials.orderIndex))
    .all();

  const formatted = items.map((m) => {
    let content: any = m.contentJson;
    try {
      content = JSON.parse(m.contentJson);
    } catch {}
    let learningObjectives: string[] = [];
    try {
      if (m.learningObjectivesJson) learningObjectives = JSON.parse(m.learningObjectivesJson);
    } catch {}

    return {
      ...m,
      contentJson: content,
      learningObjectives,
    };
  });

  return c.json({ success: true, data: formatted });
});

// GET /api/materials/:idOrSlug (Public)
materialsRoutes.get('/:idOrSlug', async (c) => {
  const param = c.req.param('idOrSlug');

  const item = await db
    .select()
    .from(materials)
    .where(or(eq(materials.id, param), eq(materials.slug, param)))
    .get();

  if (!item) {
    return c.json({ success: false, message: 'Materi tidak ditemukan' }, 404);
  }

  let content: any = item.contentJson;
  try {
    content = JSON.parse(item.contentJson);
  } catch {}
  let learningObjectives: string[] = [];
  try {
    if (item.learningObjectivesJson) learningObjectives = JSON.parse(item.learningObjectivesJson);
  } catch {}

  return c.json({
    success: true,
    data: {
      ...item,
      contentJson: content,
      learningObjectives,
    },
  });
});

// POST /api/materials (Protected)
materialsRoutes.post('/', adminAuthMiddleware, zValidator('json', materialSchema), async (c) => {
  const body = c.req.valid('json');
  const admin = c.get('admin');

  const now = new Date().toISOString();
  const id = `mat-${Date.now()}`;
  const slug = body.slug?.trim() || generateSlug(body.title);

  const contentJsonStr =
    typeof body.contentJson === 'string' ? body.contentJson : JSON.stringify(body.contentJson);

  const learningObjectivesStr = body.learningObjectives
    ? JSON.stringify(body.learningObjectives)
    : null;

  await db.insert(materials).values({
    id,
    title: body.title,
    slug,
    summary: body.summary || '',
    coverUrl: body.coverUrl || '',
    orderIndex: body.orderIndex || 1,
    isPublished: body.isPublished ?? true,
    contentJson: contentJsonStr,
    category: body.category || '',
    learningObjectivesJson: learningObjectivesStr,
    createdAt: now,
    updatedAt: now,
  });

  // Log action
  await db.insert(auditLogs).values({
    id: `log-${Date.now()}`,
    action: 'create',
    entityType: 'Materi',
    entityTitle: body.title,
    author: admin.username,
    createdAt: now,
  });

  return c.json(
    {
      success: true,
      message: 'Materi berhasil dibuat',
      data: { id, slug },
    },
    201
  );
});

// PUT /api/materials/reorder (Protected)
materialsRoutes.put(
  '/reorder',
  adminAuthMiddleware,
  zValidator('json', z.object({ orderedIds: z.array(z.string()) })),
  async (c) => {
    const { orderedIds } = c.req.valid('json');

    for (let index = 0; index < orderedIds.length; index++) {
      await db
        .update(materials)
        .set({ orderIndex: index + 1, updatedAt: new Date().toISOString() })
        .where(eq(materials.id, orderedIds[index]));
    }

    return c.json({ success: true, message: 'Urutan materi berhasil diperbarui' });
  }
);

// PUT /api/materials/:id (Protected)
materialsRoutes.put(
  '/:id',
  adminAuthMiddleware,
  zValidator('json', materialSchema.partial()),
  async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    const admin = c.get('admin');

    const existing = await db.select().from(materials).where(eq(materials.id, id)).get();
    if (!existing) {
      return c.json({ success: false, message: 'Materi tidak ditemukan' }, 404);
    }

    const updates: Partial<typeof materials.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.title !== undefined) updates.title = body.title;
    if (body.slug !== undefined) updates.slug = body.slug || generateSlug(body.title || existing.title);
    if (body.summary !== undefined) updates.summary = body.summary;
    if (body.coverUrl !== undefined) updates.coverUrl = body.coverUrl;
    if (body.orderIndex !== undefined) updates.orderIndex = body.orderIndex;
    if (body.isPublished !== undefined) updates.isPublished = body.isPublished;
    if (body.category !== undefined) updates.category = body.category;
    if (body.contentJson !== undefined) {
      updates.contentJson =
        typeof body.contentJson === 'string' ? body.contentJson : JSON.stringify(body.contentJson);
    }
    if (body.learningObjectives !== undefined) {
      updates.learningObjectivesJson = JSON.stringify(body.learningObjectives);
    }

    await db.update(materials).set(updates).where(eq(materials.id, id));

    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      action: 'update',
      entityType: 'Materi',
      entityTitle: updates.title || existing.title,
      author: admin.username,
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, message: 'Materi berhasil diperbarui' });
  }
);

// DELETE /api/materials/:id (Protected)
materialsRoutes.delete('/:id', adminAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const admin = c.get('admin');

  const existing = await db.select().from(materials).where(eq(materials.id, id)).get();
  if (!existing) {
    return c.json({ success: false, message: 'Materi tidak ditemukan' }, 404);
  }

  await db.delete(materials).where(eq(materials.id, id));

  await db.insert(auditLogs).values({
    id: `log-${Date.now()}`,
    action: 'delete',
    entityType: 'Materi',
    entityTitle: existing.title,
    author: admin.username,
    createdAt: new Date().toISOString(),
  });

  return c.json({ success: true, message: 'Materi berhasil dihapus' });
});

// PATCH /api/materials/:id/publish (Protected)
materialsRoutes.patch('/:id/publish', adminAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const admin = c.get('admin');

  const existing = await db.select().from(materials).where(eq(materials.id, id)).get();
  if (!existing) {
    return c.json({ success: false, message: 'Materi tidak ditemukan' }, 404);
  }

  const newStatus = !existing.isPublished;
  await db
    .update(materials)
    .set({ isPublished: newStatus, updatedAt: new Date().toISOString() })
    .where(eq(materials.id, id));

  await db.insert(auditLogs).values({
    id: `log-${Date.now()}`,
    action: newStatus ? 'publish' : 'update',
    entityType: 'Materi',
    entityTitle: `${existing.title} (${newStatus ? 'Terbit' : 'Draf'})`,
    author: admin.username,
    createdAt: new Date().toISOString(),
  });

  return c.json({ success: true, isPublished: newStatus });
});
