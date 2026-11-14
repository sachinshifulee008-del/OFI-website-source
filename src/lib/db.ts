import { PrismaClient } from '@prisma/client'
import { copyFileSync, existsSync } from 'fs'
import path from 'path'

function resolveDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url || !url.startsWith('file:') || !process.env.VERCEL) return url

  const src = path.join(process.cwd(), 'db', 'custom.db')
  const dest = '/tmp/ofi-custom.db'
  if (existsSync(src) && !existsSync(dest)) {
    copyFileSync(src, dest)
  }
  return existsSync(dest) ? `file:${dest}` : url
}

const databaseUrl = resolveDatabaseUrl()
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: databaseUrl,
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
