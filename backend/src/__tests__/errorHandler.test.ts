/**
 * Tests for error handler middleware.
 */

import { describe, it, expect } from 'vitest';
import { ApiError } from '../middleware/errorHandler';

describe('ApiError', () => {
  it('creates error with message and status code', () => {
    const error = new ApiError('Not found', 404, 'NOT_FOUND');
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.name).toBe('ApiError');
  });

  it('creates error with details', () => {
    const details = { email: ['Email is required'] };
    const error = new ApiError('Validation error', 400, 'VALIDATION_ERROR', details);
    expect(error.details).toEqual(details);
  });

  it('is instance of Error', () => {
    const error = new ApiError('Error', 500, 'INTERNAL_ERROR');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });

  it('has optional details', () => {
    const error = new ApiError('Simple error', 400, 'BAD_REQUEST');
    expect(error.details).toBeUndefined();
  });
});
