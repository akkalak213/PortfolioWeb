import type { MetadataRoute } from 'next'
import { clientEnv } from '@/lib/env'

const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // ปิดเฉพาะหลังบ้านและ endpoint ของระบบ
        // ไม่ปิด /api ทั้งก้อน เพราะ /api/og คือรูปพรีวิวที่ต้องให้ crawler ดึงได้
        disallow: ['/admin', '/api/auth', '/api/health'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
