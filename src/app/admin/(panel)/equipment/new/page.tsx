import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/AdminPage'
import { emptyEquipment, EquipmentForm } from '@/components/admin/EquipmentForm'

export const metadata: Metadata = { title: 'เพิ่มอุปกรณ์' }

export default function NewEquipmentPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader title="เพิ่มอุปกรณ์" />
      <EquipmentForm item={emptyEquipment} />
    </div>
  )
}
