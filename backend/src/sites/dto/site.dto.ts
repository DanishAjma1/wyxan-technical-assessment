import { z } from 'zod';
import { normalizeAddress } from '../../common/address.util';

export const AddressSchema = z
  .string()
  .trim()
  .min(1, 'Address is required')
  .max(120, 'Address must be 120 characters or fewer')
  .transform(normalizeAddress)
  .refine(
    (addr) => /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:\/[a-z0-9._-]*)?$/.test(addr),
    {
      message:
        'Address must be a valid domain-like address (e.g. tidepool.zz or notes.web)',
    },
  );

export const CreateSiteSchema = z.object({
  address: AddressSchema,
  title: z
    .string()
    .trim()
    .min(1, 'Site title is required')
    .max(160, 'Site title must be 160 characters or fewer'),
  body: z
    .string()
    .trim()
    .min(1, 'HTML body content is required')
    .max(500000, 'HTML body is too large'),
  author: z
    .string()
    .trim()
    .min(1, 'Author name is required')
    .max(60, 'Author name must be 60 characters or fewer'),
});

export type CreateSiteDto = z.infer<typeof CreateSiteSchema>;

export const SearchSitesQuerySchema = z.object({
  q: z
    .string()
    .optional()
    .default('')
    .transform((v) => v.trim()),
});

export type SearchSitesQueryDto = z.infer<typeof SearchSitesQuerySchema>;
