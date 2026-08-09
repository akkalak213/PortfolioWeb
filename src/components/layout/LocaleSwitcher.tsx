'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { localeLabels, locales, type Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations('locale')
  const active = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const switchTo = (next: Locale) => {
    if (next === active) return
    startTransition(() => {
      // usePathname ของ next-intl คืนค่าโดยตัด prefix ภาษาออกแล้ว จึงอยู่หน้าเดิมหลังสลับภาษา
      router.replace(pathname, { locale: next })
    })
  }

  return (
    <div
      role="group"
      aria-label={t('switch')}
      className={cn(
        'inline-flex items-center rounded-md border border-border p-0.5',
        isPending && 'opacity-60',
        className,
      )}
    >
      {locales.map((locale) => {
        const isActive = locale === active
        return (
          <button
            key={locale}
            type="button"
            onClick={() => switchTo(locale)}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'rounded-[5px] px-2 py-1 text-xs font-medium transition-colors',
              isActive
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {localeLabels[locale].short}
          </button>
        )
      })}
    </div>
  )
}
