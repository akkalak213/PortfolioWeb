'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { QuoteStatus } from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import { computeQuoteTotals, lineAmount } from '@/lib/quote-math'
import type { AdminActionState } from './admin-state'
import { integer, number, optionalText, requireEditor, text } from './cms-helpers'

/** QT-2608-0007 — เดือนปีแล้วตามด้วยลำดับในเดือนนั้น เหมือนรหัส lead */
async function generateQuoteNumber(): Promise<string> {
  const now = new Date()
  const prefix = `QT-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const count = await db.quote.count({ where: { createdAt: { gte: startOfMonth } } })

  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = `${prefix}-${String(count + 1 + attempt).padStart(4, '0')}`
    const exists = await db.quote.findUnique({
      where: { quoteNumber: candidate },
      select: { id: true },
    })
    if (!exists) return candidate
  }

  return `${prefix}-${Date.now().toString().slice(-6)}`
}

/** อ่านรายการสินค้าจาก input ชื่อซ้ำหลายชุด แล้วทิ้งแถวที่ไม่ได้กรอกรายละเอียด */
function readLines(formData: FormData) {
  const descriptions = formData.getAll('itemDescription').map((v) => String(v).trim())
  const quantities = formData.getAll('itemQuantity').map((v) => Number(String(v)) || 0)
  const units = formData.getAll('itemUnit').map((v) => String(v).trim())
  const unitPrices = formData
    .getAll('itemUnitPrice')
    .map((v) => Number(String(v).replace(/,/g, '')) || 0)

  return descriptions
    .map((description, index) => ({
      description,
      quantity: quantities[index] ?? 1,
      unit: units[index] || null,
      unitPrice: unitPrices[index] ?? 0,
      order: index,
    }))
    .filter((line) => line.description)
}

export async function saveQuote(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const user = await requireEditor()

  const id = optionalText(formData, 'id')
  const customerName = text(formData, 'customerName')
  if (!customerName) return { status: 'error', message: 'ต้องกรอกชื่อลูกค้า' }

  const lines = readLines(formData)
  if (lines.length === 0) return { status: 'error', message: 'ต้องมีรายการอย่างน้อยหนึ่งรายการ' }

  const vatRate = number(formData, 'vatRate') ?? 7
  const withholdingRate = number(formData, 'withholdingRate') ?? 0
  const discount = number(formData, 'discount') ?? 0

  const totals = computeQuoteTotals({ lines, discount, vatRate, withholdingRate })

  const validUntilRaw = text(formData, 'validUntil')
  const validUntil = validUntilRaw
    ? new Date(validUntilRaw)
    : new Date(Date.now() + integer(formData, 'validDays', 30) * 86_400_000)

  const data = {
    leadId: optionalText(formData, 'leadId'),
    customerName,
    customerCompany: optionalText(formData, 'customerCompany'),
    customerAddress: optionalText(formData, 'customerAddress'),
    customerTaxId: optionalText(formData, 'customerTaxId'),
    customerEmail: text(formData, 'customerEmail'),
    customerPhone: optionalText(formData, 'customerPhone'),
    locale: text(formData, 'locale') === 'en' ? 'en' : 'th',
    validUntil,
    subtotal: totals.subtotal,
    discount: totals.discount,
    vatRate,
    vatAmount: totals.vatAmount,
    withholdingRate,
    withholdingAmount: totals.withholdingAmount,
    total: totals.total,
    notes: optionalText(formData, 'notes'),
    termsText: optionalText(formData, 'termsText'),
    status: text(formData, 'status') as QuoteStatus,
  }

  try {
    if (id) {
      await db.quote.update({ where: { id }, data })
      // รายการสินค้าแทนที่ทั้งชุด ตรงกับที่ผู้ใช้เห็นในฟอร์ม
      await db.quoteItem.deleteMany({ where: { quoteId: id } })
      await db.quoteItem.createMany({
        data: lines.map((line) => ({ ...line, quoteId: id, amount: lineAmount(line) })),
      })

      revalidatePath('/admin/quotes')
      revalidatePath(`/admin/quotes/${id}`)
      return { status: 'success', message: 'บันทึกใบเสนอราคาแล้ว' }
    }

    const created = await db.quote.create({
      data: {
        ...data,
        quoteNumber: await generateQuoteNumber(),
        createdById: user.id,
        items: {
          create: lines.map((line) => ({ ...line, amount: lineAmount(line) })),
        },
      },
    })

    // ออกใบเสนอราคาให้ lead แล้ว ควรเลื่อนสถานะให้อัตโนมัติ ทีมจะได้ไม่ลืมอัปเดต
    if (data.leadId) {
      await db.lead.update({
        where: { id: data.leadId },
        data: { status: 'QUOTED' },
      })
      revalidatePath(`/admin/leads/${data.leadId}`)
    }

    revalidatePath('/admin/quotes')
    revalidatePath('/admin')
    redirect(`/admin/quotes/${created.id}`)
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'digest' in error) throw error
    console.error('[quote:save]', error)
    return { status: 'error', message: 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง' }
  }

  return { status: 'success' }
}

export async function updateQuoteStatus(formData: FormData) {
  await requireEditor()

  const id = text(formData, 'id')
  const status = text(formData, 'status') as QuoteStatus

  try {
    await db.quote.update({
      where: { id },
      data: {
        status,
        sentAt: status === 'SENT' ? new Date() : undefined,
        acceptedAt: status === 'ACCEPTED' ? new Date() : undefined,
      },
    })
  } catch (error) {
    console.error('[quote:updateStatus]', error)
  }

  revalidatePath('/admin/quotes')
  revalidatePath(`/admin/quotes/${id}`)
  revalidatePath('/admin')
}

export async function deleteQuote(formData: FormData) {
  await requireEditor()

  try {
    await db.quote.delete({ where: { id: text(formData, 'id') } })
  } catch (error) {
    console.error('[quote:delete]', error)
  }

  revalidatePath('/admin/quotes')
  redirect('/admin/quotes')
}
