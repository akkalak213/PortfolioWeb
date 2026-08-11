import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ServiceCategory } from '@/generated/prisma/enums'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { ProjectCard } from '@/components/work/ProjectCard'
import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/utils'
import { getProjectCountsByCategory, getProjects } from '@/server/queries'

const categories = Object.values(ServiceCategory)

function parseCategory(value: string | undefined): ServiceCategory | undefined {
  return categories.find((c) => c === value)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'work' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: `/${locale}/work` },
  }
}

export default async function WorkPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ category?: string }>
}) {
  const [{ locale }, { category }] = await Promise.all([params, searchParams])
  setRequestLocale(locale)

  const active = parseCategory(category)

  const [t, tCat, projects, counts] = await Promise.all([
    getTranslations('work'),
    getTranslations('serviceCategory'),
    getProjects(active),
    getProjectCountsByCategory(),
  ])

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0)

  return (
    <Section eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')}>
      {/*
        ตัวกรองเป็นลิงก์จริง ไม่ใช่ปุ่ม JavaScript
        แต่ละหมวดจึงมี URL ของตัวเอง แชร์ได้ กด back ได้ และ Google เก็บ index ได้
      */}
      <nav aria-label={t('filterLabel')} className="mb-10">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/work"
              aria-current={!active ? 'true' : undefined}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors',
                !active
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-input text-muted-foreground hover:border-foreground/25 hover:text-foreground',
              )}
            >
              {tCat('all')}
              <span className="tabular text-xs opacity-60">{total}</span>
            </Link>
          </li>
          {categories.map((cat) => {
            const count = counts[cat] ?? 0
            if (count === 0) return null

            return (
              <li key={cat}>
                <Link
                  href={{ pathname: '/work', query: { category: cat } }}
                  aria-current={active === cat ? 'true' : undefined}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors',
                    active === cat
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-input text-muted-foreground hover:border-foreground/25 hover:text-foreground',
                  )}
                >
                  {tCat(cat)}
                  <span className="tabular text-xs opacity-60">{count}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {projects.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-20 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <div className="reveal-stagger grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              locale={locale}
              priority={index < 3}
            />
          ))}
        </div>
      )}
    </Section>
  )
}
