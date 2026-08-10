import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { AdminPageHeader, EmptyState, StatusPill } from '@/components/admin/AdminPage'
import { equipmentCategoryLabels, equipmentStatusLabels } from '@/lib/admin-labels'
import { formatPrice } from '@/lib/format'
import { getAdminEquipmentList } from '@/server/admin-queries'

export const metadata: Metadata = { title: 'อุปกรณ์เช่า' }

export default async function AdminEquipmentPage() {
  const items = await getAdminEquipmentList()

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        title="อุปกรณ์ให้เช่า"
        description="แคตตาล็อกบนหน้า /rental — ปิด “แสดงบนหน้าเว็บ” เพื่อซ่อนชั่วคราวโดยไม่ต้องลบ"
        action={{ href: '/admin/equipment/new', label: 'เพิ่มอุปกรณ์' }}
      />

      {items.length === 0 ? (
        <EmptyState>ยังไม่มีอุปกรณ์ในระบบ</EmptyState>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/admin/equipment/${item.id}`}
                className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-subtle">
                  {item.image && (
                    <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {item.brand} {item.model}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {equipmentCategoryLabels[item.category]} · มี {item.quantity} ชุด
                    {!item.isActive && ' · ซ่อนอยู่'}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="tabular text-sm">
                    {formatPrice(item.dailyRate, 'th') ?? '—'}
                    <span className="ml-1 text-xs text-muted-foreground">/วัน</span>
                  </span>
                  <StatusPill tone={item.status === 'AVAILABLE' ? 'success' : 'muted'}>
                    {equipmentStatusLabels[item.status]}
                  </StatusPill>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
