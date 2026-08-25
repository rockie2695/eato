/**
 * Database connection using Prisma Client.
 *
 * Provides a singleton Prisma instance to avoid multiple connections
 * in development (due to hot reloading).
 *
 * Prisma 7 requires a driver adapter for PostgreSQL.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
}

/**
 * Singleton Prisma client.
 * In development, we store it on globalThis to prevent
 * multiple instances during hot module reloading.
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Connect to the database.
 * Called once at server startup.
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

/**
 * Disconnect from the database.
 * Called on graceful shutdown.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('📦 Database disconnected');
}
