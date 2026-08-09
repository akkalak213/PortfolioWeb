import type { LucideProps } from 'lucide-react'
import { iconMap, fallbackIcon } from '@/lib/icons'

/**
 * ฐานข้อมูลเก็บชื่อไอคอนเป็นข้อความ การจับคู่จึงต้องเกิดตอนเรนเดอร์
 * ห่อไว้ในคอมโพเนนต์นี้ที่เดียว หน้าอื่นจะได้ไม่ต้องประกาศตัวแปรคอมโพเนนต์เองระหว่างเรนเดอร์
 */
export function ServiceIcon({
  name,
  ...props
}: { name: string | null | undefined } & LucideProps) {
  const Icon = (name && iconMap[name]) || fallbackIcon
  return <Icon {...props} />
}
