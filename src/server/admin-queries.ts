import { cache } from 'react'
import { db } from '@/lib/db'

/**
 * Query ของหลังบ้าน
 *
 * ต่างจาก server/queries.ts ตรงที่ไม่มี fallback เงียบ ๆ
 * ถ้าฐานข้อมูลล่ม แอดมินควรเห็นหน้า error ไปเลย ดีกว่าเห็นตัวเลข 0 แล้วเข้าใจผิดว่าไม่มีงานค้าง
 */

/** ตัวเลขบนป้ายแจ้งเตือนใน sidebar — งานที่ยังไม่มีใครแตะ */
export const getAdminCounts = cache(async () => {
  const [leads, reviews] = await Promise.all([
    db.lead.count({ where: { status: 'NEW' } }),
    db.review.count({ where: { status: 'PENDING' } }),
  ])
  return { leads, reviews }
})

export const getDashboardData = cache(async () => {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    leadsNew,
    leadsThisMonth,
    leadsWon,
    reviewsPending,
    reviewsApproved,
    ratingAggregate,
    projectsPublished,
    projectsDraft,
    quotesDraft,
    quotesSent,
    recentLeads,
    recentReviews,
  ] = await Promise.all([
    db.lead.count({ where: { status: 'NEW' } }),
    db.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
    db.lead.count({ where: { status: 'WON' } }),
    db.review.count({ where: { status: 'PENDING' } }),
    db.review.count({ where: { status: 'APPROVED' } }),
    db.review.aggregate({ where: { status: 'APPROVED' }, _avg: { rating: true } }),
    db.project.count({ where: { status: 'PUBLISHED' } }),
    db.project.count({ where: { status: 'DRAFT' } }),
    db.quote.count({ where: { status: 'DRAFT' } }),
    db.quote.count({ where: { status: 'SENT' } }),
    db.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        refCode: true,
        name: true,
        company: true,
        source: true,
        status: true,
        services: true,
        createdAt: true,
      },
    }),
    db.review.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: {
        id: true,
        authorName: true,
        authorRole: true,
        rating: true,
        content: true,
        createdAt: true,
      },
    }),
  ])

  return {
    leads: { new: leadsNew, thisMonth: leadsThisMonth, won: leadsWon },
    reviews: {
      pending: reviewsPending,
      approved: reviewsApproved,
      average: ratingAggregate._avg.rating ?? 0,
    },
    projects: { published: projectsPublished, draft: projectsDraft },
    quotes: { draft: quotesDraft, sent: quotesSent },
    recentLeads,
    recentReviews,
  }
})
