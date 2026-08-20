/**
 * Order Validation Schemas.
 */

import { z } from 'zod';

export const createOrderSchema = z.object({
  tableNumber: z.number().int().min(1).optional(),
  paymentMethod: z.enum(['cash', 'online', 'card']),
  notes: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
        specialInstructions: z.string().max(200).optional(),
      })
    )
    .min(1, 'At least one item is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'served',
    'completed',
    'cancelled',
  ]),
});
