'use client'

import { ArrowDown, Check } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { selectPackage, type SelectedPackage } from './PackageSelection'

/**
 * ปุ่มเลือกแพ็กเกจ
 *
 * เดิมแค่พิมพ์ข้อความลงช่องข้อความให้ ซึ่งไม่ต่างจากลูกค้าพิมพ์เอง
 * ตอนนี้ส่งข้อมูลที่มีโครงสร้างไปให้ฟอร์ม แล้วฟอร์มเอาไปเติมช่องงบประมาณ
 * แสดงสรุปให้เห็น และส่งชื่อกับราคาไปถึงหลังบ้านพร้อมคำขอ
 *
 * ตั้งใจไม่ subscribe store ที่นี่ ปุ่มแค่ต้องสั่งอย่างเดียว
 * จึงเก็บสถานะ "ใบนี้ถูกเลือก" ไว้ในตัวเอง ไม่ต้องใช้ hook ที่ผูกกับ store
 */
export function ChoosePackageButton({
  pkg,
  label,
  chosenLabel,
  className,
}: {
  pkg: SelectedPackage
  label: string
  chosenLabel: string
  className?: string
}) {
  const pathname = usePathname()
  const [isChosen, setChosen] = useState(false)

  const handleClick = () => {
    selectPackage(pkg, pathname)
    setChosen(true)

    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isChosen}
      className={cn(
        'mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors',
        isChosen
          ? 'bg-success/15 text-success'
          : 'border border-input hover:border-accent hover:bg-accent-subtle hover:text-accent',
        className,
      )}
    >
      {isChosen ? (
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
