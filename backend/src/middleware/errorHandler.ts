/**
 * Global Error Handler Middleware.
 *
 * Catches all unhandled errors and returns a consistent
 * JSON error response format.
 */

import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: Record<string, string[]>;
}

/**
 * Custom error class for application-specific errors.
 */
export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

/**
 * Global error handler.
 * Formats all errors into a consistent API response.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ── Zod Validation Error ───────────────────────────────────
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    err.errors.forEach((e) => {
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

  // ── Prisma Errors ──────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const field = (err.meta?.target as string[])?.join(', ') || 'field';
        res.status(409).json({
          message: `A record with this ${field} already exists`,
          code: 'DUPLICATE_ENTRY',
          statusCode: 409,
        });
        return;
      }
      case 'P2025':
        res.status(404).json({
          message: 'Record not found',
          code: 'NOT_FOUND',
          statusCode: 404,
        });
        return;
      default:
        break;
    }
  }

  // ── Custom API Error ───────────────────────────────────────
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
    });
    return;
  }

  // ── Unknown Error ──────────────────────────────────────────
  console.error('Unhandled error:', err);

  res.status(500).json({
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  });
}
