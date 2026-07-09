import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  excerpt: z.string().min(1, 'Excerpt is required').max(500, 'Excerpt must be at most 500 characters'),
  content: z.string().min(1, 'Content is required'),
  coverImage: z.string().url().optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
