import type { Metadata } from 'next'
import { IBM_Plex_Sans_Thai, Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
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

/**
 * ฟอนต์แยกตามภาษา ไม่ใช่ปล่อยให้ fallback หากลิฟเอง
 *
 * การวาง stack เป็น "ละตินก่อน แล้วค่อยตกไปไทย" ดูเหมือนจะได้ผล
 * แต่ตัวเลขและเครื่องหมายวรรคตอนมีอยู่ในฟอนต์ละตินด้วย มันจึงไม่เคยตกไปฟอนต์ไทย
 * ทำให้ "15,000 บาท" มีตัวเลขคนละฟอนต์กับตัวอักษร — คนละ x-height คนละน้ำหนัก
 *
 * ทางแก้คือสลับลำดับ stack ตาม :lang() ใน globals.css
 * หน้าไทยจึงใช้ฟอนต์ไทยล้วนทั้งตัวอักษร ตัวเลข และวรรคตอน
 */

// ละติน — หัวข้อเป็น serif ให้ความรู้สึกงาน editorial เนื้อหาเป็น sans อ่านง่าย
// ไม่ประกาศ italic เพราะทั้งเว็บไม่มีที่ไหนใช้ — ประกาศไว้เฉย ๆ คือดึงไฟล์ทิ้งฟรีทุกหน้า
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

/**
 * ไทย — ตระกูลเดียวใช้ทั้งหัวข้อและเนื้อหา กลิฟละตินของมันคือ IBM Plex Sans
 * ภาษาอังกฤษที่แทรกในประโยคไทยจึงกลมกลืน ไม่กระโดดเป็นอีกฟอนต์
 *
 * ต้องมี subset latin ด้วย ไม่ใช่แค่ thai เพราะตัวเลข 0-9 อยู่ในช่วง latin
 * ถ้าตัดออกตัวเลขจะตกไปฟอนต์อื่นแล้วกลับไปเป็นปัญหาเดิม
 *
 * เคยลองแยกประกาศเป็นสองชุดเพื่อ preload เฉพาะน้ำหนักหัวข้อ แต่ไม่ได้ผล
 * next/font รวมประกาศที่เป็นตระกูลและ subset เดียวกันเข้าด้วยกัน แล้วให้ preload ชนะ
 */
const plexThai = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-thai',
  display: 'swap',
})

// ใช้เฉพาะป้ายเล็ก ๆ ไม่กี่จุด ไม่คุ้มที่จะดึงล่วงหน้า
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
})

const fontVariables = [
  instrumentSerif.variable,
  inter.variable,
  plexThai.variable,
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
        {/* แถบบอกความคืบหน้าการอ่าน ผูกกับ scroll timeline ของ CSS ไม่มี JavaScript */}
        <div aria-hidden className="scroll-progress no-print" />

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
