'use client'

import { Printer } from 'lucide-react'
import { Button, type ButtonVariant } from '@/components/ui/Button'

/**
 * ใช้กล่องพิมพ์ของเบราว์เซอร์แทนการสร้าง PDF ฝั่งเซิร์ฟเวอร์
 *
 * ข้อดีคือฟอนต์ไทยตัดคำและวางสระถูกต้องแน่นอน และไม่ต้องฝัง TTF เข้า bundle
 * ผู้ใช้เลือกปลายทางเป็น "Save as PDF" ได้จากกล่องเดียวกัน
 * (ลองประเมินไลบรารีสร้าง PDF ฝั่งเซิร์ฟเวอร์แล้ว ทุกตัวต้องฝังฟอนต์ไทยเองและยังจัดสระเพี้ยน)
 *
 * ย้ายมาจาก components/admin เพราะตอนนี้หน้าสาธารณะก็ใช้ด้วย
 * ป้ายกำกับจึงต้องรับจากข้างนอก ไม่ล็อกภาษาไทยไว้ในตัวคอมโพเนนต์เหมือนเดิม
 */
export function PrintButton({
  label,
  variant = 'primary',
}: {
  label: string
  variant?: ButtonVariant
}) {
  return (
    <Button variant={variant} onClick={() => window.print()} className="no-print">
      <Printer size={16} strokeWidth={1.75} aria-hidden />
      {label}
    </Button>
  )
}
