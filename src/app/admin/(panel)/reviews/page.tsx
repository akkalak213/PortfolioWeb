import type { Metadata } from 'next'
import Link from 'next/link'
import { ReviewStatus } from '@/generated/prisma/enums'
import { ReviewModerationCard } from '@/components/admin/ReviewModerationCard'
import { reviewStatusLabels } from '@/lib/admin-labels'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { getReviewsForModeration } from '@/server/admin-queries'

export const metadata: Metadata = { title: 'รีวิว' }

const tabs = Object.values(ReviewStatus)

function parseStatus(value: string | undefined): ReviewStatus {
  return tabs.find((s) => s === value) ?? 'PENDING'
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const active = parseStatus(status)
  const { reviews, counts } = await getReviewsForModeration(active)

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="font-display text-4xl">รีวิว</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          รีวิวจากลูกค้าต้องผ่านการอนุมัติก่อนขึ้นหน้าเว็บ
        </p>
      </header>

      <nav aria-label="กรองตามสถานะ" className="mb-6">
        <ul className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <li key={tab}>
              <Link
                href={`/admin/reviews?status=${tab}`}
                aria-current={active === tab ? 'true' : undefined}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors',
                  active === tab
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-input text-muted-foreground hover:border-foreground/25 hover:text-foreground',
                )}
              >
                {reviewStatusLabels[tab]}
                <span className="tabular text-xs opacity-60">{counts[tab] ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {reviews.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          ไม่มีรีวิวในสถานะนี้
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id}>
              <ReviewModerationCard
                review={{
                  id: review.id,
                  authorName: review.authorName,
                  authorRole: review.authorRole,
                  submitterEmail: review.submitterEmail,
                  content: review.content,
                  rating: review.rating,
                  serviceCategory: review.serviceCategory,
                  locale: review.locale,
                  status: review.status,
                  isPinned: review.isPinned,
                  replyTh: review.replyTh,
                  replyEn: review.replyEn,
                  createdAt: formatDate(review.createdAt, 'th'),
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
