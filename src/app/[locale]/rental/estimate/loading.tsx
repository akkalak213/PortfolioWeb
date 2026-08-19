import { getTranslations } from 'next-intl/server'
import { Skeleton, SkeletonPage, SkeletonText } from '@/components/ui/Skeleton'

/**
 * โครงร่างรูปทรงกระดาษ ไม่ใช่กริดการ์ด
 *
 * ถ้าไม่มีไฟล์นี้ หน้าจะไปหยิบ loading.tsx ของ /rental มาใช้ ซึ่งเป็นสเกลเลตันของ
 * รายการอุปกรณ์สามคอลัมน์ แล้วสลับเป็นเอกสาร A4 ทันทีที่ข้อมูลมาถึง — กระตุกและสื่อผิด
 */
export default async function Loading() {
  const t = await getTranslations('common')

  return (
    <SkeletonPage label={t('loading')}>
      <div className="bg-muted/40 py-8">
        <div className="mx-auto w-[210mm] max-w-full bg-white p-[15mm] shadow-lift">
          <div className="flex items-start justify-between gap-8 border-b-2 border-neutral-200 pb-5">
            <div className="flex gap-4">
              <Skeleton className="h-[20mm] w-[20mm] rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-16 w-40" />
          </div>

          <Skeleton className="mt-6 h-14 w-full" />

          <div className="mt-8 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-full" />
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <Skeleton className="h-24 w-[85mm]" />
          </div>

          <SkeletonText lines={3} className="mt-10" />
        </div>
      </div>
    </SkeletonPage>
  )
}
