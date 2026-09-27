import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { mediaBlobs } from '../db/schema.js';
import { adminAuthMiddleware } from '../middleware/auth.js';

export const mediaRoutes = new Hono();

// POST /api/media (Protected - Admin only upload)
mediaRoutes.post('/', adminAuthMiddleware, async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];

  if (!file || typeof file === 'string') {
    return c.json({ success: false, message: 'Berkas tidak ditemukan dalam formulir' }, 400);
  }

  const uploadedFile = file as File;
  const filename = uploadedFile.name || 'berkas-' + Date.now();
  const mimeType = uploadedFile.type || 'application/octet-stream';
  const arrayBuffer = await uploadedFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const sizeBytes = buffer.length;

  // Max 5 MB backend hard limit
  if (sizeBytes > 5 * 1024 * 1024) {
    return c.json({ success: false, message: 'Ukuran berkas melebihi batas 5 MB' }, 400);
  }

  const id = `med-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  await db.insert(mediaBlobs).values({
    id,
    filename,
    mimeType,
    sizeBytes,
    data: buffer,
    uploadedBy: 'admin',
    createdAt: now,
  });

  return c.json(
    {
      success: true,
      message: 'Media berhasil diunggah dan disimpan sebagai BLOB',
      data: {
        id,
        url: `/api/media/${id}`,
        filename,
        mimeType,
        sizeBytes,
      },
    },
    201
  );
});

// GET /api/media/:id (Public streaming from SQLite BLOB)
mediaRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');

  const item = await db.select().from(mediaBlobs).where(eq(mediaBlobs.id, id)).get();
  if (!item) {
    return c.json({ success: false, message: 'Media tidak ditemukan' }, 404);
  }

  const headers = new Headers();
  headers.set('Content-Type', item.mimeType);
  headers.set('Content-Length', item.sizeBytes.toString());
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Accept-Ranges', 'bytes');

  return new Response(new Uint8Array(item.data), {
    status: 200,
    headers,
  });
});
