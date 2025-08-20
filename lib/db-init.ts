// Database initialization for Vercel deployment
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  // In production, we'll use in-memory SQLite or external DB
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'file:./prod.db'
      }
    }
  })
} else {
  // In development, use the existing database connection
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient()
  }
  prisma = globalForPrisma.prisma
}

export { prisma }