/**
 * Staff Service.
 *
 * Manages staff accounts (CRUD operations).
 * Only accessible by admin users.
 */

import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database.js';
import { ApiError } from '../../middleware/errorHandler.js';
import type { UserRole } from '@prisma/client';

/**
 * Get all staff users.
 */
export async function getAllStaff() {
  return prisma.user.findMany({
    where: {
      role: { in: ['staff', 'kitchen', 'admin'] },
    },
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
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Create a new staff account.
 */
export async function createStaff(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
}) {
  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    throw new ApiError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
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

  return user;
}

/**
 * Update a staff member's profile.
 */
export async function updateStaff(
  id: string,
  data: Partial<{
    name: string;
    phone: string;
    role: UserRole;
    avatar: string;
  }>
) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError('Staff member not found', 404, 'USER_NOT_FOUND');
  }

  return prisma.user.update({
    where: { id },
    data,
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
}

/**
 * Delete a staff member.
 */
export async function deleteStaff(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError('Staff member not found', 404, 'USER_NOT_FOUND');
  }

  // Prevent deleting the last admin
  if (user.role === 'admin') {
    const adminCount = await prisma.user.count({
      where: { role: 'admin' },
    });
    if (adminCount <= 1) {
      throw new ApiError(
        'Cannot delete the last admin account',
        400,
        'LAST_ADMIN'
      );
    }
  }

  await prisma.user.delete({ where: { id } });
}
