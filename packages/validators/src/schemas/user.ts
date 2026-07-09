import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(64).optional(),
  avatar: z.string().url().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
