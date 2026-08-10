import type { NextAuthConfig } from 'next-auth'

/**
 * ส่วนของ Auth.js ที่ middleware ใช้ได้
 *
 * ไฟล์นี้ต้องรันบน edge runtime ได้ จึงห้าม import Prisma หรือ bcrypt
 * ตัว provider ที่ต้องแตะฐานข้อมูลอยู่ใน auth.ts ซึ่งรันบน Node เท่านั้น
 */
export const authConfig = {
  /**
   * Railway ยืน reverse proxy อยู่หน้า container ทำให้ host ที่แอปเห็นไม่ตรงกับโดเมนจริง
   * ถ้าไม่เปิด trustHost เอาไว้ Auth.js จะปฏิเสธทุกคำขอด้วย UntrustedHost แล้วล็อกอินไม่ได้เลย
   * (บน Vercel ไม่ต้องตั้ง เพราะตรวจจับให้อัตโนมัติ — แต่ที่อื่นต้องบอกเอง)
   */
  trustHost: true,
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
