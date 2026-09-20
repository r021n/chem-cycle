import { zValidator as zv } from '@hono/zod-validator';
import type { ZodType } from 'zod';
import type { ValidationTargets } from 'hono';

export const validate = <Target extends keyof ValidationTargets, Schema extends ZodType>(
  target: Target,
  schema: Schema
) => {
  return zv(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: 'Validasi data masukan gagal',
          errors: result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        400
      );
    }
  });
};
