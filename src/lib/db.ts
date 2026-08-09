import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'
import { serverEnv } from './env'

/**
 * Prisma 7 ต่อ Postgres ผ่าน driver adapter
 * เก็บ instance ไว้บน globalThis เพื่อไม่ให้ hot reload ตอน dev เปิด connection pool ซ้ำจนเต็ม
 */

const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: serverEnv.DATABASE_URL }),
    log: serverEnv.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (serverEnv.NODE_ENV !== 'production') globalForPrisma.prisma = db
