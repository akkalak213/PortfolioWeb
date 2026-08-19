'use client'

import { FileText, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { Button, buttonClasses } from '@/components/ui/Button'
import { LeadForm } from '@/components/forms/LeadForm'
import { scrollIntoViewSoftly } from '@/lib/scroll'
import { EquipmentCard, type EquipmentCardData } from './EquipmentCard'
import { EquipmentDetailDialog } from './EquipmentDetailDialog'

export function RentalCatalog({ items }: { items: EquipmentCardData[] }) {
  const t = useTranslations('rental')
  const tEstimate = useTranslations('estimate')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const toggle = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    )

  const selected = items.filter((item) => selectedIds.includes(item.id))
  const openItem = items.find((item) => item.id === openId) ?? null

  /**
   * ฟอร์มโผล่ต่อท้ายรายการอุปกรณ์ซึ่งมักยาวเกินหนึ่งหน้าจอ
   * ถ้าไม่พาสายตาลงไปเอง ลูกค้าจะกดปุ่มแล้วเห็นหน้าจอนิ่งสนิท เหมือนกดไม่ติด
   */
  useEffect(() => {
    if (isFormOpen) scrollIntoViewSoftly(formRef.current)
  }, [isFormOpen])

  /** กดขอใบเสนอราคาจากในกล่องรายละเอียด — ติ๊กชิ้นนั้นให้ ปิดกล่อง แล้วพาลงไปที่ฟอร์ม */
  const requestQuoteFor = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current : [...current, id]))
    setOpenId(null)
    setIsFormOpen(true)
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border py-20 text-center text-sm text-muted-foreground">
        {t('empty')}
      </p>
    )
  }

  return (
    <>
      <ul className="reveal-stagger grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <EquipmentCard
              item={item}
              isSelected={selectedIds.includes(item.id)}
              onToggle={toggle}
              onOpen={setOpenId}
            />
          </li>
        ))}
      </ul>

      <EquipmentDetailDialog
        item={openItem}
        isSelected={openItem ? selectedIds.includes(openItem.id) : false}
        onToggle={toggle}
        onRequestQuote={requestQuoteFor}
        onClose={() => setOpenId(null)}
      />

      {/*
        แถบสรุปลอยด้านล่าง โผล่เมื่อเลือกอุปกรณ์แล้ว
        วางไว้ล่างเพราะบนมือถือนิ้วโป้งเอื้อมถึงง่ายกว่าปุ่มด้านบน
      */}
      {selected.length > 0 && !isFormOpen && (
        <div className="sticky bottom-4 z-30 mt-10 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface/95 p-4 shadow-lift backdrop-blur-md">
          <p className="text-sm" aria-live="polite">
            {t('selectedCount', { count: selected.length })}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
              {t('clearSelection')}
            </Button>
            {/*
              ใบเสนอราคาเบื้องต้นเป็นลิงก์ ไม่ใช่ปุ่มที่ต้องรอ JavaScript
              ส่งไปแค่ id แล้วให้หน้าปลายทางอ่านเรตจากฐานข้อมูลเอง ราคาจึงเป็นค่าจริงเสมอ
            */}
            <Link
              href={{
                pathname: '/rental/estimate',
                query: { items: selectedIds.join(','), days: 1 },
              }}
              className={buttonClasses('outline', 'sm')}
            >
              <FileText size={14} strokeWidth={1.75} aria-hidden />
              {tEstimate('estimateCta')}
            </Link>
            <Button variant="accent" size="sm" onClick={() => setIsFormOpen(true)}>
              {t('requestSelected')}
            </Button>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div
          ref={formRef}
          className="mt-12 scroll-mt-24 rounded-lg border border-border bg-surface p-7 md:p-9"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {t('selectedCount', { count: selected.length })}
            </p>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X size={18} strokeWidth={1.75} aria-hidden />
              <span className="sr-only">{t('clearSelection')}</span>
            </button>
          </div>

          <LeadForm
            source="RENTAL"
            showServicePicker={false}
            equipmentIds={selected.map((item) => item.id)}
            equipmentLabels={selected.map((item) => `${item.brand} ${item.model}`)}
          />
        </div>
      )}
    </>
  )
}
