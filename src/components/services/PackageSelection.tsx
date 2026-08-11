'use client'

import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'

/**
 * แพ็กเกจที่ลูกค้ากดเลือกจากหน้าบริการ
 *
 * ราคาถูกจัดรูปแบบมาจากฝั่งเซิร์ฟเวอร์แล้ว เพราะ Decimal ของ Prisma
 * ส่งข้ามมาฝั่ง client ตรง ๆ ไม่ได้ และการจัดรูปแบบสกุลเงินต้องรู้ locale
 */
export type SelectedPackage = {
  id: string
  name: string
  /** ข้อความราคาที่ลูกค้าเห็นตอนกด เช่น "เริ่มต้น ฿15,000 ต่อวัน" */
  priceTag: string
  /** ช่วงงบที่ตรงกับราคาแพ็กเกจ ใช้เติมช่องงบประมาณให้อัตโนมัติ */
  budgetRange: string | null
  serviceName: string
}

/**
 * เก็บสถานะไว้นอก React แทนการใช้ Context
 *
 * เคยลองครอบทั้งหน้าด้วย Provider แล้วพบว่าส่วนเนื้อหาไม่ hydrate เลย
 * (จาก 60/60 เหลือ 38/64) เพราะ Client Component ที่เป็นรากของหน้า
 * ต้องรับ Server Component ทั้งหมดเข้ามาเป็น children
 *
 * แบบนี้ปุ่มกับฟอร์มแค่ import โมดูลเดียวกัน ไม่ต้องมีอะไรครอบ
 * โครงสร้างหน้าจึงเป็น Server Component ล้วนเหมือนเดิม
 */
let selected: SelectedPackage | null = null
let selectedOnPath: string | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * ฟังก์ชันธรรมดา ไม่ใช่ hook
 * ปุ่มเลือกแพ็กเกจแค่ต้องสั่ง ไม่ต้องเฝ้าดูสถานะ จึงไม่ต้องใช้ hook ใด ๆ
 */
export function selectPackage(pkg: SelectedPackage, pathname: string) {
  selected = pkg
  selectedOnPath = pathname
  emit()
}

export function clearPackage() {
  selected = null
  selectedOnPath = null
  emit()
}

/** ใช้เฉพาะฝั่งฟอร์มที่ต้องแสดงผลตามสิ่งที่ถูกเลือก */
export function usePackageSelection() {
  const pathname = usePathname()

  const stored = useSyncExternalStore(
    subscribe,
    () => selected,
    // ตอนเรนเดอร์ฝั่งเซิร์ฟเวอร์ยังไม่มีใครเลือกอะไร ต้องคืน null ให้ตรงกับ HTML แรก
    () => null,
  )

  // ย้ายไปหน้าอื่นแล้วของที่เลือกไว้ต้องไม่ตามไปด้วย
  return {
    selected: selectedOnPath === pathname ? stored : null,
    clear: clearPackage,
  }
}
