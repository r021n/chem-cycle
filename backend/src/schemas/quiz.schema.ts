import { z } from 'zod';

export const createQuizSchema = z.object({
  moduleId: z.string().optional().nullable(),
  title: z.string().min(1, 'Judul kuis wajib diisi'),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh berupa huruf kecil, angka, dan tanda hubung')
    .optional(),
  description: z.string().optional().nullable(),
  timeLimitMinutes: z.number().int().positive().optional().nullable(),
  passingScore: z.number().int().min(0).max(100).default(70),
  maxAttempts: z.number().int().positive().optional().nullable(),
  isPublished: z.boolean().default(false),
});

export const updateQuizSchema = createQuizSchema.partial();

export const questionOptionSchema = z.object({
  id: z.string().optional(),
  optionKey: z.string().min(1, 'Kunci opsi (A, B, C, ...) wajib diisi'),
  content: z.string().min(1, 'Konten opsi wajib diisi'),
  imageUrl: z.string().optional().nullable(),
  isCorrect: z.boolean().default(false),
});

export const createQuestionSchema = z.object({
  promptJson: z
    .union([z.string().min(1), z.array(z.record(z.any()))])
    .transform((val) => (typeof val === 'string' ? val : JSON.stringify(val))),
  questionType: z.enum(['multiple_choice', 'essay']).default('multiple_choice'),
  scoreWeight: z.number().int().min(1).default(10),
  orderIndex: z.number().int().default(0),
  explanationJson: z
    .union([z.string(), z.array(z.record(z.any()))])
    .transform((val) => (typeof val === 'string' ? val : JSON.stringify(val)))
    .optional()
    .nullable(),
  options: z.array(questionOptionSchema).optional().default([]),
});

export const updateQuestionSchema = z.object({
  promptJson: z
    .union([z.string().min(1), z.array(z.record(z.any()))])
    .transform((val) => (typeof val === 'string' ? val : JSON.stringify(val)))
    .optional(),
  questionType: z.enum(['multiple_choice', 'essay']).optional(),
  scoreWeight: z.number().int().min(1).optional(),
  orderIndex: z.number().int().optional(),
  explanationJson: z
    .union([z.string(), z.array(z.record(z.any()))])
    .transform((val) => (typeof val === 'string' ? val : JSON.stringify(val)))
    .optional()
    .nullable(),
  options: z.array(questionOptionSchema).optional(),
});

export const submitAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1, 'questionId wajib diisi'),
      selectedOptionId: z.string().optional().nullable(),
      essayAnswer: z.string().optional().nullable(),
    })
  ),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
