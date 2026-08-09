'use client'

import { Check, Plus } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { EquipmentCategory, EquipmentStatus } from '@/generated/prisma/enums'
import { cn } from '@/lib/utils'

export type EquipmentCardData = {
  id: string
  slug: string
  category: EquipmentCategory
  brand: string
  model: string
  name: string
  description: string | null
  specs: { label: string; value: string }[]
  /** จัดรูปแบบสกุลเงินมาจากฝั่งเซิร์ฟเวอร์แล้ว เพื่อไม่ให้ Decimal ของ Prisma หลุดมาถึง client */
  dailyRateLabel: string | null
  depositLabel: string | null
  image: string | null
  quantity: number
  status: EquipmentStatus
}

type Props = {
  item: EquipmentCardData
  isSelected: boolean
  onToggle: (id: string) => void
}

export function EquipmentCard({ item, isSelected, onToggle }: Props) {
  const t = useTranslations('rental')
  const isAvailable = item.status === 'AVAILABLE'

  return (
    <article
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-lg border bg-surface transition-colors',
        isSelected ? 'border-accent' : 'border-border',
      )}
    >
      <div className="relative aspect-[4/3] bg-subtle">
        {item.image && (
          <Image
            src={item.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        )}
        {!isAvailable && (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {t(`status.${item.status}`)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{item.brand}</p>
        <h3 className="mt-1 font-display text-xl text-balance">{item.model}</h3>

        {item.specs.length > 0 && (
          <dl className="mt-4 space-y-1.5 text-xs">
            {item.specs.slice(0, 3).map((spec) => (
              <div key={spec.label} className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{spec.label}</dt>
                <dd className="text-right font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-border pt-4">
          <div>
            {item.dailyRateLabel ? (
              <p className="tabular font-display text-xl">
                {item.dailyRateLabel}
                <span className="ml-1 font-sans text-xs text-muted-foreground">{t('perDay')}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
            {item.depositLabel && (
              <p className="tabular mt-0.5 text-xs text-muted-foreground">
                {t('deposit')} {item.depositLabel}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggle(item.id)}
            aria-pressed={isSelected}
            className={cn(
              'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors',
              isSelected
                ? 'bg-accent text-accent-foreground'
                : 'border border-input text-foreground hover:border-foreground/25 hover:bg-muted',
            )}
          >
            {isSelected ? <Check size={14} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2} />}
            {isSelected ? t('selected') : t('select')}
          </button>
        </div>
      </div>
    </article>
  )
}
