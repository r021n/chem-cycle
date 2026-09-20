import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username hanya boleh mengandung huruf, angka, garis bawah, atau tanda minus'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
  identityNumber: z.string().optional().nullable(),
  role: z.enum(['admin', 'student']).default('student'),
  avatarUrl: z.string().url('URL avatar tidak valid').optional().nullable(),
  bio: z.string().max(500, 'Bio maksimal 500 karakter').optional().nullable(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Username atau email wajib diisi').optional(),
  email: z.string().optional(),
  username: z.string().optional(),
  password: z.string().min(1, 'Password wajib diisi'),
}).refine((data) => !!(data.identifier || data.email || data.username), {
  message: 'Harap sediakan identifier, email, atau username',
  path: ['identifier'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Kata sandi saat ini wajib diisi'),
  newPassword: z.string().min(8, 'Kata sandi baru minimal 8 karakter'),
  confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
