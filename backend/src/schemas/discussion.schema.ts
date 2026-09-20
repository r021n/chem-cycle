import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string().min(1, 'Konten postingan tidak boleh kosong'),
  mediaUrl: z.string().optional().nullable(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Konten komentar tidak boleh kosong'),
  parentCommentId: z.string().optional().nullable(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
