'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url)
          setCopied(true)
          setTimeout(() => setCopied(false), 1800)
        } catch {
          // เบราว์เซอร์บล็อกคลิปบอร์ด (มักเกิดตอนไม่ใช่ https) — ปล่อยให้ผู้ใช้ก๊อปเองจากช่องข้อความ
        }
      }}
      aria-label={copied ? 'คัดลอกแล้ว' : 'คัดลอก URL'}
      className="inline-flex h-7 w-7 items-center justify-center rounded bg-white/90 text-black"
    >
      {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2} />}
    </button>
  )
}
