/**
 * Auth Service.
 *
 * Handles user authentication, token management, and session lifecycle.
 * Uses bcrypt for password hashing and JWT for token generation.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database.js';
import { config } from '../../config/index.js';
import { blacklistToken } from '../../config/redis.js';
import { ApiError } from '../../middleware/errorHandler.js';
import type { UserRole } from '@prisma/client';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string | null;
    avatar?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate JWT access and refresh token pair.
 */
function generateTokens(user: { id: string; email: string; role: UserRole }): TokenPair {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}

/**
 * Register a new customer account.
 */
export async function register(
  email: string,
  password: string,
  name: string,
  phone?: string
): Promise<AuthResult> {
  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone,
      role: 'customer',
    },
  });

  const tokens = generateTokens(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    ...tokens,
  };
}

/**
 * Login with email and password.
 */
export async function login(
  email: string,
  password: string
): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const tokens = generateTokens(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    ...tokens,
  };
}

/**
 * Refresh access token using refresh token.
 */
export async function refresh(refreshToken: string): Promise<AuthResult> {
  try {
    const payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new ApiError('User not found', 401, 'USER_NOT_FOUND');
    }

    // Blacklist the old refresh token
    const decoded = jwt.decode(refreshToken) as { exp?: number };
    if (decoded.exp) {
      await blacklistToken(refreshToken, decoded.exp - Math.floor(Date.now() / 1000));
    }

    const tokens = generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      ...tokens,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
}

/**
 * Get current user profile.
 */
export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
}

/**
 * Logout - blacklist the refresh token.
 */
export async function logout(refreshToken: string): Promise<void> {
  try {
    const decoded = jwt.decode(refreshToken) as { exp?: number };
    if (decoded?.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await blacklistToken(refreshToken, ttl);
      }
    }
  } catch {
    // Token already invalid - ignore
  }
}
