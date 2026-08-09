import { MessageSquareQuote, Users } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { RatingStars } from '@/components/ui/RatingStars'
import { Section } from '@/components/ui/Section'
import { formatNumber } from '@/lib/format'
import { getApprovedReviews, getReviewStats } from '@/server/queries'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'reviews' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: `/${locale}/reviews` },
  }
}

export default async function ReviewsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, reviews, stats] = await Promise.all([
    getTranslations('reviews'),
    getApprovedReviews(),
    getReviewStats(),
  ])

  return (
    <>
      <Section eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')}>
        {stats.total > 0 && (
          <div className="mb-14 grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface p-8">
              <p className="tabular font-display text-6xl">{stats.average.toFixed(1)}</p>
              <RatingStars
                rating={stats.average}
                size={18}
                className="mt-3"
                label={t('starsOf', { rating: stats.average.toFixed(1) })}
              />
              <p className="mt-3 text-xs text-muted-foreground">{t('averageRating')}</p>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface p-8">
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle text-accent">
                <Users size={22} strokeWidth={1.6} aria-hidden />
              </span>
              <p className="tabular font-display text-4xl">{formatNumber(stats.total, locale)}</p>
              <p className="mt-2 text-xs text-muted-foreground">{t('totalReviews')}</p>
            </div>

            <div className="rounded-lg border border-border bg-surface p-8">
              <p className="mb-4 text-xs text-muted-foreground">{t('distribution')}</p>
              <ul className="space-y-2.5">
                {stats.distribution.map((row) => (
                  <li key={row.star} className="flex items-center gap-3 text-xs">
                    <span className="tabular w-3 font-medium">{row.star}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-accent"
                        style={{ width: `${row.percent}%` }}
                      />
                    </span>
                    <span className="tabular w-6 text-right text-muted-foreground">{row.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-20 text-center text-sm text-muted-foreground">
            {t('empty')}
          </p>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} locale={locale} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        id="write"
        tone="subtle"
        eyebrow={t('writeReview')}
        title={t('formTitle')}
        align="center"
      >
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex gap-2.5 rounded-md border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
            <MessageSquareQuote
              size={16}
              strokeWidth={1.75}
              aria-hidden
              className="mt-0.5 shrink-0 text-accent"
            />
            <span className="text-pretty">{t('formNote')}</span>
          </div>

          <div className="rounded-lg border border-border bg-surface p-7 md:p-9">
            <ReviewForm />
          </div>
        </div>
      </Section>
    </>
  )
}
