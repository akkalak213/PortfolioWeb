import { Aperture, Camera, Lightbulb, Mic, Package, Plane, SlidersHorizontal } from 'lucide-react'
import type { LucideIcon, LucideProps } from 'lucide-react'
import type { EquipmentCategory } from '@/generated/prisma/enums'

/**
 * ไอคอนประจำหมวดอุปกรณ์
 *
 * แยกออกมาเป็นแผนที่คงที่แทนที่จะเก็บชื่อไอคอนไว้ในฐานข้อมูลแบบที่บริการทำ
 * เพราะหมวดอุปกรณ์เป็น enum ที่แก้ได้เฉพาะตอนแก้ schema อยู่แล้ว
 * ถ้าเพิ่มหมวดใหม่ TypeScript จะฟ้องตรงนี้ทันทีว่ายังไม่ได้เลือกไอคอนให้
 */
const icons: Record<EquipmentCategory, LucideIcon> = {
  CAMERA: Camera,
  LENS: Aperture,
  LIGHTING: Lightbulb,
  AUDIO: Mic,
  GRIP: SlidersHorizontal,
  DRONE: Plane,
  ACCESSORY: Package,
}

export function EquipmentIcon({
  category,
  ...props
}: { category: EquipmentCategory } & LucideProps) {
  const Icon = icons[category] ?? Package
  return <Icon {...props} />
}
