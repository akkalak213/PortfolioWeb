import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { LeadForm } from '@/components/forms/LeadForm'
import { getSiteSettings } from '@/lib/settings'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: `/${locale}/contact` },
  }
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, settings] = await Promise.all([getTranslations('contact'), getSiteSettings()])
  const { company } = settings
  const isThai = locale === 'th'

  const details = [
    company.email && { icon: Mail, value: company.email, href: `mailto:${company.email}` },
    company.phone && {
      icon: Phone,
      value: company.phone,
      href: `tel:${company.phone.replace(/\s/g, '')}`,
    },
    company.lineId && { icon: MessageCircle, value: company.lineId, href: null },
    { icon: MapPin, value: isThai ? company.addressTh : company.addressEn, href: null },
  ].filter(Boolean) as { icon: typeof Mail; value: string; href: string | null }[]

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-accent">
            {t('eyebrow')}
          </p>
          <h1 className="font-display text-display-lg text-balance">{t('title')}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
            {t('subtitle')}
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <div className="rounded-lg border border-border bg-surface p-7 md:p-9">
            <h2 className="mb-7 font-display text-2xl">{t('formTitle')}</h2>
            <LeadForm source="CONTACT" />
          </div>

          <aside className="space-y-10">
            <div>
              <h2 className="mb-5 text-sm font-medium">{t('directTitle')}</h2>
              <ul className="space-y-4">
                {details.map(({ icon: Icon, value, href }) => (
                  <li key={value} className="flex gap-3">
                    <Icon
                      size={17}
                      strokeWidth={1.75}
                      aria-hidden
                      className="mt-0.5 shrink-0 text-accent"
                    />
                    {href ? (
                      <a
                        href={href}
                        className="text-sm text-muted-foreground transition-colors hover:text-accent"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground text-pretty">{value}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-sm font-medium">{t('hoursTitle')}</h2>
              <p className="flex gap-3 text-sm text-muted-foreground">
                <Clock size={17} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-accent" />
                {isThai ? company.openingHoursTh : company.openingHoursEn}
              </p>
            </div>

            <p className="rounded-md border border-border bg-subtle p-4 text-sm text-muted-foreground text-pretty">
              {t('responseNote')}
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}
