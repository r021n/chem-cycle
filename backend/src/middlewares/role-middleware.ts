import type { Context, Next } from 'hono';

export const requireRole = (allowedRoles: ('admin' | 'student')[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user || !allowedRoles.includes(user.role)) {
      return c.json(
        {
          success: false,
          message: 'Akses ditolak: Wewenang tidak mencukupi',
        },
        403
      );
    }
    await next();
  };
};
