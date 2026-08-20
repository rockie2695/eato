/**
 * Notification Validation Tests.
 */

import { describe, it, expect } from 'vitest';
import { createNotificationSchema, updateNotificationSchema } from '../validation';

describe('Notification Validation', () => {
  describe('createNotificationSchema', () => {
    it('validates a valid ticker notification', () => {
      const data = {
        type: 'ticker' as const,
        title: 'Happy Hour',
        message: '50% off drinks from 5-7 PM',
      };
      const result = createNotificationSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('ticker');
        expect(result.data.isActive).toBe(true);
        expect(result.data.priority).toBe(0);
      }
    });

    it('validates a valid popup notification with optional fields', () => {
      const data = {
        type: 'popup' as const,
        title: 'Summer Special',
        message: 'Try our new menu!',
        image: 'https://example.com/image.jpg',
        link: 'https://example.com/promo',
        isActive: false,
        priority: 50,
        startsAt: '2026-01-01T00:00:00.000Z',
        expiresAt: '2026-12-31T23:59:59.999Z',
      };
      const result = createNotificationSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('popup');
        expect(result.data.image).toBe('https://example.com/image.jpg');
        expect(result.data.priority).toBe(50);
      }
    });

    it('rejects invalid type', () => {
      const result = createNotificationSchema.safeParse({
        type: 'banner',
        title: 'Test',
        message: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty title', () => {
      const result = createNotificationSchema.safeParse({
        type: 'ticker',
        title: '',
        message: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('rejects title over 200 chars', () => {
      const result = createNotificationSchema.safeParse({
        type: 'ticker',
        title: 'x'.repeat(201),
        message: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty message', () => {
      const result = createNotificationSchema.safeParse({
        type: 'ticker',
        title: 'Test',
        message: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects message over 2000 chars', () => {
      const result = createNotificationSchema.safeParse({
        type: 'ticker',
        title: 'Test',
        message: 'x'.repeat(2001),
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid image URL', () => {
      const result = createNotificationSchema.safeParse({
        type: 'popup',
        title: 'Test',
        message: 'Test',
        image: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid link URL', () => {
      const result = createNotificationSchema.safeParse({
        type: 'popup',
        title: 'Test',
        message: 'Test',
        link: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('rejects priority < 0', () => {
      const result = createNotificationSchema.safeParse({
        type: 'ticker',
        title: 'Test',
        message: 'Test',
        priority: -1,
      });
      expect(result.success).toBe(false);
    });

    it('rejects priority > 100', () => {
      const result = createNotificationSchema.safeParse({
        type: 'ticker',
        title: 'Test',
        message: 'Test',
        priority: 101,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateNotificationSchema', () => {
    it('allows partial updates', () => {
      const result = updateNotificationSchema.safeParse({
        title: 'Updated Title',
      });
      expect(result.success).toBe(true);
    });

    it('allows updating single field', () => {
      const result = updateNotificationSchema.safeParse({
        isActive: false,
      });
      expect(result.success).toBe(true);
    });

    it('allows empty update', () => {
      const result = updateNotificationSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});
