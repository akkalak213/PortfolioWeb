'use client'

import { Play } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { videoEmbedUrl, type VideoSource } from '@/lib/format'

type Props = {
  source: NonNullable<VideoSource>
  /** ภาพปกที่แอดมินตั้งเอง ถ้าไม่มีจะใช้ thumbnail ของ YouTube */
  poster: string | null
  title: string
  playLabel: string
}

/**
 * โหลด iframe ต่อเมื่อผู้ใช้กดเล่นเท่านั้น
 * iframe ของ YouTube ลากสคริปต์มาหลายร้อย KB — หน้าที่มีวิดีโอหลายตัวจะช้ามากถ้าฝังตรง ๆ
 */
export function VideoEmbed({ source, poster, title, playLabel }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (isPlaying) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-black">
        <iframe
          src={`${videoEmbedUrl(source)}${videoEmbedUrl(source).includes('?') ? '&' : '?'}autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setIsPlaying(true)}
      aria-label={`${playLabel}: ${title}`}
      className="group relative block aspect-video w-full overflow-hidden rounded-lg border border-border bg-subtle"
    >
      {poster && (
        <Image
          src={poster}
          alt=""
          fill
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lift transition-transform duration-200 ease-out group-hover:scale-110">
          <Play size={22} strokeWidth={1.75} className="ml-0.5 fill-current" aria-hidden />
        </span>
      </span>
    </button>
  )
}
