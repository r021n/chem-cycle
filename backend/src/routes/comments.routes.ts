import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { materialComments, materials } from '../db/schema.js';
import { adminAuthMiddleware } from '../middleware/auth.js';
import { commentRateLimiter } from '../middleware/rateLimiter.js';
import { hashIp } from '../utils/hash.js';

export const commentsRoutes = new Hono();

function sanitizeText(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const commentInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter')
    .max(60, 'Nama maksimal 60 karakter'),
  email: z
    .string()
    .trim()
    .email('Format email tidak valid')
    .max(100)
    .optional()
    .or(z.literal('')),
  body: z
    .string()
    .trim()
    .min(3, 'Komentar minimal 3 karakter')
    .max(1500, 'Komentar maksimal 1500 karakter'),
  website_hp: z.string().optional(), // Honeypot bot trap field
});

// GET /api/materials/:materialId/comments (Public)
commentsRoutes.get('/materials/:materialId/comments', async (c) => {
  const materialId = c.req.param('materialId');

  const comments = await getDb()
    .select({
      id: materialComments.id,
      name: materialComments.name,
      email: materialComments.email,
      body: materialComments.body,
      createdAt: materialComments.createdAt,
    })
    .from(materialComments)
    .where(eq(materialComments.materialId, materialId))
    .orderBy(desc(materialComments.createdAt))
    .all();

  return c.json({ success: true, data: comments });
});

// POST /api/materials/:materialId/comments (Public - DDoS and Spam Protected)
commentsRoutes.post(
  '/materials/:materialId/comments',
  commentRateLimiter,
  zValidator('json', commentInputSchema),
  async (c) => {
    const materialId = c.req.param('materialId');
    const { name, email, body, website_hp } = c.req.valid('json');

    // Anti-Bot Honeypot check: If the hidden input is filled by a bot, silently reject or abort
    if (website_hp && website_hp.trim().length > 0) {
      // Return 200 to trick spam bots into thinking their comment was submitted
      return c.json(
        {
          success: true,
          message: 'Komentar berhasil dikirim',
          data: { id: `cmt-${Date.now()}` },
        },
        201
      );
    }

    // Verify material exists
    const material = await getDb().select().from(materials).where(eq(materials.id, materialId)).get();
    if (!material) {
      return c.json({ success: false, message: 'Materi yang dikomentari tidak ditemukan' }, 404);
    }

    const rawIp =
      c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
      c.req.header('x-real-ip') ||
      '127.0.0.1';
    const ipHash = hashIp(rawIp);

    const now = new Date().toISOString();
    const id = `cmt-${Date.now()}`;

    const newComment = {
      id,
      materialId,
      name: sanitizeText(name),
      email: email ? sanitizeText(email) : null,
      body: sanitizeText(body),
      ipHash,
      isApproved: true,
      createdAt: now,
    };

    await getDb().insert(materialComments).values(newComment);

    return c.json(
      {
        success: true,
        message: 'Komentar berhasil dikirim',
        data: {
          id: newComment.id,
          name: newComment.name,
          email: newComment.email,
          body: newComment.body,
          createdAt: newComment.createdAt,
        },
      },
      201
    );
  }
);

// DELETE /api/comments/:id (Protected - Admin moderation)
commentsRoutes.delete('/comments/:id', adminAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const existing = await getDb()
    .select()
    .from(materialComments)
    .where(eq(materialComments.id, id))
    .get();

  if (!existing) {
    return c.json({ success: false, message: 'Komentar tidak ditemukan' }, 404);
  }

  await getDb().delete(materialComments).where(eq(materialComments.id, id));

  return c.json({ success: true, message: 'Komentar berhasil dihapus' });
});
