import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'

/**
 * รูปพรีวิวตอนแชร์ลิงก์ลง LINE, Facebook และ X
 *
 * ImageResponse ไม่มีฟอนต์ไทยติดมาด้วย ถ้าไม่โหลดเองข้อความไทยจะกลายเป็นกล่องสี่เหลี่ยม
 * จึงต้องดึงไฟล์ฟอนต์จาก Google Fonts มาใส่ตอนสร้างภาพ แล้วแคชไว้ในหน่วยความจำของ process
 */

const FONT_URL =
  'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-thai@latest/thai-600-normal.ttf'

let fontCache: ArrayBuffer | null = null

async function loadThaiFont(): Promise<ArrayBuffer | null> {
  if (fontCache) return fontCache

  try {
    const response = await fetch(FONT_URL, { cache: 'force-cache' })
    if (!response.ok) return null

    fontCache = await response.arrayBuffer()
    return fontCache
  } catch {
    // โหลดฟอนต์ไม่ได้ก็ยังสร้างภาพต่อได้ แค่ตัวไทยจะเพี้ยน — ดีกว่าไม่มีภาพเลย
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const title = (searchParams.get('title') ?? 'Alexan Production').slice(0, 110)
  const eyebrow = (searchParams.get('eyebrow') ?? 'โปรดักชันเฮาส์ครบวงจร').slice(0, 60)

  const font = await loadThaiFont()

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0C0C0E',
          padding: '72px',
          fontFamily: 'Noto Sans Thai',
        }}
      >
        {/* แสงนวลมุมขวาบน ให้อารมณ์เดียวกับ hero ของเว็บ */}
        <div
          style={{
            position: 'absolute',
            top: -260,
            right: -160,
            width: 700,
            height: 700,
            borderRadius: 9999,
            background: 'radial-gradient(circle, rgba(240,168,104,0.22) 0%, rgba(12,12,14,0) 70%)',
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 10, height: 10, borderRadius: 9999, background: '#F0A868' }} />
          <span style={{ color: '#F0A868', fontSize: 22, letterSpacing: 2 }}>{eyebrow}</span>
        </div>

        <div
          style={{
            display: 'flex',
            color: '#F5F3EE',
            fontSize: title.length > 60 ? 58 : 74,
            lineHeight: 1.18,
            letterSpacing: -1,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #26262B',
            paddingTop: 28,
          }}
        >
          <span style={{ color: '#F5F3EE', fontSize: 30 }}>Alexan Production</span>
          <span style={{ color: '#8A8880', fontSize: 22 }}>
            เว็บไซต์ · แอป · ภาพ · วิดีโอ
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(font
        ? { fonts: [{ name: 'Noto Sans Thai', data: font, style: 'normal', weight: 600 }] }
        : {}),
    },
  )
}
