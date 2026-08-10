'use client'

import { Loader2, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { uploadImage } from '@/lib/upload-client'

export function MediaUploader() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(0)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return

    setUploading(true)
    setError(null)
    setDone(0)

    for (const file of Array.from(files)) {
      const result = await uploadImage(file, 'uploads')
      if (result.ok) setDone((count) => count + 1)
      else setError(result.error)
    }

    setUploading(false)
    // ดึงรายการใหม่จากเซิร์ฟเวอร์เพื่อให้ไฟล์ที่เพิ่งอัปโหลดโผล่ในคลังทันที
    router.refresh()
  }

  return (
    <div className="rounded-lg border border-dashed border-border bg-surface p-6 text-center">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          handleFiles(event.target.files)
          event.target.value = ''
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isUploading ? (
          <Loader2 size={15} className="animate-spin" aria-hidden />
        ) : (
          <Upload size={15} strokeWidth={1.75} aria-hidden />
        )}
        {isUploading ? `กำลังอัปโหลด (${done} ไฟล์แล้ว)` : 'อัปโหลดไฟล์'}
      </button>

      <p className="mt-3 text-xs text-muted-foreground">
        เลือกได้หลายไฟล์พร้อมกัน · รองรับ JPG PNG WebP AVIF GIF · ไม่เกิน 15MB ต่อไฟล์
      </p>

      {error && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
