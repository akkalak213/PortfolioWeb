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
 * ฐานข้อมูลเก็บชื่อไอคอนเป็นข้อความ แต่ bundler ต้องรู้ตั้งแต่ build ว่าจะรวมไอคอนไหนบ้าง
 * จึงต้องจับคู่แบบตายตัวไว้ที่นี่ ไม่ใช่ import แบบไดนามิก
 *
 * ใช้ผ่าน <ServiceIcon name={...} /> ไม่ใช่หยิบ component ออกมาเองระหว่างเรนเดอร์
 */
export const iconMap: Record<string, LucideIcon> = {
  Globe,
  LayoutDashboard,
  Smartphone,
  Camera,
  Clapperboard,
  Warehouse,
  Aperture,
}

export const fallbackIcon = Aperture
