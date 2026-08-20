/**
 * Tests for order validation schemas.
 */

import { describe, it, expect } from 'vitest';
import { createOrderSchema, updateOrderStatusSchema } from '../modules/order/validation';

describe('createOrderSchema', () => {
  it('accepts valid order data', () => {
    const result = createOrderSchema.safeParse({
      paymentMethod: 'cash',
      items: [
        { menuItemId: '550e8400-e29b-41d4-a716-446655440000', quantity: 2 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts order with table number', () => {
    const result = createOrderSchema.safeParse({
      tableNumber: 5,
      paymentMethod: 'cash',
      items: [
        { menuItemId: '550e8400-e29b-41d4-a716-446655440000', quantity: 1 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts order with notes', () => {
    const result = createOrderSchema.safeParse({
      paymentMethod: 'online',
      notes: 'Birthday celebration',
      items: [
        { menuItemId: '550e8400-e29b-41d4-a716-446655440000', quantity: 2 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts order with special instructions', () => {
    const result = createOrderSchema.safeParse({
      paymentMethod: 'cash',
      items: [
        {
          menuItemId: '550e8400-e29b-41d4-a716-446655440000',
          quantity: 1,
          specialInstructions: 'No onions',
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty items', () => {
    const result = createOrderSchema.safeParse({
      paymentMethod: 'cash',
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid payment method', () => {
    const result = createOrderSchema.safeParse({
      paymentMethod: 'bitcoin',
      items: [
        { menuItemId: '550e8400-e29b-41d4-a716-446655440000', quantity: 1 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero quantity', () => {
    const result = createOrderSchema.safeParse({
      paymentMethod: 'cash',
      items: [
        { menuItemId: '550e8400-e29b-41d4-a716-446655440000', quantity: 0 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('accepts all payment methods', () => {
    ['cash', 'online', 'card'].forEach((method) => {
      const result = createOrderSchema.safeParse({
        paymentMethod: method,
        items: [
          { menuItemId: '550e8400-e29b-41d4-a716-446655440000', quantity: 1 },
        ],
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('updateOrderStatusSchema', () => {
  it('accepts valid status', () => {
    const statuses = [
      'pending', 'confirmed', 'preparing', 'ready',
      'served', 'completed', 'cancelled',
    ];
    statuses.forEach((status) => {
      const result = updateOrderStatusSchema.safeParse({ status });
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid status', () => {
    const result = updateOrderStatusSchema.safeParse({
      status: 'invalid-status',
    });
    expect(result.success).toBe(false);
  });
});
