import { z } from 'zod';

export const attachmentSchema = z.object({
  type: z.enum(['document', 'link']),
  title: z.string().min(1, 'Judul lampiran wajib diisi'),
  url: z.string().min(1, 'URL lampiran wajib diisi'),
  fileSize: z.number().int().optional().nullable(),
  mimeType: z.string().optional().nullable(),
});

export const createActivitySchema = z.object({
  title: z.string().min(1, 'Judul aktivitas wajib diisi'),
  instruction: z.string().min(1, 'Instruksi aktivitas wajib diisi'),
  dueDate: z
    .union([z.string(), z.number(), z.date()])
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  isPinned: z.boolean().default(false),
  attachments: z.array(attachmentSchema).optional().default([]),
});

export const updateActivitySchema = z.object({
  title: z.string().min(1).optional(),
  instruction: z.string().min(1).optional(),
  dueDate: z
    .union([z.string(), z.number(), z.date()])
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  isPinned: z.boolean().optional(),
});

export type AttachmentInput = z.infer<typeof attachmentSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
