import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';

export interface AdminPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
  exp: number;
}

export const adminAuthMiddleware = createMiddleware<{
  Variables: {
    admin: AdminPayload;
  };
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        success: false,
        message: 'Akses ditolak: Token autentikasi administrator tidak ditemukan',
      },
      401
    );
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'chem_cycle_super_secret_jwt_key_2026';

  try {
    const payload = (await verify(token, jwtSecret, 'HS256')) as unknown as AdminPayload;
    if (!payload || payload.role !== 'admin') {
      return c.json(
        {
          success: false,
          message: 'Akses ditolak: Kredensial tidak memiliki hak akses administrator',
        },
        403
      );
    }

    c.set('admin', payload);
    await next();
  } catch (error) {
    return c.json(
      {
        success: false,
        message: 'Sesi berakhir atau token otorisasi tidak valid. Silakan login kembali.',
      },
      401
    );
  }
});
