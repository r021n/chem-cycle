import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sign } from 'hono/jwt';
import { eq, or } from 'drizzle-orm';
import { db } from '../db/index.js';
import { admins, auditLogs } from '../db/schema.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { adminAuthMiddleware, AdminPayload } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

export const authRoutes = new Hono<{
  Variables: {
    admin: AdminPayload;
  };
}>();

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username atau email harus diisi'),
  password: z.string().min(1, 'Kata sandi harus diisi'),
});

const changePasswordSchema = z.object({
  newPassword: z.string().min(6, 'Kata sandi minimal 6 karakter'),
});

const profileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().optional(),
});

// POST /api/auth/login
authRoutes.post('/login', authRateLimiter, zValidator('json', loginSchema), async (c) => {
  const { usernameOrEmail, password } = c.req.valid('json');

  const admin = await db
    .select()
    .from(admins)
    .where(or(eq(admins.username, usernameOrEmail), eq(admins.email, usernameOrEmail)))
    .get();

  if (!admin) {
    return c.json(
      {
        success: false,
        message: 'Kredensial tidak valid. Silakan periksa kembali username/email dan kata sandi.',
      },
      401
    );
  }

  const isValid = await verifyPassword(password, admin.passwordHash);
  if (!isValid) {
    return c.json(
      {
        success: false,
        message: 'Kredensial tidak valid. Silakan periksa kembali username/email dan kata sandi.',
      },
      401
    );
  }

  const jwtSecret = process.env.JWT_SECRET || 'chem_cycle_super_secret_jwt_key_2026';
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days

  const token = await sign(
    {
      sub: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      exp,
    },
    jwtSecret
  );

  // Push audit log
  await db.insert(auditLogs).values({
    id: `log-${Date.now()}`,
    action: 'update',
    entityType: 'Pengaturan',
    entityTitle: 'Administrator Sesi Masuk Berhasil',
    author: admin.name || 'Admin',
    createdAt: new Date().toISOString(),
  });

  return c.json({
    success: true,
    message: 'Login berhasil',
    token,
    user: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      avatarUrl: admin.avatarUrl,
    },
  });
});

// GET /api/auth/me (Protected)
authRoutes.get('/me', adminAuthMiddleware, async (c) => {
  const payload = c.get('admin');
  const admin = await db.select().from(admins).where(eq(admins.id, payload.sub)).get();

  if (!admin) {
    return c.json({ success: false, message: 'Data administrator tidak ditemukan' }, 404);
  }

  return c.json({
    success: true,
    user: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      avatarUrl: admin.avatarUrl,
    },
  });
});

// PUT /api/auth/profile (Protected)
authRoutes.put('/profile', adminAuthMiddleware, zValidator('json', profileSchema), async (c) => {
  const payload = c.get('admin');
  const updates = c.req.valid('json');

  await db
    .update(admins)
    .set({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(admins.id, payload.sub));

  return c.json({
    success: true,
    message: 'Profil berhasil diperbarui',
  });
});

// PUT /api/auth/change-password (Protected)
authRoutes.put(
  '/change-password',
  adminAuthMiddleware,
  zValidator('json', changePasswordSchema),
  async (c) => {
    const payload = c.get('admin');
    const { newPassword } = c.req.valid('json');

    const hashedPassword = await hashPassword(newPassword);

    await db
      .update(admins)
      .set({
        passwordHash: hashedPassword,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(admins.id, payload.sub));

    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      action: 'update',
      entityType: 'Pengaturan',
      entityTitle: 'Perubahan Kata Sandi Administrator',
      author: payload.username,
      createdAt: new Date().toISOString(),
    });

    return c.json({
      success: true,
      message: 'Kata sandi administrator berhasil diperbarui',
    });
  }
);
