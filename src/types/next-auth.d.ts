import type { DefaultSession } from 'next-auth'
import type { UserRole } from '@/generated/prisma/enums'

/** เพิ่ม id และ role เข้าไปใน session ให้ TypeScript รู้จัก */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession['user']
  }

  interface User {
    role: UserRole
  }
}

/**
 * ต้องขยาย '@auth/core/jwt' ไม่ใช่ 'next-auth/jwt'
 * เพราะ next-auth/jwt เป็นแค่ re-export — การ augment ตัว re-export ไม่มีผลกับ interface ต้นทาง
 */
declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}
