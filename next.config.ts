import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

/**
 * ดึงเฉพาะชื่อโฮสต์จาก R2_PUBLIC_URL
 * รับได้ทั้งแบบมีและไม่มี https:// นำหน้า และไม่ทำให้ build ล้มถ้าค่าผิดรูป
 */
function hostnameOf(value: string | undefined): string | null {
  if (!value?.trim()) return null
  const withProtocol = /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`

  try {
    return new URL(withProtocol).hostname
  } catch {
    console.warn(`[next.config] R2_PUBLIC_URL ไม่ถูกรูปแบบ จึงข้ามไป: ${value}`)
    return null
  }
}

const r2Host = hostnameOf(process.env.R2_PUBLIC_URL)

const nextConfig: NextConfig = {
  // Railway รันเป็น container — standalone ตัดขนาด image ลงเหลือเฉพาะไฟล์ที่ใช้จริง
  // ปิดบน Windows เพราะ chunk บางไฟล์มี ':' ในชื่อ (node:buffer) ซึ่งเป็นอักขระต้องห้ามของ NTFS
  // ทำให้ขั้นตอน copy ของ standalone ล้มเหลว — บน Linux ใน Docker ไม่มีปัญหานี้
  output: process.platform === 'win32' ? undefined : 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // ปลายทางจริงของรูปทั้งหมดหลังขึ้น production
      ...(r2Host ? [{ protocol: 'https' as const, hostname: r2Host }] : []),
      // placeholder ที่ seed ใช้ — ลบออกได้เมื่อเปลี่ยนเป็นรูปงานจริงครบแล้ว
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
      // thumbnail ของ YouTube สำหรับผลงานวิดีโอ
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'i.vimeocdn.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

const withNextIntl = createNextIntlPlugin()

export default withNextIntl(nextConfig)
