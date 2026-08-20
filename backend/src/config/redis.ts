/**
 * Redis client configuration.
 *
 * Uses ioredis for connection management.
 * Redis is used for: caching, rate limiting, JWT blacklist, session storage.
 */

import Redis from 'ioredis';
import { config } from './index.js';

/**
 * Create a Redis client instance.
 * Configured with retry strategy and error handling.
 */
export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
  enableReadyCheck: true,
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

// ─── Cache Helpers ─────────────────────────────────────────────

/**
 * Get a cached value by key.
 * Returns null if not found or expired.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

/**
 * Set a cached value with optional TTL.
 * @param key - Cache key
 * @param value - Value to cache (will be JSON serialized)
 * @param ttlSeconds - Time to live in seconds (default: 5 minutes)
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

/**
 * Delete a cached value by key.
 */
export async function cacheDel(key: string): Promise<void> {
  await redis.del(key);
}

/**
 * Delete all keys matching a pattern.
 * Useful for invalidating related cache entries.
 */
export async function cacheDelPattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// ─── JWT Blacklist ─────────────────────────────────────────────

/**
 * Add a token to the JWT blacklist.
 * @param token - JWT to blacklist
 * @param expiresIn - Expiry in seconds (should match JWT expiry)
 */
export async function blacklistToken(
  token: string,
  expiresIn: number
): Promise<void> {
  await redis.set(`blacklist:${token}`, '1', 'EX', expiresIn);
}

/**
 * Check if a token is blacklisted.
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const result = await redis.get(`blacklist:${token}`);
  return result === '1';
}

// ─── Rate Limiting ─────────────────────────────────────────────

/**
 * Check and increment rate limit counter.
 * @param key - Rate limit key (e.g., "login:192.168.1.1")
 * @param windowSeconds - Time window in seconds
 * @param maxRequests - Maximum requests allowed in window
 * @returns Object with allowed status and remaining count
 */
export async function checkRateLimit(
  key: string,
  windowSeconds: number,
  maxRequests: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }

  const ttl = await redis.ttl(key);
  const resetAt = Math.floor(Date.now() / 1000) + ttl;

  return {
    allowed: current <= maxRequests,
    remaining: Math.max(0, maxRequests - current),
    resetAt,
  };
}
