/**
 * Notification Validation Schemas.
 */

import { z } from 'zod';

export const createNotificationSchema = z.object({
  type: z.enum(['ticker', 'popup']),
  title: z.string().min(1, 'Title is required').max(200),
  message: z.string().min(1, 'Message is required').max(2000),
  image: z.string().url('Invalid image URL').optional(),
  link: z.string().url('Invalid link URL').optional(),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(0).max(100).default(0),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const updateNotificationSchema = createNotificationSchema.partial();
