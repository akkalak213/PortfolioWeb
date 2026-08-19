import type { Locale } from '@/i18n/routing'
import type { SiteSettings } from './settings'
import { clientEnv } from './env'

/**
 * JSON-LD สำหรับ Google
 *
 * สำคัญกับธุรกิจ SME มาก เพราะทำให้ขึ้นผลค้นหาแบบมีดาว มีที่อยู่ และมีเวลาทำการ
 * ทุก builder คืน object ธรรมดา ให้เอาไปใส่ <JsonLd> อีกที
 */

const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')

export const absoluteUrl = (path: string) => `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`

/** โลโก้ที่ Google ดึงไปแสดงข้าง ๆ ผลค้นหาและใน knowledge panel */
const logoUrl = absoluteUrl('/logo.png')

export function organizationSchema(settings: SiteSettings, locale: Locale) {
  const { company, social } = settings
  const isThai = locale === 'th'

  const sameAs = [social.facebook, social.instagram, social.youtube, social.tiktok].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${siteUrl}/#organization`,
    name: isThai ? company.nameTh : company.nameEn,
    legalName: company.legalNameTh || undefined,
    url: absoluteUrl(`/${locale}`),
    description: isThai ? settings.hero.subheadlineTh : settings.hero.subheadlineEn,
    email: company.email || undefined,
    telephone: company.phone || undefined,
    taxID: company.taxId || undefined,
    /**
     * logo กับ image ต้องมีทั้งคู่และเป็น URL เต็ม
     * logo คือรูปที่ Google เอาไปวางใน knowledge panel ส่วน image คือรูปประกอบผลค้นหา
     * ขาดไปแล้วผลค้นหาจะเป็นตัวหนังสือล้วน ไม่มีอะไรบอกว่าเป็นแบรนด์ไหน
     */
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
      width: 512,
      height: 512,
    },
    image: logoUrl,
    priceRange: '฿฿',
    currenciesAccepted: 'THB',
    ...(company.openingHoursTh || company.openingHoursEn
      ? { openingHours: isThai ? company.openingHoursTh : company.openingHoursEn }
      : {}),
    areaServed: { '@type': 'Country', name: 'Thailand' },
    ...(sameAs.length ? { sameAs } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: isThai ? company.addressTh : company.addressEn,
      addressCountry: 'TH',
    },
    ...(company.latitude && company.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: company.latitude,
            longitude: company.longitude,
          },
        }
      : {}),
    // บริการทั้งหกอย่างที่รับทำ ช่วยให้ Google จับคู่กับคำค้นได้ตรงขึ้น
    knowsAbout: isThai
      ? ['รับทำเว็บไซต์', 'เว็บแอปพลิเคชัน', 'แอปมือถือ', 'ถ่ายภาพสินค้า', 'ผลิตวิดีโอ', 'ให้เช่าสตูดิโอ']
      : [
          'Web development',
          'Web applications',
          'Mobile applications',
          'Product photography',
          'Video production',
          'Studio rental',
        ],
  }
}

export function websiteSchema(settings: SiteSettings, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: absoluteUrl(`/${locale}`),
    name: locale === 'th' ? settings.company.nameTh : settings.company.nameEn,
    description: locale === 'th' ? settings.hero.subheadlineTh : settings.hero.subheadlineEn,
    inLanguage: locale === 'th' ? 'th-TH' : 'en-US',
    publisher: { '@id': `${siteUrl}/#organization` },
  }
}

export function aggregateRatingSchema(average: number, total: number) {
  // Google ไม่แสดงดาวถ้าไม่มีรีวิวจริง — อย่าใส่ schema เปล่า
  if (total === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    '@id': `${siteUrl}/#rating`,
    itemReviewed: { '@id': `${siteUrl}/#organization` },
    ratingValue: Number(average.toFixed(1)),
    bestRating: 5,
    worstRating: 1,
    ratingCount: total,
  }
}

export function serviceSchema({
  name,
  description,
  slug,
  locale,
  lowPrice,
}: {
  name: string
  description: string
  slug: string
  locale: Locale
  lowPrice: number | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: absoluteUrl(`/${locale}/services/${slug}`),
    provider: { '@id': `${siteUrl}/#organization` },
    areaServed: { '@type': 'Country', name: 'Thailand' },
    ...(lowPrice
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'THB',
            price: lowPrice,
            priceSpecification: {
              '@type': 'PriceSpecification',
              minPrice: lowPrice,
              priceCurrency: 'THB',
            },
          },
        }
      : {}),
  }
}

export function articleSchema({
  title,
  description,
  slug,
  locale,
  image,
  publishedAt,
  updatedAt,
  authorName,
}: {
  title: string
  description: string
  slug: string
  locale: Locale
  image: string | null
  publishedAt: Date | null
  updatedAt: Date
  authorName: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url: absoluteUrl(`/${locale}/blog/${slug}`),
    mainEntityOfPage: absoluteUrl(`/${locale}/blog/${slug}`),
    ...(image ? { image: [image] } : {}),
    datePublished: publishedAt?.toISOString(),
    dateModified: updatedAt.toISOString(),
    inLanguage: locale === 'th' ? 'th-TH' : 'en-US',
    author: authorName
      ? { '@type': 'Person', name: authorName }
      : { '@id': `${siteUrl}/#organization` },
    publisher: {
      '@id': `${siteUrl}/#organization`,
      // Google ต้องการ publisher.logo ตรงนี้ด้วย ไม่ยอมตามไปอ่านจาก @id อย่างเดียว
      logo: { '@type': 'ImageObject', url: logoUrl },
    },
  }
}

export function creativeWorkSchema({
  title,
  description,
  slug,
  locale,
  image,
  year,
  clientName,
}: {
  title: string
  description: string
  slug: string
  locale: Locale
  image: string | null
  year: number | null
  clientName: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: title,
    description,
    url: absoluteUrl(`/${locale}/work/${slug}`),
    // ผลงานที่รูปปกว่างต้องไม่ส่ง image: [''] ออกไป — Google อ่านแล้วตีเป็นข้อมูลผิดรูป
    ...(image ? { image: [image] } : {}),
    ...(year ? { dateCreated: String(year) } : {}),
    creator: { '@id': `${siteUrl}/#organization` },
    ...(clientName ? { sourceOrganization: { '@type': 'Organization', name: clientName } } : {}),
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function faqSchema(items: { question: string; answer: string }[]) {
  if (items.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}
