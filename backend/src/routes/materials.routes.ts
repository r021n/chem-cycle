import { Hono } from 'hono';
import crypto from 'node:crypto';
import { eq, or, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { materials } from '../db/schema.js';
import { createMaterialSchema, updateMaterialSchema } from '../schemas/material.schema.js';
import { validate } from '../utils/validator.js';
import { slugify } from '../utils/slug.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import { requireRole } from '../middlewares/role-middleware.js';

export const materialsRoutes = new Hono();

// GET / - List all materials
materialsRoutes.get('/', async (c) => {
  const allMaterials = await db
    .select()
    .from(materials)
    .orderBy(asc(materials.orderIndex), asc(materials.createdAt));

  return c.json({
    success: true,
    data: allMaterials,
    message: 'Daftar materi berhasil diambil',
  });
});

// GET /:slug - Get material by slug or id
materialsRoutes.get('/:slug', async (c) => {
  const slugOrId = c.req.param('slug') as string;

  const matched = await db
    .select()
    .from(materials)
    .where(or(eq(materials.slug, slugOrId), eq(materials.id, slugOrId)));

  if (matched.length === 0) {
    return c.json({ success: false, message: 'Materi tidak ditemukan' }, 404);
  }

  return c.json({
    success: true,
    data: matched[0],
    message: 'Detail materi berhasil diambil',
  });
});

// POST / - Create material (Admin only)
materialsRoutes.post(
  '/',
  authMiddleware,
  requireRole(['admin']),
  validate('json', createMaterialSchema),
  async (c) => {
    const body = c.req.valid('json');

    const slug = body.slug || slugify(body.title) || `materi-${Date.now()}`;
    const id = crypto.randomUUID();
    const now = new Date();

    const [created] = await db
      .insert(materials)
      .values({
        id,
        title: body.title,
        slug,
        contentJson: body.contentJson,
        summary: body.summary || null,
        estimatedReadTime: body.estimatedReadTime ?? 10,
        orderIndex: body.orderIndex ?? 0,
        isPublished: body.isPublished ?? false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return c.json(
      {
        success: true,
        data: created,
        message: 'Materi berhasil dibuat',
      },
      201
    );
  }
);

// PUT /:id - Update material (Admin only - autosave & publish)
materialsRoutes.put(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  validate('json', updateMaterialSchema),
  async (c) => {
    const id = c.req.param('id') as string;
    const body = c.req.valid('json');

    const matched = await db.select().from(materials).where(eq(materials.id, id));
    if (matched.length === 0) {
      return c.json({ success: false, message: 'Materi tidak ditemukan' }, 404);
    }

    const updateData: Partial<typeof materials.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.contentJson !== undefined) updateData.contentJson = body.contentJson;
    if (body.summary !== undefined) updateData.summary = body.summary;
    if (body.estimatedReadTime !== undefined) updateData.estimatedReadTime = body.estimatedReadTime;
    if (body.orderIndex !== undefined) updateData.orderIndex = body.orderIndex;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;

    const [updated] = await db
      .update(materials)
      .set(updateData)
      .where(eq(materials.id, id))
      .returning();

    return c.json({
      success: true,
      data: updated,
      message: 'Materi berhasil diperbarui',
    });
  }
);

// DELETE /:id - Delete material (Admin only)
materialsRoutes.delete('/:id', authMiddleware, requireRole(['admin']), async (c) => {
  const id = c.req.param('id') as string;
  const matched = await db.select().from(materials).where(eq(materials.id, id));

  if (matched.length === 0) {
    return c.json({ success: false, message: 'Materi tidak ditemukan' }, 404);
  }

  await db.delete(materials).where(eq(materials.id, id));

  return c.json({
    success: true,
    message: 'Materi berhasil dihapus',
  });
});
