import { z } from 'zod';
import { normalizeAddress } from '../../common/address.util';

export const NavigationTypeSchema = z.enum(['typed', 'link', 'back', 'forward']);

export const CreateVisitSchema = z
  .object({
    userId: z.string().trim().min(1).optional(),
    user: z.string().trim().min(1).optional(),
    address: z
      .string()
      .trim()
      .min(1, 'Visited address is required')
      .transform(normalizeAddress),
    navigationType: NavigationTypeSchema,
    timestamp: z
      .union([z.string().datetime(), z.date()])
      .optional()
      .transform((val) => (val ? new Date(val) : new Date())),
  })
  .refine((data) => Boolean(data.userId || data.user), {
    message: 'userId (or user) is required',
    path: ['userId'],
  })
  .transform((data) => ({
    userId: (data.userId || data.user)!.trim(),
    address: data.address,
    navigationType: data.navigationType,
    timestamp: data.timestamp,
  }));

export type CreateVisitDto = z.infer<typeof CreateVisitSchema>;

export const GetHistoryQuerySchema = z.object({
  user: z.string().trim().min(1, 'Query parameter "user" is required'),
});

export type GetHistoryQueryDto = z.infer<typeof GetHistoryQuerySchema>;
