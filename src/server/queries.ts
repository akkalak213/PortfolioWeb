import { cache } from 'react'
import type { EquipmentCategory, ServiceCategory } from '@/generated/prisma/enums'
import { db } from '@/lib/db'

/**
 * Query ทั้งหมดของหน้าเว็บสาธารณะ
 *
 * ทุกตัวห่อด้วย safe() — ถ้าฐานข้อมูลล่ม หน้าเว็บจะแสดง empty state แทนที่จะพังทั้งหน้า
 * แต่ยัง log ทุกครั้งเพื่อให้จับปัญหาได้จาก log ของ Railway
 */
async function safe<T>(label: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run()
  } catch (error) {
    console.error(`[query:${label}] อ่านฐานข้อมูลไม่สำเร็จ`, error)
    return fallback
  }
}

// ─────────────────────────── บริการ ───────────────────────────

const serviceCardSelect = {
  id: true,
  slug: true,
  category: true,
  icon: true,
  titleTh: true,
  titleEn: true,
  taglineTh: true,
  taglineEn: true,
  coverImage: true,
} as const

export const getActiveServices = cache(() =>
  safe(
    'services',
    () =>
      db.service.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: serviceCardSelect,
      }),
    [],
  ),
)

export const getServiceBySlug = cache((slug: string) =>
  safe(
    'service-detail',
    () =>
      db.service.findFirst({
        where: { slug, isActive: true },
        include: {
          packages: { where: { isActive: true }, orderBy: { order: 'asc' } },
        },
      }),
    null,
  ),
)

export const getServiceSlugs = cache(() =>
  safe(
    'service-slugs',
    () => db.service.findMany({ where: { isActive: true }, select: { slug: true } }),
    [] as { slug: string }[],
  ),
)

// ─────────────────────────── ผลงาน ───────────────────────────

const projectCardSelect = {
  id: true,
  slug: true,
  category: true,
  titleTh: true,
  titleEn: true,
  summaryTh: true,
  summaryEn: true,
  coverImage: true,
  coverBlurData: true,
  clientName: true,
  year: true,
  isFeatured: true,
} as const

export const getProjects = cache((category?: ServiceCategory) =>
  safe(
    'projects',
    () =>
      db.project.findMany({
        where: { status: 'PUBLISHED', ...(category ? { category } : {}) },
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }, { order: 'asc' }],
        select: projectCardSelect,
      }),
    [],
  ),
)

export const getFeaturedProjects = cache((take = 4) =>
  safe(
    'featured-projects',
    () =>
      db.project.findMany({
        where: { status: 'PUBLISHED', isFeatured: true },
        orderBy: [{ order: 'asc' }, { publishedAt: 'desc' }],
        take,
        select: projectCardSelect,
      }),
    [],
  ),
)

export const getProjectBySlug = cache((slug: string) =>
  safe(
    'project-detail',
    () =>
      db.project.findFirst({
        where: { slug, status: 'PUBLISHED' },
        include: {
          media: { orderBy: { order: 'asc' } },
          service: { select: { slug: true, titleTh: true, titleEn: true } },
        },
      }),
    null,
  ),
)

export const getProjectSlugs = cache(() =>
  safe(
    'project-slugs',
    () => db.project.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true } }),
    [] as { slug: string }[],
  ),
)

export const getRelatedProjects = cache((category: ServiceCategory, excludeId: string, take = 3) =>
  safe(
    'related-projects',
    () =>
      db.project.findMany({
        where: { status: 'PUBLISHED', category, id: { not: excludeId } },
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
        take,
        select: projectCardSelect,
      }),
    [],
  ),
)

export const getProjectCountsByCategory = cache(() =>
  safe(
    'project-counts',
    async () => {
      const rows = await db.project.groupBy({
        by: ['category'],
        where: { status: 'PUBLISHED' },
        _count: { _all: true },
      })
      return Object.fromEntries(rows.map((r) => [r.category, r._count._all])) as Partial<
        Record<ServiceCategory, number>
      >
    },
    {} as Partial<Record<ServiceCategory, number>>,
  ),
)

// ─────────────────────── อุปกรณ์ให้เช่า ───────────────────────

export const getEquipment = cache((category?: EquipmentCategory) =>
  safe(
    'equipment',
    () =>
      db.equipment.findMany({
        where: { isActive: true, ...(category ? { category } : {}) },
        orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }],
      }),
    [],
  ),
)

export const getEquipmentCountsByCategory = cache(() =>
  safe(
    'equipment-counts',
    async () => {
      const rows = await db.equipment.groupBy({
        by: ['category'],
        where: { isActive: true },
        _count: { _all: true },
      })
      return Object.fromEntries(rows.map((r) => [r.category, r._count._all])) as Partial<
        Record<EquipmentCategory, number>
      >
    },
    {} as Partial<Record<EquipmentCategory, number>>,
  ),
)

// ─────────────────────────── รีวิว ───────────────────────────

export const getApprovedReviews = cache((take?: number) =>
  safe(
    'reviews',
    () =>
      db.review.findMany({
        where: { status: 'APPROVED' },
        orderBy: [{ isPinned: 'desc' }, { approvedAt: 'desc' }, { createdAt: 'desc' }],
        ...(take ? { take } : {}),
        select: {
          id: true,
          authorName: true,
          authorRole: true,
          authorAvatar: true,
          content: true,
          rating: true,
          serviceCategory: true,
          locale: true,
          isPinned: true,
          replyTh: true,
          replyEn: true,
          repliedAt: true,
          createdAt: true,
        },
      }),
    [],
  ),
)

export const getReviewStats = cache(() =>
  safe(
    'review-stats',
    async () => {
      const [aggregate, byRating] = await Promise.all([
        db.review.aggregate({
          where: { status: 'APPROVED' },
          _count: true,
          _avg: { rating: true },
        }),
        db.review.groupBy({
          by: ['rating'],
          where: { status: 'APPROVED' },
          _count: { _all: true },
        }),
      ])

      const counts = new Map(byRating.map((r) => [r.rating, r._count._all]))
      const total = aggregate._count

      return {
        total,
        average: aggregate._avg.rating ?? 0,
        distribution: [5, 4, 3, 2, 1].map((star) => {
          const count = counts.get(star) ?? 0
          return { star, count, percent: total > 0 ? (count / total) * 100 : 0 }
        }),
      }
    },
    {
      total: 0,
      average: 0,
      distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0, percent: 0 })),
    },
  ),
)

// ─────────────────────────── บทความ ───────────────────────────

const postCardSelect = {
  id: true,
  slug: true,
  titleTh: true,
  titleEn: true,
  excerptTh: true,
  excerptEn: true,
  coverImage: true,
  tags: true,
  readingMinutes: true,
  publishedAt: true,
  isFeatured: true,
} as const

export const getPosts = cache((take?: number) =>
  safe(
    'posts',
    () =>
      db.post.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
        ...(take ? { take } : {}),
        select: postCardSelect,
      }),
    [],
  ),
)

export const getPostBySlug = cache((slug: string) =>
  safe(
    'post-detail',
    () =>
      db.post.findFirst({
        where: { slug, status: 'PUBLISHED' },
        include: { author: { select: { name: true, avatarUrl: true } } },
      }),
    null,
  ),
)

export const getPostSlugs = cache(() =>
  safe(
    'post-slugs',
    () => db.post.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true } }),
    [] as { slug: string }[],
  ),
)

// ─────────────────────────── ทีมงาน ───────────────────────────

export const getTeamMembers = cache(() =>
  safe(
    'team',
    () => db.teamMember.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    [],
  ),
)

// ─────────────────────── สถิติหน้าแรก ───────────────────────

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
