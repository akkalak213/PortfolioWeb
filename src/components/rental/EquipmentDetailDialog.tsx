'use client'

import { Check, Plus, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { EquipmentCardData } from './EquipmentCard'

/**
 * รายละเอียดอุปกรณ์แบบเต็ม
 *
 * ใช้ <dialog> ของเบราว์เซอร์แทนการประกอบ overlay เอง เพราะได้ของที่ต้องทำถูกมาให้ครบ:
 * ปิดด้วย Esc, ขังโฟกัสไว้ในกล่อง และตัดเนื้อหาด้านหลังออกจาก accessibility tree
 *
 * เลือกทำเป็นกล่องซ้อนแทนหน้าแยก เพราะรายการที่ผู้ใช้ติ๊กไว้เพื่อขอใบเสนอราคา
 * อยู่ใน state ของหน้าแคตตาล็อก ถ้าเด้งไปหน้าอื่นแล้วกดย้อนกลับ ของที่เลือกไว้จะหายหมด
 */
export function EquipmentDetailDialog({
  item,
  isSelected,
  onToggle,
  onRequestQuote,
  onClose,
}: {
  item: EquipmentCardData | null
  isSelected: boolean
  onToggle: (id: string) => void
  onRequestQuote: (id: string) => void
  onClose: () => void
}) {
  const t = useTranslations('rental')
  const tc = useTranslations('common')
  const dialogRef = useRef<HTMLDialogElement>(null)

  /**
   * รูปที่กำลังดูผูกกับ id ของอุปกรณ์ไว้ด้วย
   * เก็บแค่ URL อย่างเดียวไม่พอ เพราะพอสลับไปดูชิ้นอื่นแล้วรูปที่ค้างอยู่จะตามไปด้วย
   * (ผูกไว้แบบนี้แล้วไม่ต้องมี effect คอยล้างค่า ซึ่งจะทำให้เรนเดอร์สองรอบโดยเปล่าประโยชน์)
   */
  const [activeImage, setActiveImage] = useState<{ itemId: string; url: string } | null>(null)

  const images = item
    ? [item.image, ...item.gallery].filter((url): url is string => Boolean(url))
    : []
  const shown =
    activeImage && activeImage.itemId === item?.id && images.includes(activeImage.url)
      ? activeImage.url
      : (images[0] ?? null)

  // เปิด/ปิดกล่องต้องสั่งผ่าน DOM API — <dialog> ไม่ได้ผูกกับ prop ตัวไหนของ React
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (item && !dialog.open) dialog.showModal()
    if (!item && dialog.open) dialog.close()
  }, [item])

  // กล่องซ้อนเปิดอยู่แล้วหน้าด้านหลังยังเลื่อนตามนิ้วได้ ต้องล็อกไว้เอง
  useEffect(() => {
    if (!item) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [item])

  if (!item) return null

  const isAvailable = item.status === 'AVAILABLE'

  const priceRows = [
    item.dailyRateLabel && { label: t('perDay'), value: item.dailyRateLabel, lead: true },
    item.weeklyRateLabel && { label: t('perWeek'), value: item.weeklyRateLabel, lead: false },
    item.depositLabel && { label: t('deposit'), value: item.depositLabel, lead: false },
  ].filter(Boolean) as { label: string; value: string; lead: boolean }[]

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="equipment-detail-title"
      onClose={onClose}
      // คลิกนอกกล่องคือปิด — event.target เป็นตัว dialog เองเฉพาะตอนที่โดน backdrop เท่านั้น
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
      className={cn(
        'w-[min(56rem,calc(100vw-2rem))] rounded-lg border border-border bg-surface p-0 text-foreground',
        'max-h-[min(46rem,calc(100dvh-2rem))] overflow-hidden shadow-lift',
        'backdrop:bg-black/50 backdrop:backdrop-blur-sm',
      )}
    >
      <div className="flex max-h-[inherit] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{item.brand}</p>
            <h2 id="equipment-detail-title" className="mt-1 font-display text-2xl text-balance">
              {item.model}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">{item.name}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={18} strokeWidth={1.75} aria-hidden />
            <span className="sr-only">{tc('close')}</span>
          </button>
        </header>

        <div className="grid flex-1 gap-8 overflow-y-auto px-6 py-6 md:grid-cols-2">
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-subtle">
              {shown && (
                <Image
                  src={shown}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 26rem, calc(100vw - 4rem)"
                  className="object-cover"
                />
              )}
              <span
                className={cn(
                  'absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium',
                  isAvailable
                    ? 'bg-success/15 text-success'
                    : 'bg-background/90 text-muted-foreground',
                )}
              >
                {t(`status.${item.status}`)}
              </span>
            </div>

            {images.length > 1 && (
              <>
                <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t('gallery')}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {images.map((url, index) => (
                    <li key={`${url}-${index}`}>
                      <button
                        type="button"
                        onClick={() => setActiveImage({ itemId: item.id, url })}
                        aria-current={url === shown ? 'true' : undefined}
                        className={cn(
                          'relative block h-14 w-20 overflow-hidden rounded-md border bg-subtle transition-colors',
                          url === shown
                            ? 'border-accent'
                            : 'border-border hover:border-foreground/25',
                        )}
                      >
                        <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                        <span className="sr-only">{index + 1}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="space-y-6">
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              {item.description || t('noDescription')}
            </p>

            {item.specs.length > 0 && (
              <div>
                <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t('specs')}
                </p>
                <dl className="divide-y divide-border rounded-md border border-border">
                  {/* หัวข้อสเปกมาจากที่แอดมินพิมพ์เอง ซ้ำกันได้ จึงยึดลำดับเป็น key */}
                  {item.specs.map((spec, index) => (
                    <div
                      key={index}
                      className="flex justify-between gap-4 px-3.5 py-2.5 text-sm"
                    >
                      <dt className="text-muted-foreground">{spec.label}</dt>
                      <dd className="text-right font-medium text-pretty">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div>
              {priceRows.length > 0 ? (
                <dl className="space-y-2">
                  {priceRows.map((row) => (
                    <div key={row.label} className="flex items-baseline justify-between gap-4">
                      <dt className="text-sm text-muted-foreground">{row.label}</dt>
                      <dd
                        className={cn(
                          'tabular',
                          row.lead ? 'font-display text-2xl' : 'text-sm font-medium',
                        )}
                      >
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">{t('askForPrice')}</p>
              )}

              <p className="mt-3 text-xs text-muted-foreground">
                {t('quantity', { count: item.quantity })}
              </p>
            </div>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(item.id)}
            aria-pressed={isSelected}
          >
            {isSelected ? <Check size={15} strokeWidth={2.5} /> : <Plus size={15} strokeWidth={2} />}
            {isSelected ? t('selected') : t('select')}
          </Button>
          <Button variant="accent" size="sm" onClick={() => onRequestQuote(item.id)}>
            {t('requestThis')}
          </Button>
        </footer>
      </div>
    </dialog>
  )
}
