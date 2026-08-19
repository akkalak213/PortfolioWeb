'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { QuoteStatus } from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import { isMailConfigured } from '@/lib/env'
import { toNumber } from '@/lib/format'
import { sendMail } from '@/lib/mail'
import { computeQuoteTotals, lineAmount } from '@/lib/quote-math'
import { quoteEmail } from '@/lib/quote-email'
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
    const existing = await db.quote.findUnique({ where: { id }, select: { sentAt: true } })

    await db.quote.update({
      where: { id },
      data: {
        status,
        // วันที่ส่งเป็นจุดเริ่มนับกำหนดยืนราคา กดสถานะซ้ำจึงต้องไม่ขยับวันแรกที่ส่งไป
        sentAt: status === 'SENT' ? (existing?.sentAt ?? new Date()) : undefined,
        // ล้างเมื่อไม่ได้อยู่ในสถานะตอบรับแล้ว ไม่งั้นกดผิดแล้วแก้ ไทม์ไลน์จะยังโชว์ว่าลูกค้าตอบรับ
        acceptedAt: status === 'ACCEPTED' ? new Date() : null,
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

/**
 * ส่งใบเสนอราคาให้ลูกค้าทางอีเมล แล้วเลื่อนสถานะเป็น "ส่งแล้ว" ให้อัตโนมัติ
 *
 * เขียนรายการทั้งใบลงในตัวอีเมล ไม่ได้แนบ PDF และไม่ได้ส่งลิงก์ให้กดเข้ามาดู
 * เพราะลิงก์สาธารณะที่เปิดดูใบเสนอราคาได้แปลว่าตัวเลขราคาหลุดออกไปนอกการควบคุม
 * ส่วน PDF ยังออกได้จากปุ่มสั่งพิมพ์ในหน้ารายละเอียด แล้วแนบส่งเองถ้าลูกค้าขอ
 */
export async function sendQuoteToCustomer(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireEditor()

  const id = text(formData, 'id')
  if (!id) return { status: 'error', message: 'ไม่พบใบเสนอราคา' }

  if (!isMailConfigured) {
    return {
      status: 'error',
      message: 'ยังส่งอีเมลไม่ได้ — ต้องตั้งค่า RESEND_API_KEY, MAIL_FROM และ MAIL_TO ก่อน',
    }
  }

  const quote = await db.quote.findUnique({
    where: { id },
    include: { items: { orderBy: { order: 'asc' } } },
  })
  if (!quote) return { status: 'error', message: 'ไม่พบใบเสนอราคานี้ อาจถูกลบไปแล้ว' }
  if (!quote.customerEmail) {
    return { status: 'error', message: 'ใบเสนอราคานี้ยังไม่มีอีเมลลูกค้า กรอกก่อนแล้วบันทึก' }
  }

  const rows = await db.siteSetting.findMany({ where: { key: { in: ['company', 'quote'] } } })
  const settings = Object.fromEntries(rows.map((row) => [row.key, row.value])) as Record<
    string,
    Record<string, string> | undefined
  >
  const company = settings.company ?? {}
  const bank = settings.quote ?? {}
  const isEnglish = quote.locale === 'en'

  const { subject, html } = quoteEmail({
    quoteNumber: quote.quoteNumber,
    customerName: quote.customerName,
    locale: quote.locale,
    issueDate: quote.issueDate,
    validUntil: quote.validUntil,
    lines: quote.items.map((item) => ({
      description: item.description,
      quantity: toNumber(item.quantity) ?? 0,
      unit: item.unit,
      amount: toNumber(item.amount) ?? 0,
    })),
    subtotal: toNumber(quote.subtotal) ?? 0,
    discount: toNumber(quote.discount) ?? 0,
    vatRate: toNumber(quote.vatRate) ?? 0,
    vatAmount: toNumber(quote.vatAmount) ?? 0,
    withholdingRate: toNumber(quote.withholdingRate) ?? 0,
    withholdingAmount: toNumber(quote.withholdingAmount) ?? 0,
    total: toNumber(quote.total) ?? 0,
    notes: quote.notes,
    terms: quote.termsText,
    companyName:
      (isEnglish ? company.nameEn : company.legalNameTh || company.nameTh) || 'Alexan Production',
    companyPhone: company.phone ?? '',
    companyEmail: company.email ?? '',
    bankName: bank.bankName ?? '',
    bankAccountName: bank.bankAccountName ?? '',
    bankAccountNumber: bank.bankAccountNumber ?? '',
  })

  // ตอบกลับให้ไปเข้ากล่องจริงของทีม ไม่ใช่ที่อยู่ no-reply ที่ใช้ส่งออก
  const result = await sendMail(quote.customerEmail, {
    subject,
    html,
    replyTo: company.email || undefined,
  })

  if (!result.sent) {
    return { status: 'error', message: `ส่งอีเมลไม่สำเร็จ — ${result.reason}` }
  }

  try {
    await db.quote.update({
      where: { id },
      // ส่งซ้ำต้องไม่ทับเวลาที่ส่งครั้งแรก ซึ่งเป็นวันที่ใช้อ้างอิงเวลานับกำหนดยืนราคา
      data: { status: 'SENT', sentAt: quote.sentAt ?? new Date() },
    })

    if (quote.leadId) {
      await db.lead.update({ where: { id: quote.leadId }, data: { status: 'QUOTED' } })
      revalidatePath(`/admin/leads/${quote.leadId}`)
      revalidatePath('/admin/leads')
    }
  } catch (error) {
    console.error('[quote:sendToCustomer] อัปเดตสถานะไม่สำเร็จ', error)
    return {
      status: 'error',
      message: 'ส่งอีเมลออกไปแล้ว แต่อัปเดตสถานะในระบบไม่สำเร็จ กรุณาเปลี่ยนสถานะเป็น "ส่งแล้ว" เอง',
    }
  }

  revalidatePath('/admin/quotes')
  revalidatePath(`/admin/quotes/${id}`)
  revalidatePath('/admin')

  return { status: 'success', message: `ส่งใบเสนอราคาไปที่ ${quote.customerEmail} แล้ว` }
}
