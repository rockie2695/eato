/**
 * Validation Middleware.
 *
 * Validates request body against a Zod schema.
 * Returns structured validation errors.
 */

import type { Request, Response, NextFunction } from 'express';
import { type ZodType } from 'zod';

/**
 * Create a validation middleware for a given Zod schema.
 * @param schema - Zod schema to validate against
 */
export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const field = e.path.join('.');
        if (!details[field]) details[field] = [];
        details[field].push(e.message);
      });

      res.status(400).json({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details,
      });
      return;
    }

    // Replace req.body with validated/sanitized data
    req.body = result.data;
    next();
  };
}
