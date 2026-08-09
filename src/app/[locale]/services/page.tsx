import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { buttonClasses } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { getActiveServices } from '@/server/queries'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'services' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: `/${locale}/services` },
  }
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, tc, services] = await Promise.all([
    getTranslations('services'),
    getTranslations('common'),
    getActiveServices(),
  ])

  const isThai = locale === 'th'

  return (
    <>
      <Section eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')}>
        {services.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            {tc('empty')}
          </p>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2">
            {services.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="group flex h-full flex-col rounded-lg border border-border bg-surface p-8 transition-colors hover:border-accent/40 md:p-10"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-accent-subtle text-accent">
                      <ServiceIcon name={service.icon} size={22} strokeWidth={1.6} />
                    </span>

                    <h2 className="mt-5 font-display text-3xl text-balance">
                      {isThai ? service.titleTh : service.titleEn}
                    </h2>

                    <p className="mt-3 flex-1 leading-relaxed text-muted-foreground text-pretty">
                      {isThai ? service.taglineTh : service.taglineEn}
                    </p>

                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                      {tc('viewDetails')}
                      <ArrowUpRight
                        size={15}
                        strokeWidth={2}
                        aria-hidden
                        className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </Section>

      <section className="border-t border-border bg-subtle py-20 md:py-24">
        <div className="container text-center">
          <h2 className="font-display text-display-sm text-balance">{t('ctaTitle')}</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-pretty">
            {t('ctaSubtitle')}
          </p>
          <Link href="/contact" className={buttonClasses('accent', 'lg', 'mt-8')}>
            {tc('getQuote')}
            <ArrowRight size={18} strokeWidth={1.75} />
          </Link>
        </div>
      </section>
    </>
  )
}
