'use client'

import { RotateCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { Button, buttonClasses } from '@/components/ui/Button'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[admin error]', error.digest ?? error.message)
  }, [error])

  const isUnauthorized = error.message.includes('ไม่ได้รับอนุญาต')

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-20 text-center">
      <h1 className="font-display text-3xl">
        {isUnauthorized ? 'ไม่มีสิทธิ์เข้าถึงส่วนนี้' : 'ระบบหลังบ้านขัดข้อง'}
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        {isUnauthorized
          ? 'บัญชีของคุณอาจถูกปิดสิทธิ์ หรือเซสชันหมดอายุแล้ว ลองเข้าสู่ระบบใหม่อีกครั้ง'
          : 'ลองโหลดหน้านี้ใหม่ ถ้ายังไม่หายให้ตรวจ log ของ Railway'}
      </p>

      {error.digest && (
        <p className="mt-3 font-mono text-xs text-muted-foreground">#{error.digest}</p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RotateCw size={16} strokeWidth={1.75} aria-hidden />
          ลองใหม่
        </Button>
        <Link href="/admin/login" className={buttonClasses('outline', 'md')}>
          เข้าสู่ระบบอีกครั้ง
        </Link>
      </div>
    </div>
  )
}
