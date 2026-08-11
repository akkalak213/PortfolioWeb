import { Handshake, PackageOpen, Receipt } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { Section } from '@/components/ui/Section'
import { getTeamMembers } from '@/server/queries'

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


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: `/${locale}/about` },
  }
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, team] = await Promise.all([getTranslations('about'), getTeamMembers()])
  const isThai = locale === 'th'

  const values = [
    { icon: Receipt, title: t('value1Title'), body: t('value1Body') },
    { icon: PackageOpen, title: t('value2Title'), body: t('value2Body') },
    { icon: Handshake, title: t('value3Title'), body: t('value3Body') },
  ]

  return (
    <>
      <section className="border-b border-border py-16 md:py-24">
        <div className="container">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-accent">
            {t('eyebrow')}
          </p>
          <h1 className="max-w-4xl font-display text-display-lg text-balance">{t('title')}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <Section title={t('storyTitle')}>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          <p className="text-lg leading-relaxed text-muted-foreground text-pretty">
            {t('storyParagraph1')}
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground text-pretty">
            {t('storyParagraph2')}
          </p>
        </div>
      </Section>

      <Section tone="subtle" title={t('valuesTitle')}>
        <ul className="reveal-stagger grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {values.map(({ icon: Icon, title, body }) => (
            <li key={title} className="bg-background p-8">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-accent-subtle text-accent">
                <Icon size={20} strokeWidth={1.6} aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-2xl text-balance">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">{body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {team.length > 0 && (
        <Section title={t('teamTitle')} subtitle={t('teamSubtitle')}>
          <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <li key={member.id}>
                {member.photo && (
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-subtle">
                    <Image
                      src={member.photo}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="mt-5 font-display text-2xl">{member.name}</h3>
                <p className="mt-1 text-sm text-accent">{isThai ? member.roleTh : member.roleEn}</p>
                {(isThai ? member.bioTh : member.bioEn) && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                    {isThai ? member.bioTh : member.bioEn}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  )
}
