import {
  Aperture,
  Camera,
  Clapperboard,
  Globe,
  LayoutDashboard,
  Smartphone,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'

/**
 * ฐานข้อมูลเก็บชื่อไอคอนเป็นข้อความ แต่ bundle ต้องรู้ตั้งแต่ build ว่าจะรวมไอคอนไหนบ้าง
 * จึงต้องจับคู่แบบตายตัวไว้ที่นี่ ไม่ใช่ import แบบไดนามิก
 */
const iconMap: Record<string, LucideIcon> = {
  Globe,
  LayoutDashboard,
  Smartphone,
  Camera,
  Clapperboard,
  Warehouse,
  Aperture,
}

export function getIcon(name: string | null | undefined): LucideIcon {
  return (name && iconMap[name]) || Aperture
}
