import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

export function errorHandler(err: Error, c: Context) {
  console.error('[Error caught in middleware]:', err);

  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        message: err.message,
      },
      err.status
    );
  }

  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        message: 'Validasi data gagal',
        errors: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      400
    );
  }

  // SQLite / LibSQL Unique constraint violation
  if (err.message && err.message.includes('UNIQUE constraint failed')) {
    return c.json(
      {
        success: false,
        message: 'Data dengan pengidentifikasi tersebut sudah ada (duplikasi)',
      },
      409
    );
  }

  return c.json(
    {
      success: false,
      message: err.message || 'Terjadi kesalahan internal pada server',
    },
    500
  );
}
