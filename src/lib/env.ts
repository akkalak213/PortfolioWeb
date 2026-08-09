import { z } from 'zod'

/**
 * ตรวจ environment variable ตอนบูตแอป แทนที่จะปล่อยให้พังกลางทางด้วย `undefined!`
 * ตอน build ใน Docker จะยังไม่มีค่าจริง จึงข้ามได้ด้วย SKIP_ENV_VALIDATION=1
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'ต้องมี DATABASE_URL ของ Railway Postgres'),

  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET ต้องยาวอย่างน้อย 32 ตัวอักษร'),

  // Cloudflare R2 — ไม่บังคับตอน dev ถ้ายังไม่อัปโหลดไฟล์
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_URL: z.url().optional(),

  // Resend — ไม่ตั้งค่า = ฟอร์มยังบันทึกลง DB แต่ไม่ส่งอีเมล
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().optional(),
  MAIL_TO: z.string().optional(),
})

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
})

const skip = process.env.SKIP_ENV_VALIDATION === '1'

function parse<T extends z.ZodType>(schema: T, source: unknown, label: string): z.infer<T> {
  if (skip) return source as z.infer<T>

  const result = schema.safeParse(source)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new Error(`ตั้งค่า ${label} ไม่ถูกต้อง:\n${issues}`)
  }
  return result.data
}

export const serverEnv = parse(serverSchema, process.env, 'environment variable ฝั่งเซิร์ฟเวอร์')

// Next.js แทนค่า NEXT_PUBLIC_* ตอน build จึงต้องอ้างถึงแบบเต็มชื่อ ไม่ใช่ spread จาก process.env
export const clientEnv = parse(
  clientSchema,
  {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  },
  'environment variable ฝั่งเบราว์เซอร์',
)

export const isR2Configured = Boolean(
  serverEnv.R2_ACCOUNT_ID &&
    serverEnv.R2_ACCESS_KEY_ID &&
    serverEnv.R2_SECRET_ACCESS_KEY &&
    serverEnv.R2_BUCKET &&
    serverEnv.R2_PUBLIC_URL,
)

export const isMailConfigured = Boolean(
  serverEnv.RESEND_API_KEY && serverEnv.MAIL_FROM && serverEnv.MAIL_TO,
)
