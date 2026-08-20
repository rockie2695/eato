/**
 * Authentication Middleware.
 *
 * Verifies JWT access tokens and attaches the user to the request.
 * Supports role-based access control.
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { prisma } from '../config/database.js';
import { isTokenBlacklisted } from '../config/redis.js';
import type { UserRole } from '@prisma/client';

/** Extended Request type with authenticated user */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

/**
 * Require authentication.
 * Verifies JWT token and attaches user to request.
 */
export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
        statusCode: 401,
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      res.status(401).json({
        message: 'Token has been revoked',
        code: 'TOKEN_REVOKED',
        statusCode: 401,
      });
      return;
    }

    // Verify token
    const payload = jwt.verify(token, config.JWT_SECRET) as {
      userId: string;
      email: string;
      role: UserRole;
    };

    // Fetch fresh user data
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!user) {
      res.status(401).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        statusCode: 401,
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
        statusCode: 401,
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
        statusCode: 401,
      });
      return;
    }

    next(error);
  }
}

/**
 * Require specific roles.
 * Must be used after requireAuth middleware.
 * @param roles - Allowed roles
 */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
        statusCode: 401,
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: 'Insufficient permissions',
        code: 'FORBIDDEN',
        statusCode: 403,
      });
      return;
    }

    next();
  };
}
