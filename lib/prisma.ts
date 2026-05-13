import { PrismaClient } from "@prisma/client"
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// 1. Set up the connection pool
const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })

// 2. Wrap it in the Prisma v7 Adapter
const adapter = new PrismaPg(pool)

// 3. Create the Singleton
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma