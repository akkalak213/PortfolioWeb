import { cn } from '@/lib/utils'

/**
 * โลโก้ชั่วคราวแบบตัวอักษรล้วน — ยังไม่มีไฟล์โลโก้จริงจากลูกค้า
 * เปลี่ยนเป็น SVG จริงได้ที่ไฟล์นี้ที่เดียว ทุกที่ในเว็บจะตามทันที
 */
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-baseline gap-2 select-none', className)}>
      <span className="font-display text-xl leading-none tracking-[0.02em] md:text-[1.6rem]">
        Alexan
        <span className="text-accent">.</span>
      </span>
      {!compact && (
        <span className="hidden text-[0.6rem] font-medium uppercase tracking-[0.28em] text-muted-foreground sm:inline">
          Production
        </span>
      )}
    </span>
  )
}
