/**
 * Tests for shared constants.
 */

import { describe, it, expect } from 'vitest';
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
  PAYMENT_STATUS_CONFIG,
  USER_ROLE_CONFIG,
  API_BASE_URL,
  API_TIMEOUT,
  STORAGE_KEYS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PASSWORD_LENGTH,
  PHONE_REGEX,
  EMAIL_REGEX,
} from '../constants';

describe('ORDER_STATUS_CONFIG', () => {
  it('has config for all order statuses', () => {
    const statuses = [
      'pending', 'confirmed', 'preparing', 'ready',
      'served', 'completed', 'cancelled',
    ];
    statuses.forEach((status) => {
      expect(ORDER_STATUS_CONFIG[status]).toBeDefined();
      expect(ORDER_STATUS_CONFIG[status].label).toBeTruthy();
      expect(ORDER_STATUS_CONFIG[status].color).toBeTruthy();
      expect(ORDER_STATUS_CONFIG[status].bgColor).toBeTruthy();
    });
  });
});

describe('PAYMENT_METHOD_CONFIG', () => {
  it('has config for all payment methods', () => {
    expect(PAYMENT_METHOD_CONFIG.cash).toBeDefined();
    expect(PAYMENT_METHOD_CONFIG.online).toBeDefined();
    expect(PAYMENT_METHOD_CONFIG.card).toBeDefined();
  });
});

describe('PAYMENT_STATUS_CONFIG', () => {
  it('has config for all payment statuses', () => {
    expect(PAYMENT_STATUS_CONFIG.pending).toBeDefined();
    expect(PAYMENT_STATUS_CONFIG.paid).toBeDefined();
    expect(PAYMENT_STATUS_CONFIG.failed).toBeDefined();
    expect(PAYMENT_STATUS_CONFIG.refunded).toBeDefined();
  });
});

describe('USER_ROLE_CONFIG', () => {
  it('has config for all user roles', () => {
    expect(USER_ROLE_CONFIG.customer).toBeDefined();
    expect(USER_ROLE_CONFIG.staff).toBeDefined();
    expect(USER_ROLE_CONFIG.kitchen).toBeDefined();
    expect(USER_ROLE_CONFIG.admin).toBeDefined();
  });
});

describe('Constants', () => {
  it('has valid API base URL', () => {
    expect(API_BASE_URL).toBeTruthy();
    expect(API_BASE_URL).toContain('api/v1');
  });

  it('has reasonable API timeout', () => {
    expect(API_TIMEOUT).toBeGreaterThan(0);
    expect(API_TIMEOUT).toBeLessThanOrEqual(60000);
  });

  it('has storage keys defined', () => {
    expect(STORAGE_KEYS.ACCESS_TOKEN).toBeTruthy();
    expect(STORAGE_KEYS.REFRESH_TOKEN).toBeTruthy();
    expect(STORAGE_KEYS.USER).toBeTruthy();
    expect(STORAGE_KEYS.THEME).toBeTruthy();
  });

  it('has valid page size limits', () => {
    expect(DEFAULT_PAGE_SIZE).toBeGreaterThan(0);
    expect(MAX_PAGE_SIZE).toBeGreaterThanOrEqual(DEFAULT_PAGE_SIZE);
  });

  it('has valid min password length', () => {
    expect(MIN_PASSWORD_LENGTH).toBeGreaterThanOrEqual(8);
  });

  it('has valid regex patterns', () => {
    expect(EMAIL_REGEX.test('test@example.com')).toBe(true);
    expect(EMAIL_REGEX.test('invalid')).toBe(false);
    expect(PHONE_REGEX.test('+1234567890')).toBe(true);
  });
});
