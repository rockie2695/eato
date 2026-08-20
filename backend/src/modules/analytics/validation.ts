/**
 * Analytics Validation Schemas.
 */

import { z } from 'zod';

export const reportQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']).default('monthly'),
});

export const popularItemsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
