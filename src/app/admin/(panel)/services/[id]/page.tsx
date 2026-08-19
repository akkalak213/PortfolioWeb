import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdminCard, AdminPageHeader } from '@/components/admin/AdminPage'
import { ServiceForm } from '@/components/admin/ServiceForm'
import { ServicePackagesForm } from '@/components/admin/ServicePackagesForm'
import { toNumber } from '@/lib/format'
import { getAdminService } from '@/server/admin-queries'
import { listSignature, toPairRows, versionOf } from '@/server/cms-helpers'

export const metadata: Metadata = { title: 'แก้ไขบริการ' }

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = await getAdminService(id)
  if (!service) notFound()

  // แพ็กเกจถูกลบแล้วสร้างใหม่ทุกครั้งที่บันทึก id ยกชุดจึงใช้เป็นเลขเวอร์ชันของรายการได้
  const packagesVersion = listSignature(service.packages.map((pkg) => pkg.id))

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <AdminPageHeader
        title={service.titleTh}
        description={`อยู่ที่ /services/${service.slug}`}
      />

      <ServiceForm
        service={{
          id: service.id,
          version: versionOf(service.updatedAt),
          slug: service.slug,
          icon: service.icon,
          coverImage: service.coverImage ?? '',
          titleTh: service.titleTh,
          titleEn: service.titleEn,
          taglineTh: service.taglineTh,
          taglineEn: service.taglineEn,
          descriptionTh: service.descriptionTh,
          descriptionEn: service.descriptionEn,
          highlightsTh: service.highlightsTh,
          highlightsEn: service.highlightsEn,
          processTh: toPairRows(service.processTh, 'title', 'detail'),
          processEn: toPairRows(service.processEn, 'title', 'detail'),
          faqTh: toPairRows(service.faqTh, 'question', 'answer'),
          faqEn: toPairRows(service.faqEn, 'question', 'answer'),
          isActive: service.isActive,
          order: String(service.order),
        }}
      />

      <AdminCard
        title="แพ็กเกจและราคา"
        description="ราคาที่แสดงบนหน้าบริการ ระบบจะเติมคำว่า “เริ่มต้น” ให้อัตโนมัติ"
      >
        <ServicePackagesForm
          serviceId={service.id}
          version={packagesVersion}
          initial={service.packages.map((pkg) => ({
            nameTh: pkg.nameTh,
            nameEn: pkg.nameEn,
            price: toNumber(pkg.priceFrom) === null ? '' : String(toNumber(pkg.priceFrom)),
            unit: pkg.priceUnit,
            includesTh: pkg.includesTh.join('\n'),
            includesEn: pkg.includesEn.join('\n'),
            isPopular: pkg.isPopular,
          }))}
        />
      </AdminCard>
    </div>
  )
}
