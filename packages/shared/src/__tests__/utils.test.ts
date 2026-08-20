/**
 * Tests for shared utility functions.
 *
 * Covers: price formatting, date formatting, validation, cart calculations, string helpers.
 */

import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  parsePriceToCents,
  formatRelativeTime,
  formatDate,
  formatPrepTime,
  validateEmail,
  validatePassword,
  validatePhone,
  calculateCartTotal,
  calculateItemCount,
  truncate,
  getInitials,
  titleCase,
  groupBy,
  debounce,
} from '../utils';

// ─── Currency Formatting ───────────────────────────────────────

describe('formatPrice', () => {
  it('formats cents to dollars', () => {
    expect(formatPrice(1299)).toBe('$12.99');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('formats large amounts', () => {
    expect(formatPrice(100000)).toBe('$1,000.00');
  });

  it('formats with different currency', () => {
    expect(formatPrice(1299, 'EUR')).toContain('12.99');
  });
});

describe('parsePriceToCents', () => {
  it('parses dollar string to cents', () => {
    expect(parsePriceToCents('$12.99')).toBe(1299);
  });

  it('parses plain number string', () => {
    expect(parsePriceToCents('12.99')).toBe(1299);
  });

  it('handles zero', () => {
    expect(parsePriceToCents('$0.00')).toBe(0);
  });
});

// ─── Date Formatting ───────────────────────────────────────────

describe('formatPrepTime', () => {
  it('formats minutes', () => {
    expect(formatPrepTime(15)).toBe('15 min');
  });

  it('formats hours', () => {
    expect(formatPrepTime(60)).toBe('1h');
  });

  it('formats hours and minutes', () => {
    expect(formatPrepTime(90)).toBe('1h 30m');
  });

  it('handles zero', () => {
    expect(formatPrepTime(0)).toBe('Ready now');
  });
});

describe('formatRelativeTime', () => {
  it('returns "Just now" for recent timestamps', () => {
    const now = new Date();
    const result = formatRelativeTime(now.toISOString());
    expect(result).toBe('Just now');
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2024-01-15T12:00:00Z');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});

// ─── Validation ────────────────────────────────────────────────

describe('validateEmail', () => {
  it('accepts valid email', () => {
    expect(validateEmail('test@example.com')).toEqual({ isValid: true });
  });

  it('rejects empty email', () => {
    expect(validateEmail('')).toEqual({
      isValid: false,
      error: 'Email is required',
    });
  });

  it('rejects invalid format', () => {
    expect(validateEmail('notanemail')).toEqual({
      isValid: false,
      error: 'Invalid email format',
    });
  });

  it('rejects email without domain', () => {
    expect(validateEmail('test@')).toEqual({
      isValid: false,
      error: 'Invalid email format',
    });
  });
});

describe('validatePassword', () => {
  it('accepts strong password', () => {
    expect(validatePassword('StrongPass1')).toEqual({ isValid: true });
  });

  it('rejects empty password', () => {
    expect(validatePassword('')).toEqual({
      isValid: false,
      error: 'Password is required',
    });
  });

  it('rejects short password', () => {
    expect(validatePassword('Ab1')).toEqual({
      isValid: false,
      error: 'Password must be at least 8 characters',
    });
  });

  it('rejects password without uppercase', () => {
    expect(validatePassword('lowercase1')).toEqual({
      isValid: false,
      error: 'Password must contain an uppercase letter',
    });
  });

  it('rejects password without lowercase', () => {
    expect(validatePassword('UPPERCASE1')).toEqual({
      isValid: false,
      error: 'Password must contain a lowercase letter',
    });
  });

  it('rejects password without number', () => {
    expect(validatePassword('NoNumberHere')).toEqual({
      isValid: false,
      error: 'Password must contain a number',
    });
  });
});

describe('validatePhone', () => {
  it('accepts valid phone', () => {
    expect(validatePhone('+1234567890')).toEqual({ isValid: true });
  });

  it('accepts empty phone (optional)', () => {
    expect(validatePhone('')).toEqual({ isValid: true });
  });

  it('rejects invalid phone', () => {
    expect(validatePhone('abc')).toEqual({
      isValid: false,
      error: 'Invalid phone number format',
    });
  });
});

// ─── Cart Calculations ─────────────────────────────────────────

describe('calculateCartTotal', () => {
  it('calculates total from items', () => {
    const items = [
      { price: 1000, quantity: 2 },
      { price: 500, quantity: 1 },
    ];
    expect(calculateCartTotal(items)).toBe(2500);
  });

  it('returns 0 for empty cart', () => {
    expect(calculateCartTotal([])).toBe(0);
  });

  it('handles single item', () => {
    expect(calculateCartTotal([{ price: 999, quantity: 1 }])).toBe(999);
  });
});

describe('calculateItemCount', () => {
  it('counts total items', () => {
    const items = [{ quantity: 2 }, { quantity: 3 }, { quantity: 1 }];
    expect(calculateItemCount(items)).toBe(6);
  });

  it('returns 0 for empty cart', () => {
    expect(calculateItemCount([])).toBe(0);
  });
});

// ─── String Helpers ────────────────────────────────────────────

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World This Is Long', 10)).toBe('Hello Wor…');
  });

  it('returns original if short enough', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('handles exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});

describe('getInitials', () => {
  it('gets initials from name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('handles single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('handles multiple names', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
  });
});

describe('titleCase', () => {
  it('capitalizes each word', () => {
    expect(titleCase('hello world')).toBe('Hello World');
  });

  it('handles already capitalized', () => {
    expect(titleCase('Hello World')).toBe('Hello World');
  });
});

// ─── Array Helpers ─────────────────────────────────────────────

describe('groupBy', () => {
  it('groups items by key', () => {
    const items = [
      { type: 'a', value: 1 },
      { type: 'b', value: 2 },
      { type: 'a', value: 3 },
    ];
    const result = groupBy(items, (item) => item.type);
    expect(result.a).toHaveLength(2);
    expect(result.b).toHaveLength(1);
  });
});

describe('debounce', () => {
  it('returns a function', () => {
    const fn = debounce(() => {}, 100);
    expect(typeof fn).toBe('function');
  });
});
