import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminPageHeader, StatusPill } from '@/components/admin/AdminPage'
import { getAdminServices } from '@/server/admin-queries'

export const metadata: Metadata = { title: 'บริการ' }

export default async function AdminServicesPage() {
  const services = await getAdminServices()

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="บริการ"
        description="หกบริการหลักเป็นโครงตายตัวของเว็บ แก้เนื้อหาและราคาได้ แต่เพิ่มหรือลบไม่ได้จากหน้านี้"
      />

      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
        {services.map((service) => (
          <li key={service.id}>
            <Link
              href={`/admin/services/${service.id}`}
              className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{service.titleTh}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {service.taglineTh}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                <span>{service._count.packages} แพ็กเกจ</span>
                <span>{service._count.projects} ผลงาน</span>
                {!service.isActive && <StatusPill>ซ่อนอยู่</StatusPill>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
