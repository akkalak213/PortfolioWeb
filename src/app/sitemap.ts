import type { MetadataRoute } from 'next'
import { locales } from '@/i18n/routing'
import { clientEnv } from '@/lib/env'
import { getPostSlugs, getProjectSlugs, getServiceSlugs } from '@/server/queries'

const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')

/**
 * ทุก URL มีทั้งเวอร์ชันไทยและอังกฤษ
 * ต้องบอก Google ด้วย alternates ว่าสองหน้านี้คือเนื้อหาเดียวกันคนละภาษา
 * ไม่งั้นจะถูกมองว่าเป็นเนื้อหาซ้ำและกดอันดับกันเอง
 */
function withAlternates(
  path: string,
  options: { changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency']; priority?: number } = {},
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, `${siteUrl}/${locale}${path}`]),
  )

  return locales.map((locale) => ({
    url: `${siteUrl}/${locale}${path}`,
    lastModified: new Date(),
    changeFrequency: options.changeFrequency ?? 'monthly',
    priority: options.priority ?? 0.6,
    alternates: { languages },
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, posts] = await Promise.all([
    getServiceSlugs(),
    getProjectSlugs(),
    getPostSlugs(),
  ])

  return [
    ...withAlternates('', { changeFrequency: 'weekly', priority: 1 }),
    ...withAlternates('/services', { changeFrequency: 'monthly', priority: 0.9 }),
    ...withAlternates('/work', { changeFrequency: 'weekly', priority: 0.9 }),
    ...withAlternates('/rental', { changeFrequency: 'weekly', priority: 0.8 }),
    ...withAlternates('/reviews', { changeFrequency: 'weekly', priority: 0.7 }),
    ...withAlternates('/blog', { changeFrequency: 'weekly', priority: 0.7 }),
    ...withAlternates('/about', { priority: 0.6 }),
    ...withAlternates('/contact', { priority: 0.8 }),
    // หน้ากฎหมายไม่ได้ช่วยเรื่องอันดับ แต่ Google ใช้ประกอบการตัดสินว่าเว็บนี้เป็นธุรกิจจริง
    ...withAlternates('/privacy', { changeFrequency: 'yearly', priority: 0.2 }),
    ...withAlternates('/terms', { changeFrequency: 'yearly', priority: 0.2 }),

    ...services.flatMap((s) => withAlternates(`/services/${s.slug}`, { priority: 0.8 })),
    ...projects.flatMap((p) => withAlternates(`/work/${p.slug}`, { priority: 0.7 })),
    ...posts.flatMap((p) => withAlternates(`/blog/${p.slug}`, { priority: 0.6 })),
  ]
}
