/**
 * Rate Limiting Middleware.
 *
 * Uses Redis-backed rate limiting to prevent abuse.
 * Configurable per-route with different limits.
 */

import type { Request, Response, NextFunction } from 'express';
import { checkRateLimit } from '../config/redis.js';

interface RateLimitOptions {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Custom key generator (default: IP-based) */
  keyGenerator?: (req: Request) => string;
  /** Custom error message */
  message?: string;
}

/**
 * Create a rate limiting middleware.
 * @param options - Rate limit configuration
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    maxRequests,
    windowSeconds,
    keyGenerator = (req) => req.ip || 'unknown',
    message = 'Too many requests, please try again later',
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = `ratelimit:${keyGenerator(req)}`;

    try {
      const { allowed, remaining, resetAt } = await checkRateLimit(
        key,
        windowSeconds,
        maxRequests
      );

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetAt);

      if (!allowed) {
        res.status(429).json({
          message,
          code: 'RATE_LIMIT_EXCEEDED',
          statusCode: 429,
          retryAfter: resetAt - Math.floor(Date.now() / 1000),
        });
        return;
      }

      next();
    } catch {
      // If Redis is down, allow the request through
      next();
    }
  };
}

/** Pre-configured rate limiters for common routes */
export const authLimiter = rateLimit({
  maxRequests: 10,
  windowSeconds: 60,
  message: 'Too many login attempts, please try again in 1 minute',
});

export const apiLimiter = rateLimit({
  maxRequests: 100,
  windowSeconds: 60,
  message: 'API rate limit exceeded, please slow down',
});

export const orderLimiter = rateLimit({
  maxRequests: 5,
  windowSeconds: 60,
  keyGenerator: (req) => {
    const userId = (req as { user?: { id: string } }).user?.id;
    return userId || req.ip || 'unknown';
  },
  message: 'Too many order attempts, please wait before ordering again',
});
