import { defineRouting } from 'next-intl/routing'

export const locales = ['th', 'en'] as const
export type Locale = (typeof locales)[number]

export const localeLabels: Record<Locale, { short: string; full: string }> = {
  th: { short: 'ไทย', full: 'ภาษาไทย' },
  en: { short: 'EN', full: 'English' },
}

export const routing = defineRouting({
  locales,
  defaultLocale: 'th',
  // เขียน prefix ทุกภาษาเสมอ (/th, /en) เพื่อให้ URL คาดเดาได้และแคชได้ตรงไปตรงมา
  localePrefix: 'always',
})
