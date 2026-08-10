'use client'

import { RotateCw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('error')

  useEffect(() => {
    // digest คือรหัสที่ Next ใส่ไว้ใน log ฝั่งเซิร์ฟเวอร์ ใช้ตามหา stack trace ตัวจริงได้
    console.error('[page error]', error.digest ?? error.message)
  }, [error])

  return (
    <div className="container flex min-h-[60dvh] flex-col items-center justify-center py-20 text-center">
      <h1 className="font-display text-display-md text-balance">{t('title')}</h1>
      <p className="mt-4 max-w-md text-muted-foreground text-pretty">{t('description')}</p>

      {error.digest && (
        <p className="mt-3 font-mono text-xs text-muted-foreground">#{error.digest}</p>
      )}

      <Button onClick={reset} size="lg" className="mt-8">
        <RotateCw size={16} strokeWidth={1.75} aria-hidden />
        {t('retry')}
      </Button>
    </div>
  )
}
