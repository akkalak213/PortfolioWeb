import type { NextAuthConfig } from 'next-auth'

/**
 * ส่วนของ Auth.js ที่ middleware ใช้ได้
 *
 * ไฟล์นี้ต้องรันบน edge runtime ได้ จึงห้าม import Prisma หรือ bcrypt
 * ตัว provider ที่ต้องแตะฐานข้อมูลอยู่ใน auth.ts ซึ่งรันบน Node เท่านั้น
 */
export const authConfig = {
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    // credentials provider ใช้ database session ไม่ได้ ต้องเป็น JWT
    strategy: 'jwt',
    maxAge: 60 * 60 * 8, // 8 ชั่วโมง — พอดีหนึ่งวันทำงาน ไม่ค้างข้ามคืน
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
