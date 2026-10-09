import { PrismaClient } from "@prisma/client"
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// 1. Initialize the connection pool using the Pooled URL
// This matches the variable name with the Prisma icon in your Vercel dashboard.
const connectionString = process.env.VESTRIPPN_PRISMA_DATABASE_URL

if (!connectionString) {
  console.error("Critical: VESTRIPPN_PRISMA_DATABASE_URL is missing from environment.");
}

// A database on this machine (local development, tests) speaks plain TCP;
// every hosted database keeps TLS, as Vercel Postgres requires.
const isLocalDatabase = /@(localhost|127\.0\.0\.1)(:\d+)?\//.test(connectionString ?? "")

const pool = new Pool({
  connectionString,
  ssl: isLocalDatabase ? false : true,
})

// 2. Wrap it in the Prisma v7 Adapter
const adapter = new PrismaPg(pool)

// 3. Create the Singleton to prevent "Too many clients" errors during HMR
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = 
  globalForPrisma.prisma || 
  new PrismaClient({ 
    adapter,
    // Helping Prisma 7 identify the datasource context
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma