import { cache } from 'react'
import { db } from '@/lib/db'

/**
 * ตัวห่อสำหรับ query ที่ใช้บนหน้าเว็บสาธารณะ
 *
 * ถ้าฐานข้อมูลล่มหรือยังไม่ได้ตั้งค่า เราเลือกให้หน้าเว็บแสดง empty state
 * แทนที่จะพังทั้งหน้า — แต่ยัง log ไว้เสมอเพื่อให้จับปัญหาได้จาก log ของ Railway
 */
async function safe<T>(label: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run()
  } catch (error) {
    console.error(`[query:${label}] อ่านฐานข้อมูลไม่สำเร็จ`, error)
    return fallback
  }
}

export const getActiveServices = cache(() =>
  safe(
    'services',
    () =>
      db.service.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          slug: true,
          category: true,
          icon: true,
          titleTh: true,
          titleEn: true,
          taglineTh: true,
          taglineEn: true,
          coverImage: true,
        },
      }),
    [],
  ),
)

export const getHomeStats = cache(() =>
  safe(
    'home-stats',
    async () => {
      const [projects, reviews] = await Promise.all([
        db.project.count({ where: { status: 'PUBLISHED' } }),
        db.review.aggregate({
          where: { status: 'APPROVED' },
          _count: true,
          _avg: { rating: true },
        }),
      ])

      return {
        projects,
        reviewCount: reviews._count,
        averageRating: reviews._avg.rating ?? 0,
      }
    },
    { projects: 0, reviewCount: 0, averageRating: 0 },
  ),
)
