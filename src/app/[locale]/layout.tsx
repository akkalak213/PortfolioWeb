import type { Metadata } from 'next'
import {
  IBM_Plex_Sans_Thai,
  Inter,
  Instrument_Serif,
  JetBrains_Mono,
  Noto_Serif_Thai,
} from 'next/font/google'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Analytics } from '@/components/Analytics'
import { JsonLd } from '@/components/JsonLd'
import { Providers } from '@/components/Providers'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { routing, type Locale } from '@/i18n/routing'
import { clientEnv } from '@/lib/env'
import { ogImageUrl } from '@/lib/og'
import { getSiteSettings } from '@/lib/settings'
import { organizationSchema, websiteSchema } from '@/lib/structured-data'
import '../globals.css'

// ละติน — หัวข้อใหญ่เป็น serif ให้ความรู้สึกงาน editorial, เนื้อหาเป็น sans อ่านง่าย
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

// ไทย — เบราว์เซอร์จะข้ามมาใช้ชุดนี้เองเมื่อเจอกลิฟที่ฟอนต์ละตินไม่มี
const notoSerifThai = Noto_Serif_Thai({
  subsets: ['thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display-th',
  display: 'swap',
})

const plexSansThai = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans-th',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const fontVariables = [
  instrumentSerif.variable,
  inter.variable,
  notoSerifThai.variable,
  plexSansThai.variable,
  jetbrainsMono.variable,
].join(' ')

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })
  const tBrand = await getTranslations({ locale, namespace: 'brand' })

  return {
    metadataBase: new URL(clientEnv.NEXT_PUBLIC_SITE_URL),
    title: {
      default: t('metaTitle'),
      template: `%s · ${tBrand('name')}`,
    },
    description: t('metaDescription'),
    alternates: {
      canonical: `/${locale}`,
      languages: { th: '/th', en: '/en' },
    },
    openGraph: {
      type: 'website',
      siteName: tBrand('name'),
      locale: locale === 'th' ? 'th_TH' : 'en_US',
      title: t('metaTitle'),
      description: t('metaDescription'),
      images: [
        {
          url: ogImageUrl(t('metaTitle'), tBrand('tagline')),
          width: 1200,
          height: 630,
          alt: t('metaTitle'),
        },
      ],
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  setRequestLocale(locale)
  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
    getSiteSettings(),
  ])

  return (
    <html lang={locale} suppressHydrationWarning className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <Providers>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
            >
              {t('skipToContent')}
            </a>
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </Providers>
        </NextIntlClientProvider>

        {/* ประกาศตัวตนธุรกิจให้ Google ครั้งเดียวที่ layout ทุกหน้าได้รับผลเหมือนกัน */}
        <JsonLd data={organizationSchema(settings, locale)} />
        <JsonLd data={websiteSchema(settings, locale)} />

        <Analytics />
      </body>
    </html>
  )
}
