/**
 * Tests for validate middleware.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { z } from 'zod';

describe('validate middleware', () => {
  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
  });

  const mockReq = (body: any) => ({ body } as any);
  const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNext = vi.fn();
  });

  it('passes valid data through', () => {
    const middleware = validate(schema);
    const req = mockReq({ name: 'John', email: 'john@example.com' });
    const res = mockRes();

    middleware(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'John', email: 'john@example.com' });
  });

  it('rejects invalid data', () => {
    const middleware = validate(schema);
    const req = mockReq({ name: '', email: 'invalid' });
    const res = mockRes();

    middleware(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    );
  });

  it('returns field-specific errors', () => {
    const middleware = validate(schema);
    const req = mockReq({});
    const res = mockRes();

    middleware(req, res, mockNext as unknown as NextFunction);

    const response = res.json.mock.calls[0][0];
    expect(response.details).toBeDefined();
    expect(response.details.name).toBeDefined();
    expect(response.details.email).toBeDefined();
  });
});
