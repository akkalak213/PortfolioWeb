import { clientEnv } from './env'

/**
 * ลิงก์รูปพรีวิวที่สร้างอัตโนมัติ
 *
 * ใช้กับหน้าที่ไม่มีรูปจริงของตัวเอง (หน้าแรก บริการ รีวิว ติดต่อ)
 * ส่วนหน้าผลงานและบทความใช้รูปปกจริงดีกว่า เพราะสื่อสารได้ตรงกว่าการ์ดตัวหนังสือ
 */
export function ogImageUrl(title: string, eyebrow?: string): string {
  const params = new URLSearchParams({ title })
  if (eyebrow) params.set('eyebrow', eyebrow)

  return `${clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/api/og?${params.toString()}`
}
