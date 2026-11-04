import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'User name cannot be empty')
    .max(50, 'User name must be 50 characters or fewer')
    .regex(/^[a-zA-Z0-9 _-]+$/, 'User name may only contain letters, numbers, spaces, hyphens, and underscores'),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
