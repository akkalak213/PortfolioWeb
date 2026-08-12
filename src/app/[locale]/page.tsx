import { ArrowRight, ArrowUpRight, Star } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { Badge } from '@/components/ui/Badge'
import { buttonClasses } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { getSiteSettings } from '@/lib/settings'
import { cn } from '@/lib/utils'
import { getActiveServices, getHomeStats } from '@/server/queries'

/**
 * สร้างหน้าใหม่อัตโนมัติทุก 10 นาที
 *
 * ตอน build บน Railway ยังต่อฐานข้อมูลไม่ได้ (private network เปิดหลัง deploy)
 * หน้าจึงถูก prerender ด้วยข้อมูลเปล่า ISR ทำให้มันรีเฟรชตัวเองหลังขึ้นระบบ
 * โดยไม่ต้องผูก build เข้ากับฐานข้อมูล
 *
 * การแก้เนื้อหาจากหน้า /admin ยังสั่ง revalidate ทันทีอยู่แล้ว ไม่ต้องรอรอบนี้
 */
export const revalidate = 600


export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, tc, settings, services, stats] = await Promise.all([
    getTranslations('home'),
    getTranslations('common'),
    getSiteSettings(),
    getActiveServices(),
    getHomeStats(),
  ])

  const isThai = locale === 'th'
  const { hero } = settings

  return (
    <>
      {/* ───────────── Hero ───────────── */}
      <section className="grain relative overflow-hidden border-b border-border">
        {/* แสงนวลจากมุมบนขวา เลียนแบบไฟคีย์ในสตูดิโอ ขยับช้ามากให้ฉากไม่นิ่งสนิท */}
        <div
          aria-hidden
          className="keylight pointer-events-none absolute -right-1/4 -top-1/2 h-[130%] w-[80%] rounded-full bg-accent/10 blur-[120px]"
        />

        <div className="container relative grid gap-14 py-20 md:py-28 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-20 lg:py-36">
          {/* stage ไล่จังหวะให้ลูกทีละชิ้น หัวเรื่องเปิดแบบม่านรูดขึ้นแยกต่างหาก */}
          <div className="stage">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-accent">
              {isThai ? hero.eyebrowTh : hero.eyebrowEn}
            </p>

            <h1 className="sweep font-display text-display-xl text-balance">
              {isThai ? hero.headlineTh : hero.headlineEn}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              {isThai ? hero.subheadlineTh : hero.subheadlineEn}
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className={buttonClasses('primary', 'lg')}>
                {tc('getQuote')}
                <ArrowRight size={18} strokeWidth={1.75} />
              </Link>
              <Link href="/work" className={buttonClasses('outline', 'lg')}>
                {tc('viewWork')}
              </Link>
            </div>

            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-8">
              <div>
                <dt className="text-xs text-muted-foreground">{t('statsProjects')}</dt>
                <dd className="tabular mt-1 font-display text-3xl">
                  {stats.projects > 0 ? `${stats.projects}+` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('statsYears')}</dt>
                <dd className="tabular mt-1 font-display text-3xl">12</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('statsRating')}</dt>
                <dd className="tabular mt-1 flex items-baseline gap-1.5 font-display text-3xl">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
                  {stats.averageRating > 0 && (
                    <Star size={15} className="fill-accent text-accent" aria-hidden />
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* บล็อกภาพ hero — รอเปลี่ยนเป็น showreel จริงเมื่อได้ไฟล์จากลูกค้า */}
          <div
            aria-hidden
            className="relative hidden aspect-[4/5] overflow-hidden rounded-lg border border-border bg-subtle lg:block"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.18),transparent_60%)]" />
            <div className="absolute inset-x-8 bottom-8 space-y-2">
              <div className="h-px w-full bg-border" />
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                Showreel · 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── บริการ ───────────── */}
      <Section
        id="services"
        tone="subtle"
        eyebrow={t('servicesEyebrow')}
        title={t('servicesTitle')}
        subtitle={t('servicesSubtitle')}
        action={
          <Link href="/services" className={buttonClasses('outline', 'md')}>
            {tc('viewAll')}
          </Link>
        }
      >
        {services.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            {tc('empty')}
          </p>
        ) : (
          <ul className="reveal-stagger grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.id} className="bg-background">
                <Link
                  href={`/services/${service.slug}`}
                  className={cn(
                    'group relative flex h-full flex-col gap-4 p-8 transition-colors hover:bg-subtle',
                    // เส้นสีเน้นลากผ่านขอบบนตอนชี้ แทนการยกการ์ดขึ้นซึ่งจะทำให้รอยต่อกริดแยกออกจากกัน
                    'before:absolute before:inset-x-0 before:top-0 before:h-px before:origin-left',
                    'before:scale-x-0 before:bg-accent before:transition-transform before:duration-300',
                    'before:ease-out hover:before:scale-x-100',
                  )}
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-accent-subtle text-accent transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-105">
                    <ServiceIcon name={service.icon} size={20} strokeWidth={1.6} />
                  </span>
                  <h3 className="font-display text-2xl">
                    {isThai ? service.titleTh : service.titleEn}
                  </h3>
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                    {isThai ? service.taglineTh : service.taglineEn}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                    {tc('learnMore')}
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

      {/* ───────────── CTA ───────────── */}
      <section className="border-t border-border py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="accent" className="mb-6">
              {t('ctaNote')}
            </Badge>
            <h2 className="font-display text-display-md text-balance">{t('ctaTitle')}</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
              {t('ctaSubtitle')}
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/contact" className={buttonClasses('accent', 'lg')}>
                {tc('getQuote')}
                <ArrowRight size={18} strokeWidth={1.75} />
              </Link>
              <Link href="/work" className={buttonClasses('outline', 'lg')}>
                {tc('viewWork')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
