import { Hono } from 'hono';
import crypto from 'node:crypto';
import { eq, or } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { registerSchema, loginSchema, changePasswordSchema } from '../schemas/auth.schema.js';
import { validate } from '../utils/validator.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { createToken } from '../utils/jwt.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';

export const authRoutes = new Hono();

// POST /register
authRoutes.post('/register', validate('json', registerSchema), async (c) => {
  const body = c.req.valid('json');

  // Check if username or email is already taken
  const existingUsers = await db
    .select()
    .from(users)
    .where(or(eq(users.username, body.username), eq(users.email, body.email)));

  if (existingUsers.length > 0) {
    const isEmail = existingUsers.some((u) => u.email === body.email);
    return c.json(
      {
        success: false,
        message: isEmail ? 'Email sudah terdaftar' : 'Username sudah digunakan',
      },
      409
    );
  }

  const userId = crypto.randomUUID();
  const hashedPassword = await hashPassword(body.password);
  const now = new Date();

  await db.insert(users).values({
    id: userId,
    username: body.username,
    email: body.email,
    passwordHash: hashedPassword,
    fullName: body.fullName,
    identityNumber: body.identityNumber || null,
    role: body.role || 'student',
    avatarUrl: body.avatarUrl || null,
    bio: body.bio || null,
    createdAt: now,
    updatedAt: now,
  });

  const token = await createToken({
    id: userId,
    username: body.username,
    email: body.email,
    role: body.role || 'student',
    fullName: body.fullName,
  });

  return c.json(
    {
      success: true,
      message: 'Registrasi berhasil',
      data: {
        token,
        user: {
          id: userId,
          username: body.username,
          email: body.email,
          fullName: body.fullName,
          identityNumber: body.identityNumber || null,
          role: body.role || 'student',
          avatarUrl: body.avatarUrl || null,
          bio: body.bio || null,
        },
      },
    },
    201
  );
});

// POST /login
authRoutes.post('/login', validate('json', loginSchema), async (c) => {
  const body = c.req.valid('json');
  const identifier = body.identifier || body.email || body.username || '';

  const matchedUsers = await db
    .select()
    .from(users)
    .where(or(eq(users.email, identifier), eq(users.username, identifier)));

  if (matchedUsers.length === 0) {
    return c.json(
      {
        success: false,
        message: 'Kredensial tidak valid: Akun tidak ditemukan',
      },
      401
    );
  }

  const user = matchedUsers[0];
  const isValid = await comparePassword(body.password, user.passwordHash);
  if (!isValid) {
    return c.json(
      {
        success: false,
        message: 'Kredensial tidak valid: Kata sandi salah',
      },
      401
    );
  }

  const token = await createToken({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  });

  return c.json({
    success: true,
    message: 'Login berhasil',
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        identityNumber: user.identityNumber,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
    },
  });
});

// GET /me
authRoutes.get('/me', authMiddleware, async (c) => {
  const tokenPayload = c.get('user');

  const matchedUsers = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      identityNumber: users.identityNumber,
      role: users.role,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, tokenPayload.id));

  if (matchedUsers.length === 0) {
    return c.json(
      {
        success: false,
        message: 'Pengguna tidak ditemukan',
      },
      404
    );
  }

  return c.json({
    success: true,
    message: 'Data sesi berhasil diambil',
    data: matchedUsers[0],
  });
});

// PATCH /change-password
authRoutes.patch('/change-password', authMiddleware, validate('json', changePasswordSchema), async (c) => {
  const tokenPayload = c.get('user');
  const body = c.req.valid('json');

  const matchedUsers = await db
    .select()
    .from(users)
    .where(eq(users.id, tokenPayload.id));

  if (matchedUsers.length === 0) {
    return c.json({ success: false, message: 'Pengguna tidak ditemukan' }, 404);
  }

  const user = matchedUsers[0];
  const isMatch = await comparePassword(body.currentPassword, user.passwordHash);
  if (!isMatch) {
    return c.json({ success: false, message: 'Kata sandi saat ini tidak sesuai' }, 400);
  }

  const newHash = await hashPassword(body.newPassword);
  await db
    .update(users)
    .set({
      passwordHash: newHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, tokenPayload.id));

  return c.json({
    success: true,
    message: 'Kata sandi berhasil diperbarui',
  });
});
