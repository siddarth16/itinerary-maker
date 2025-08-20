import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// For Vercel deployment, use a simpler approach
let prisma: any;

if (process.env.VERCEL) {
  // In Vercel, use in-memory fallback for demo
  const { productionDb } = require('./db-production');
  prisma = productionDb;
} else {
  // Local development with SQLite
  prisma = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
}

export { prisma };