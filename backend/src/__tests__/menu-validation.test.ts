/**
 * Tests for menu validation schemas.
 */

import { describe, it, expect } from 'vitest';
import { createCategorySchema, createMenuItemSchema, updateMenuItemSchema } from '../modules/menu/validation';

describe('createCategorySchema', () => {
  it('accepts valid category data', () => {
    const result = createCategorySchema.safeParse({
      name: 'Appetizers',
    });
    expect(result.success).toBe(true);
  });

  it('accepts category with all fields', () => {
    const result = createCategorySchema.safeParse({
      name: 'Appetizers',
      description: 'Start your meal',
      image: 'https://example.com/image.jpg',
      sortOrder: 1,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createCategorySchema.safeParse({
      name: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('createMenuItemSchema', () => {
  it('accepts valid menu item data', () => {
    const result = createMenuItemSchema.safeParse({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Spring Rolls',
      price: 899,
    });
    expect(result.success).toBe(true);
  });

  it('accepts item with all fields', () => {
    const result = createMenuItemSchema.safeParse({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Spring Rolls',
      description: 'Crispy vegetable rolls',
      price: 899,
      image: 'https://example.com/image.jpg',
      isAvailable: true,
      isFeatured: false,
      tags: ['vegetarian'],
      preparationTime: 10,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative price', () => {
    const result = createMenuItemSchema.safeParse({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Spring Rolls',
      price: -100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID', () => {
    const result = createMenuItemSchema.safeParse({
      categoryId: 'invalid-uuid',
      name: 'Spring Rolls',
      price: 899,
    });
    expect(result.success).toBe(false);
  });
});

describe('updateMenuItemSchema', () => {
  it('accepts partial update', () => {
    const result = updateMenuItemSchema.safeParse({
      name: 'Updated Name',
    });
    expect(result.success).toBe(true);
  });

  it('accepts price update', () => {
    const result = updateMenuItemSchema.safeParse({
      price: 999,
    });
    expect(result.success).toBe(true);
  });
});
