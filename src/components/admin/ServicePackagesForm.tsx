'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useActionState, useState } from 'react'
import { PriceUnit } from '@/generated/prisma/enums'
import { SubmitButton } from '@/components/admin/AdminUI'
import { FormMessage, Input, Select, Textarea } from '@/components/ui/Form'
import { priceUnitLabels } from '@/lib/admin-labels'
import { initialAdminState } from '@/server/admin-state'
import { saveServicePackages } from '@/server/cms-actions'

export type PackageRow = {
  nameTh: string
  nameEn: string
  price: string
  unit: PriceUnit
  includesTh: string
  includesEn: string
  isPopular: boolean
}

const blankRow: PackageRow = {
  nameTh: '',
  nameEn: '',
  price: '',
  unit: 'PROJECT',
  includesTh: '',
  includesEn: '',
  isPopular: false,
}

export function ServicePackagesForm({
  serviceId,
  slug,
  initial,
}: {
  serviceId: string
  slug: string
  initial: PackageRow[]
}) {
  const [state, formAction] = useActionState(saveServicePackages, initialAdminState)
  const [rows, setRows] = useState<PackageRow[]>(initial.length ? initial : [blankRow])
  const [popular, setPopular] = useState(() => {
    const index = initial.findIndex((row) => row.isPopular)
    return index >= 0 ? String(index) : ''
  })

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="pkgPopular" value={popular} />

      <div className="space-y-5">
        {rows.map((row, index) => (
          <div key={index} className="rounded-lg border border-border p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">แพ็กเกจที่ {index + 1}</p>
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-xs">
                  <input
                    type="radio"
                    name="popularPicker"
                    checked={popular === String(index)}
                    onChange={() => setPopular(String(index))}
                    className="accent-[hsl(var(--accent))]"
                  />
                  เลือกมากที่สุด
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRows((r) => r.filter((_, i) => i !== index))
                    if (popular === String(index)) setPopular('')
                  }}
                  aria-label={`ลบแพ็กเกจที่ ${index + 1}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                >
                  <Trash2 size={15} strokeWidth={1.75} />
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">ชื่อแพ็กเกจ (ไทย)</label>
                <Input name="pkgNameTh" defaultValue={row.nameTh} placeholder="เต็มวัน" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Package name (EN)</label>
                <Input name="pkgNameEn" defaultValue={row.nameEn} placeholder="Full Day" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">ราคาเริ่มต้น (บาท)</label>
                <Input name="pkgPrice" inputMode="numeric" defaultValue={row.price} placeholder="15000" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">หน่วย</label>
                <Select name="pkgUnit" defaultValue={row.unit}>
                  {Object.values(PriceUnit).map((unit) => (
                    <option key={unit} value={unit}>
                      {priceUnitLabels[unit]}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">
                  สิ่งที่ได้รับ (ไทย) — บรรทัดละหนึ่งข้อ
                </label>
                <Textarea
                  name="pkgIncludesTh"
                  defaultValue={row.includesTh}
                  className="min-h-28 text-xs"
                  placeholder={'ถ่าย 8 ชั่วโมง\nภาพรีทัช 35–50 รูป'}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">What you get (EN) — one per line</label>
                <Textarea
                  name="pkgIncludesEn"
                  defaultValue={row.includesEn}
                  className="min-h-28 text-xs"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows((r) => [...r, blankRow])}
        className="inline-flex items-center gap-1.5 text-sm text-accent transition-opacity hover:opacity-80"
      >
        <Plus size={15} strokeWidth={2} />
        เพิ่มแพ็กเกจ
      </button>

      {state.message && (
        <FormMessage status={state.status === 'error' ? 'error' : 'success'}>
          {state.message}
        </FormMessage>
      )}

      <p className="text-xs text-muted-foreground">
        กดบันทึกแล้วแพ็กเกจเดิมทั้งหมดจะถูกแทนที่ด้วยรายการที่เห็นบนหน้านี้
      </p>
      <SubmitButton>บันทึกแพ็กเกจ</SubmitButton>
    </form>
  )
}
