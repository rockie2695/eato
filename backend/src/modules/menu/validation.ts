/**
 * Menu Validation Schemas.
 */

import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  image: z.string().url().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const createMenuItemSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  price: z.number().int().min(0, 'Price must be positive'),
  image: z.string().url().optional(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  preparationTime: z.number().int().min(0).optional(),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();
