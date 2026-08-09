import type { Locale } from '@/i18n/routing'

/** Prisma คืน Decimal เป็นอ็อบเจกต์ ไม่ใช่ number — ต้องแปลงก่อนใช้เสมอ */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const intlLocale = (locale: Locale) => (locale === 'th' ? 'th-TH' : 'en-US')

/** ราคาแบบไม่มีทศนิยม เพราะงานบริการในไทยไม่เคยคิดเป็นสตางค์ */
export function formatPrice(value: unknown, locale: Locale): string | null {
  const n = toNumber(value)
  if (n === null) return null

  return new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(value)
}

export function formatDate(date: Date | string, locale: Locale): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function formatMonthYear(date: Date | string, locale: Locale): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(intlLocale(locale), { month: 'short', year: 'numeric' }).format(d)
}

/**
 * ดึง id วิดีโอจากลิงก์ YouTube/Vimeo ทุกรูปแบบที่ลูกค้ามักส่งมา
 * (youtu.be, /watch?v=, /embed/, /shorts/, vimeo.com/123456)
 */
export type VideoSource = { provider: 'youtube' | 'vimeo'; id: string } | null

export function parseVideoUrl(url: string | null | undefined): VideoSource {
  if (!url) return null

  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      return id ? { provider: 'youtube', id } : null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const fromQuery = parsed.searchParams.get('v')
      if (fromQuery) return { provider: 'youtube', id: fromQuery }

      const match = parsed.pathname.match(/^\/(?:embed|shorts|v)\/([^/?]+)/)
      return match ? { provider: 'youtube', id: match[1] } : null
    }

    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const match = parsed.pathname.match(/(\d+)/)
      return match ? { provider: 'vimeo', id: match[1] } : null
    }

    return null
  } catch {
    return null
  }
}

export function videoEmbedUrl(source: NonNullable<VideoSource>): string {
  return source.provider === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${source.id}?rel=0`
    : `https://player.vimeo.com/video/${source.id}`
}

export function videoThumbnailUrl(source: NonNullable<VideoSource>): string | null {
  // Vimeo ต้องเรียก API ถึงจะได้ thumbnail จึงคืน null แล้วให้ผู้ใช้ตั้ง coverImage เอง
  return source.provider === 'youtube'
    ? `https://i.ytimg.com/vi/${source.id}/maxresdefault.jpg`
    : null
}
