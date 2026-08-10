'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/**
 * ใช้กล่องพิมพ์ของเบราว์เซอร์แทนการสร้าง PDF ฝั่งเซิร์ฟเวอร์
 * ข้อดีคือฟอนต์ไทยตัดคำและวางสระถูกต้องแน่นอน และไม่ต้องฝัง TTF เข้า bundle
 * ผู้ใช้เลือกปลายทางเป็น "Save as PDF" ได้จากกล่องเดียวกัน
 */
export function PrintButton() {
  return (
    <Button onClick={() => window.print()} className="no-print">
      <Printer size={16} strokeWidth={1.75} aria-hidden />
      พิมพ์ / บันทึกเป็น PDF
    </Button>
  )
}
