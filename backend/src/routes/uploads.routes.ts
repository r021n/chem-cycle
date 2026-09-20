import { Hono } from 'hono';
import { storageService } from '../services/storage.service.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import { requireRole } from '../middlewares/role-middleware.js';

export const uploadsRoutes = new Hono();

// POST /image - Upload image (Authenticated)
uploadsRoutes.post('/image', authMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['image'] || body['file'];

    if (!file || !(file instanceof File)) {
      return c.json(
        {
          success: false,
          message: 'Berkas gambar tidak ditemukan. Gunakan field "image" atau "file" multipart/form-data',
        },
        400
      );
    }

    // Limit to 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return c.json(
        {
          success: false,
          message: 'Ukuran berkas melebihi batas maksimum 10MB',
        },
        400
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const saved = await storageService.saveImage(buffer, file.name, file.type);

    return c.json(
      {
        success: true,
        data: saved,
        message: 'Gambar berhasil diunggah',
      },
      201
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mengunggah gambar';
    return c.json(
      {
        success: false,
        message,
      },
      400
    );
  }
});

// POST /document - Upload document (Admin only)
uploadsRoutes.post('/document', authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['document'] || body['file'];

    if (!file || !(file instanceof File)) {
      return c.json(
        {
          success: false,
          message: 'Berkas dokumen tidak ditemukan. Gunakan field "document" atau "file" multipart/form-data',
        },
        400
      );
    }

    // Limit to 50MB
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return c.json(
        {
          success: false,
          message: 'Ukuran berkas dokumen melebihi batas maksimum 50MB',
        },
        400
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const saved = await storageService.saveDocument(buffer, file.name, file.type);

    return c.json(
      {
        success: true,
        data: saved,
        message: 'Dokumen berhasil diunggah',
      },
      201
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mengunggah dokumen';
    return c.json(
      {
        success: false,
        message,
      },
      400
    );
  }
});
