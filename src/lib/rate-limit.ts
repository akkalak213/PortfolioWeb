import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { db } from './db'
import { serverEnv } from './env'

/**
 * กันสแปมฟอร์มสาธารณะโดยนับจากฐานข้อมูล ไม่ใช่หน่วยความจำ
 * เพราะ Railway อาจรันหลาย container และ restart บ่อย — ตัวนับใน memory จะรีเซ็ตทุกครั้ง
 *
 * เราไม่เก็บ IP ดิบ เก็บเฉพาะ hash ที่ผสม AUTH_SECRET (ย้อนกลับไม่ได้)
 */

export async function getClientIpHash(): Promise<string> {
  const headerList = await headers()

  const forwarded = headerList.get('x-forwarded-for')
  const ip =
    forwarded?.split(',')[0]?.trim() ||
    headerList.get('x-real-ip') ||
    headerList.get('cf-connecting-ip') ||
    'unknown'

  return createHash('sha256').update(`${ip}:${serverEnv.AUTH_SECRET}`).digest('hex').slice(0, 32)
}

export async function getUserAgent(): Promise<string | null> {
  const headerList = await headers()
  return headerList.get('user-agent')?.slice(0, 300) ?? null
}

type Limit = { max: number; windowMs: number }

const limits = {
  review: { max: 3, windowMs: 24 * 60 * 60 * 1000 }, // 3 รีวิวต่อวันต่อ IP
  lead: { max: 5, windowMs: 60 * 60 * 1000 }, // 5 คำขอต่อชั่วโมงต่อ IP
} satisfies Record<string, Limit>

export type RateLimitKind = keyof typeof limits

export async function isRateLimited(kind: RateLimitKind, ipHash: string): Promise<boolean> {
  const { max, windowMs } = limits[kind]
  const since = new Date(Date.now() - windowMs)

  try {
    const count =
      kind === 'review'
        ? await db.review.count({ where: { ipHash, createdAt: { gte: since } } })
        : await db.lead.count({ where: { ipHash, createdAt: { gte: since } } })

    return count >= max
  } catch (error) {
    // อ่านตัวนับไม่ได้ = ไม่บล็อก ดีกว่าปฏิเสธลูกค้าจริงเพราะฐานข้อมูลสะดุด
    console.error('[rate-limit] นับไม่สำเร็จ', error)
    return false
  }
}
