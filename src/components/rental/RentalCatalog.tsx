'use client'

import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { LeadForm } from '@/components/forms/LeadForm'
import { EquipmentCard, type EquipmentCardData } from './EquipmentCard'

export function RentalCatalog({ items }: { items: EquipmentCardData[] }) {
  const t = useTranslations('rental')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)

  const toggle = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    )

  const selected = items.filter((item) => selectedIds.includes(item.id))

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border py-20 text-center text-sm text-muted-foreground">
        {t('empty')}
      </p>
    )
  }

  return (
    <>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <EquipmentCard
              item={item}
              isSelected={selectedIds.includes(item.id)}
              onToggle={toggle}
            />
          </li>
        ))}
      </ul>

      {/*
        แถบสรุปลอยด้านล่าง โผล่เมื่อเลือกอุปกรณ์แล้ว
        วางไว้ล่างเพราะบนมือถือนิ้วโป้งเอื้อมถึงง่ายกว่าปุ่มด้านบน
      */}
      {selected.length > 0 && !isFormOpen && (
        <div className="sticky bottom-4 z-30 mt-10 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface/95 p-4 shadow-lift backdrop-blur-md">
          <p className="text-sm" aria-live="polite">
            {t('selectedCount', { count: selected.length })}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
              {t('clearSelection')}
            </Button>
            <Button variant="accent" size="sm" onClick={() => setIsFormOpen(true)}>
              {t('requestSelected')}
            </Button>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="mt-12 rounded-lg border border-border bg-surface p-7 md:p-9">
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
