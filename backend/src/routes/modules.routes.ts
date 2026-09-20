import { Hono } from 'hono';
import crypto from 'node:crypto';
import { eq, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { modules, materials } from '../db/schema.js';
import { createModuleSchema, updateModuleSchema } from '../schemas/material.schema.js';
import { validate } from '../utils/validator.js';
import { slugify } from '../utils/slug.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import { requireRole } from '../middlewares/role-middleware.js';

export const modulesRoutes = new Hono();

// GET / - List all modules with nested materials
modulesRoutes.get('/', async (c) => {
  const allModules = await db
    .select()
    .from(modules)
    .orderBy(asc(modules.orderIndex), asc(modules.createdAt));

  const allMaterials = await db
    .select()
    .from(materials)
    .orderBy(asc(materials.orderIndex), asc(materials.createdAt));

  const materialsByModuleId = new Map<string, typeof allMaterials>();
  for (const mat of allMaterials) {
    const list = materialsByModuleId.get(mat.moduleId) || [];
    list.push(mat);
    materialsByModuleId.set(mat.moduleId, list);
  }

  const result = allModules.map((mod) => ({
    ...mod,
    materials: materialsByModuleId.get(mod.id) || [],
  }));

  return c.json({
    success: true,
    data: result,
    message: 'Daftar modul berhasil diambil',
  });
});

// GET /:id - Get single module
modulesRoutes.get('/:id', async (c) => {
  const id = c.req.param('id') as string;
  const matched = await db.select().from(modules).where(eq(modules.id, id));

  if (matched.length === 0) {
    return c.json({ success: false, message: 'Modul tidak ditemukan' }, 404);
  }

  const moduleMaterials = await db
    .select()
    .from(materials)
    .where(eq(materials.moduleId, id))
    .orderBy(asc(materials.orderIndex));

  return c.json({
    success: true,
    data: {
      ...matched[0],
      materials: moduleMaterials,
    },
    message: 'Detail modul berhasil diambil',
  });
});

// POST / - Create module (Admin only)
modulesRoutes.post(
  '/',
  authMiddleware,
  requireRole(['admin']),
  validate('json', createModuleSchema),
  async (c) => {
    const user = c.get('user')!;
    const body = c.req.valid('json');

    const slug = body.slug || slugify(body.title) || `modul-${Date.now()}`;
    const id = crypto.randomUUID();
    const now = new Date();

    const [created] = await db
      .insert(modules)
      .values({
        id,
        title: body.title,
        slug,
        description: body.description || null,
        orderIndex: body.orderIndex ?? 0,
        isPublished: body.isPublished ?? false,
        createdBy: user.id,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return c.json(
      {
        success: true,
        data: created,
        message: 'Modul berhasil dibuat',
      },
      201
    );
  }
);

// PUT /:id - Update module (Admin only)
modulesRoutes.put(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  validate('json', updateModuleSchema),
  async (c) => {
    const id = c.req.param('id') as string;
    const body = c.req.valid('json');

    const matched = await db.select().from(modules).where(eq(modules.id, id));
    if (matched.length === 0) {
      return c.json({ success: false, message: 'Modul tidak ditemukan' }, 404);
    }

    const updateData: Partial<typeof modules.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.orderIndex !== undefined) updateData.orderIndex = body.orderIndex;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;

    const [updated] = await db
      .update(modules)
      .set(updateData)
      .where(eq(modules.id, id))
      .returning();

    return c.json({
      success: true,
      data: updated,
      message: 'Modul berhasil diperbarui',
    });
  }
);

// DELETE /:id - Delete module (Admin only)
modulesRoutes.delete('/:id', authMiddleware, requireRole(['admin']), async (c) => {
  const id = c.req.param('id') as string;
  const matched = await db.select().from(modules).where(eq(modules.id, id));

  if (matched.length === 0) {
    return c.json({ success: false, message: 'Modul tidak ditemukan' }, 404);
  }

  await db.delete(modules).where(eq(modules.id, id));

  return c.json({
    success: true,
    message: 'Modul berhasil dihapus',
  });
});
