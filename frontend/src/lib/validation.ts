import { z } from 'zod';

export function normalizeAddress(rawAddress: string): string {
  return rawAddress
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//i, '')
    .replace(/\/+$/, '');
}

export const AddressBarSchema = z
  .string()
  .trim()
  .min(1, 'Please enter an address to navigate')
  .max(120, 'Address must be 120 characters or fewer')
  .transform(normalizeAddress)
  .refine(
    (addr) => /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:\/[a-z0-9._-]*)?$/.test(addr),
    {
      message:
        'Enter a valid custom address such as tidepool.zz, observatory.zz, or atlantis.zz',
    },
  );

export const UserProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Profile name is required')
    .max(50, 'Profile name must be 50 characters or fewer')
    .regex(
      /^[a-zA-Z0-9 _-]+$/,
      'Profile name may only contain letters, numbers, spaces, hyphens, and underscores',
    ),
});

export const PublishSiteSchema = z.object({
  address: AddressBarSchema,
  title: z
    .string()
    .trim()
    .min(1, 'Page title is required')
    .max(160, 'Page title must be 160 characters or fewer'),
  body: z
    .string()
    .trim()
    .min(1, 'HTML content is required')
    .max(500000, 'HTML content exceeds maximum allowed size'),
  author: z.string().trim().min(1, 'Author profile is required'),
});

export type PublishSiteInput = z.infer<typeof PublishSiteSchema>;
