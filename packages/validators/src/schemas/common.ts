import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const paramsSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const slugSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});
