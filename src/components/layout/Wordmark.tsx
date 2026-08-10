import { cn } from '@/lib/utils'

/**
 * ชื่อแบรนด์ — ล็อกให้เหมือนกันทุกที่ ทุกภาษา ทุกขนาดจอ
 *
 * ของเดิมซ่อนคำว่า "Production" บนจอเล็ก และมี prop compact ที่ซ่อนมันในบางหน้า
 * ทำให้ชื่อแบรนด์เปลี่ยนไปมาแล้วแต่ว่าอยู่ตรงไหน ซึ่งเป็นสิ่งที่แบรนด์ไม่ควรทำ
 *
 * ฟอนต์ถูกล็อกเป็น Instrument Serif ผ่านคลาส .wordmark ใน globals.css
 * ไม่ตามภาษาของหน้า ชื่อแบรนด์จึงหน้าตาเดิมทั้งหน้าไทยและหน้าอังกฤษ
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      // ป้องกันไม่ให้ชื่อแบรนด์ถูกตัดขึ้นบรรทัดใหม่กลางคำ
      className={cn('wordmark inline-flex select-none items-baseline whitespace-nowrap', className)}
    >
      <span className="text-[1.15rem] leading-none md:text-[1.35rem]">Alexan</span>
      <span aria-hidden className="mx-[0.12em] text-accent">
        .
      </span>
      <span className="text-[1.15rem] leading-none md:text-[1.35rem]">Production</span>
    </span>
  )
}
