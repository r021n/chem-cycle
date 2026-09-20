import type { Context, Next } from 'hono';
import { verifyToken, type TokenPayload } from '../utils/jwt.js';

declare module 'hono' {
  interface ContextVariableMap {
    user: TokenPayload;
    currentUser?: TokenPayload;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        success: false,
        message: 'Akses tidak sah: Token otentikasi tidak disediakan',
      },
      401
    );
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token);

  if (!payload) {
    return c.json(
      {
        success: false,
        message: 'Akses tidak sah: Token kadaluarsa atau tidak valid',
      },
      401
    );
  }

  c.set('user', payload);
  await next();
}

export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (payload) {
      c.set('user', payload);
      c.set('currentUser', payload);
    }
  }
  await next();
}
