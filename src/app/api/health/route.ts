import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isMailConfigured, isR2Configured } from '@/lib/env'

// ต้องเช็คสดทุกครั้ง ห้ามให้ Next แคชผลลัพธ์
export const dynamic = 'force-dynamic'

/**
 * Health check สำหรับ Railway
 *
 * คืน 503 เมื่อต่อฐานข้อมูลไม่ได้ เพื่อให้ Railway ไม่สลับ traffic มาที่ container
 * ที่ deploy ใหม่แต่ยังต่อ DB ไม่ติด
 */
export async function GET() {
  const startedAt = Date.now()

  try {
    await db.$queryRaw`SELECT 1`
  } catch (error) {
    console.error('[health] ต่อฐานข้อมูลไม่ได้', error)
    return NextResponse.json(
      { status: 'unhealthy', database: 'down' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    )
  }

  return NextResponse.json(
    {
      status: 'ok',
      database: 'up',
      latencyMs: Date.now() - startedAt,
      // บอกว่าบริการเสริมตัวไหนยังไม่ได้ตั้งค่า จะได้รู้ตั้งแต่ก่อนลูกค้าเจอปัญหา
      storage: isR2Configured ? 'configured' : 'not-configured',
      mail: isMailConfigured ? 'configured' : 'not-configured',
    },
    { headers: { 'cache-control': 'no-store' } },
  )
}
