import { Quote } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { ServiceCategory } from '@/generated/prisma/enums'
import type { Locale } from '@/i18n/routing'
import { Badge } from '@/components/ui/Badge'
import { RatingStars } from '@/components/ui/RatingStars'
import { formatMonthYear } from '@/lib/format'
import { cn } from '@/lib/utils'

export type ReviewCardData = {
  id: string
  authorName: string
  authorRole: string | null
  content: string
  rating: number
  serviceCategory: ServiceCategory | null
  locale: string
  isPinned: boolean
  replyTh: string | null
  replyEn: string | null
  createdAt: Date
}

export async function ReviewCard({
  review,
  locale,
  className,
}: {
  review: ReviewCardData
  locale: Locale
  className?: string
}) {
  const [t, tCat] = await Promise.all([
    getTranslations('reviews'),
    getTranslations('serviceCategory'),
  ])

  const reply = locale === 'th' ? review.replyTh : review.replyEn

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-lg border border-border bg-surface p-6 md:p-7',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <RatingStars
          rating={review.rating}
          label={t('starsOf', { rating: review.rating })}
        />
        {review.isPinned && (
          <Badge variant="accent" className="shrink-0">
            {t('pinned')}
          </Badge>
        )}
      </div>

      <div className="relative mt-5 flex-1">
        <Quote
          size={32}
          aria-hidden
          className="absolute -left-1 -top-2 rotate-180 text-muted-foreground/10"
        />
        {/* lang บอกเบราว์เซอร์ให้เลือกฟอนต์และตัดคำถูกภาษา แม้ผู้รีวิวเขียนคนละภาษากับหน้าเว็บ */}
        <p
          lang={review.locale}
          className="relative text-[0.95rem] leading-relaxed text-foreground/90 text-pretty"
        >
          {review.content}
        </p>
      </div>

      <footer className="mt-6 border-t border-border pt-4">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{review.authorName}</p>
            {review.authorRole && (
              <p className="truncate text-xs text-muted-foreground">{review.authorRole}</p>
            )}
          </div>
          <div className="shrink-0 text-right">
            {review.serviceCategory && (
              <p className="text-xs text-accent">{tCat(review.serviceCategory)}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatMonthYear(review.createdAt, locale)}
            </p>
          </div>
        </div>

        {reply && (
          <div className="mt-4 rounded-md bg-subtle p-4">
            <p className="mb-1.5 text-xs font-medium text-accent">{t('ownerReply')}</p>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{reply}</p>
          </div>
        )}
      </footer>
    </article>
  )
}
