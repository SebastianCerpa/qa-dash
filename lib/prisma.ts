import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Use STORAGE_DATABASE_URL as fallback if DATABASE_URL is not available
const databaseUrl = process.env.DATABASE_URL || process.env.STORAGE_DATABASE_URL;

export const prisma = globalThis.prisma || new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
