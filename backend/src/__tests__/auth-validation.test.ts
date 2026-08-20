/**
 * Tests for auth validation schemas.
 */

import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, refreshSchema } from '../modules/auth/validation';

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'notanemail',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'StrongPass1',
      name: 'John Doe',
    });
    expect(result.success).toBe(true);
  });

  it('accepts registration with phone', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'StrongPass1',
      name: 'John Doe',
      phone: '+1234567890',
    });
    expect(result.success).toBe(true);
  });

  it('rejects weak password', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'weak',
      name: 'John Doe',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short name', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'StrongPass1',
      name: 'J',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'invalid',
      password: 'StrongPass1',
      name: 'John Doe',
    });
    expect(result.success).toBe(false);
  });
});

describe('refreshSchema', () => {
  it('accepts valid refresh token', () => {
    const result = refreshSchema.safeParse({
      refreshToken: 'valid-token-here',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty refresh token', () => {
    const result = refreshSchema.safeParse({
      refreshToken: '',
    });
    expect(result.success).toBe(false);
  });
});
