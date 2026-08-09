import bcrypt from 'bcryptjs'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import { authConfig } from './auth.config'
import { db } from './lib/db'

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await db.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        })

        /**
         * เทียบ hash เสมอแม้ไม่เจอผู้ใช้ เพื่อให้เวลาที่ใช้ตอบใกล้เคียงกันทุกกรณี
         * ถ้า return null ทันทีตอนไม่เจอ คนร้ายจะจับเวลาแล้วเดาได้ว่าอีเมลไหนมีอยู่จริง
         */
        const hash = user?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin'
        const isValid = await bcrypt.compare(parsed.data.password, hash)

        if (!user || !user.isActive || !isValid) return null

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          role: user.role,
        }
      },
    }),
  ],
})
