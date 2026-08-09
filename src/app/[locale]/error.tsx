'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('error')

  useEffect(() => {
    // digest คือรหัสที่ Next ใส่ให้ error ฝั่งเซิร์ฟเวอร์ ใช้ไล่หา log ที่ตรงกันใน Railway ได้
    console.error('[error-boundary]', error.digest ?? error.message)
  }, [error])

  return (
    <section className="flex min-h-[60dvh] items-center py-20">
      <div className="container text-center">
        <h1 className="font-display text-display-sm text-balance">{t('title')}</h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground text-pretty">{t('description')}</p>

        <Button size="lg" className="mt-9" onClick={reset}>
          {t('retry')}
        </Button>

        {error.digest && (
          <p className="mt-6 font-mono text-xs text-muted-foreground">ref: {error.digest}</p>
        )}
      </div>
    </section>
  )
}
