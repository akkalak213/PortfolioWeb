'use client'

import { ArrowDown, Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * ปุ่มเลือกแพ็กเกจ — พาไปที่ฟอร์มด้านล่างแล้วเติมข้อความให้เลย
 *
 * เดิมการ์ดแพ็กเกจเป็นแค่ข้อความ ลูกค้าเห็นราคาแล้วอยากกดแต่กดไม่ได้
 * ต้องเลื่อนลงไปหาฟอร์มแล้วพิมพ์เองว่าสนใจแพ็กเกจไหน
 *
 * เขียนข้อความต่อท้ายของเดิม ไม่ทับ เผื่อผู้ใช้พิมพ์อะไรไว้แล้ว
 * และยิง input event เพื่อให้ React รับรู้ค่าที่เปลี่ยน
 */
export function ChoosePackageButton({
  packageName,
  serviceName,
  label,
  chosenLabel,
  className,
}: {
  packageName: string
  serviceName: string
  label: string
  chosenLabel: string
  className?: string
}) {
  const [chosen, setChosen] = useState(false)

  const handleClick = () => {
    const form = document.getElementById('lead-form')
    const message = document.getElementById('message') as HTMLTextAreaElement | null

    if (message) {
      const line = `สนใจ ${serviceName} · แพ็กเกจ ${packageName}`
      const current = message.value.trim()
      message.value = current && !current.includes(line) ? `${current}\n${line}` : line

      // React ไม่เห็นการเปลี่ยนค่าที่เซ็ตจากภายนอก ต้องแจ้งผ่าน event ที่มันดักฟังอยู่
      message.dispatchEvent(new Event('input', { bubbles: true }))
    }

    form?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // โฟกัสหลังเลื่อนจบ ไม่งั้นเบราว์เซอร์จะกระชากไปที่ช่องทันทีจนเห็นการเลื่อนไม่ทัน
    setTimeout(() => message?.focus({ preventScroll: true }), 500)

    setChosen(true)
    setTimeout(() => setChosen(false), 2200)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors',
        chosen
          ? 'bg-success/15 text-success'
          : 'border border-input hover:border-accent hover:bg-accent-subtle hover:text-accent',
        className,
      )}
    >
      {chosen ? (
        <>
          <Check size={16} strokeWidth={2.5} aria-hidden />
          {chosenLabel}
        </>
      ) : (
        <>
          {label}
          <ArrowDown size={15} strokeWidth={2} aria-hidden />
        </>
      )}
    </button>
  )
}
