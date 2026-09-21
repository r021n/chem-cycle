import { z } from 'zod';

export const createMaterialSchema = z.object({
  title: z.string().min(1, 'Judul materi wajib diisi'),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh berupa huruf kecil, angka, dan tanda hubung')
    .optional(),
  contentJson: z.union([
    z.string().min(2, 'Konten AST tidak boleh kosong'),
    z.array(z.record(z.any())),
  ]).transform((val) => (typeof val === 'string' ? val : JSON.stringify(val))),
  summary: z.string().optional().nullable(),
  estimatedReadTime: z.number().int().min(1).default(10),
  orderIndex: z.number().int().default(0),
  isPublished: z.boolean().default(false),
});

export const updateMaterialSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh berupa huruf kecil, angka, dan tanda hubung')
    .optional(),
  contentJson: z
    .union([z.string().min(2), z.array(z.record(z.any()))])
    .transform((val) => (typeof val === 'string' ? val : JSON.stringify(val)))
    .optional(),
  summary: z.string().optional().nullable(),
  estimatedReadTime: z.number().int().min(1).optional(),
  orderIndex: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
