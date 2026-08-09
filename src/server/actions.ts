'use server'

import type { ServiceCategory } from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import { emailShell, renderRows, sendInternalNotification } from '@/lib/mail'
import { getClientIpHash, getUserAgent, isRateLimited } from '@/lib/rate-limit'
import { leadSchema, reviewSchema } from '@/lib/validations'
import type { ActionState } from './action-state'

/** Server action ของฟอร์มสาธารณะ — ชนิดของ state อยู่ที่ ./action-state */

function flattenErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const result: Record<string, string[]> = {}
  for (const issue of issues) {
    const key = String(issue.path[0] ?? 'form')
    ;(result[key] ??= []).push(issue.message)
  }
  return result
}

// ─────────────────────────── รีวิว ───────────────────────────

export async function submitReview(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = reviewSchema.safeParse({
    authorName: formData.get('authorName') ?? '',
    authorRole: formData.get('authorRole') ?? '',
    submitterEmail: formData.get('submitterEmail') ?? '',
    content: formData.get('content') ?? '',
    rating: formData.get('rating') ?? '',
    serviceCategory: formData.get('serviceCategory') ?? '',
    website: formData.get('website') ?? '',
  })

  if (!parsed.success) {
    return {
      status: 'error',
      messageKey: 'invalid',
      fieldErrors: flattenErrors(parsed.error.issues),
    }
  }

  // บอตกรอก honeypot — ตอบว่าสำเร็จเพื่อไม่ให้รู้ว่าโดนจับได้ แต่ไม่บันทึกอะไร
  if (parsed.data.website) return { status: 'success', messageKey: 'reviewSuccess' }

  const ipHash = await getClientIpHash()
  if (await isRateLimited('review', ipHash)) {
    return { status: 'error', messageKey: 'rateLimited' }
  }

  const locale = formData.get('locale') === 'en' ? 'en' : 'th'
  const { authorName, authorRole, submitterEmail, content, rating, serviceCategory } = parsed.data

  try {
    await db.review.create({
      data: {
        authorName,
        authorRole: authorRole || null,
        submitterEmail: submitterEmail || null,
        content,
        rating,
        serviceCategory: (serviceCategory || null) as ServiceCategory | null,
        locale,
        ipHash,
        userAgent: await getUserAgent(),
        // เข้าคิวรออนุมัติเสมอ — ไม่ให้ขึ้นหน้าเว็บทันทีเพื่อกันสแปมและคำหยาบ
        status: 'PENDING',
      },
    })
  } catch (error) {
    console.error('[action:submitReview] บันทึกไม่สำเร็จ', error)
    return { status: 'error', messageKey: 'serverError' }
  }

  await sendInternalNotification({
    subject: `รีวิวใหม่รออนุมัติ · ${rating}★ จาก ${authorName}`,
    replyTo: submitterEmail || undefined,
    html: emailShell(
      'มีรีวิวใหม่รอการอนุมัติ',
      renderRows([
        ['ผู้รีวิว', authorName],
        ['ตำแหน่ง/บริษัท', authorRole],
        ['อีเมล', submitterEmail],
        ['คะแนน', `${rating} / 5`],
        ['บริการ', serviceCategory],
        ['เนื้อหา', content],
      ]),
    ),
  })

  return { status: 'success', messageKey: 'reviewSuccess' }
}

// ──────────────────── คำขอจากลูกค้า (Lead) ────────────────────

/** AX-2608-0042 — เดือนปีแล้วตามด้วยลำดับในเดือนนั้น */
async function generateRefCode(): Promise<string> {
  const now = new Date()
  const prefix = `AX-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const countThisMonth = await db.lead.count({ where: { createdAt: { gte: startOfMonth } } })

  // ถ้ามีคำขอเข้ามาพร้อมกันจนเลขชน ให้ขยับไปเลขถัดไป
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = `${prefix}-${String(countThisMonth + 1 + attempt).padStart(4, '0')}`
    const exists = await db.lead.findUnique({ where: { refCode: candidate }, select: { id: true } })
    if (!exists) return candidate
  }

  return `${prefix}-${Date.now().toString().slice(-6)}`
}

export async function submitLead(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = leadSchema.safeParse({
    name: formData.get('name') ?? '',
    email: formData.get('email') ?? '',
    phone: formData.get('phone') ?? '',
    company: formData.get('company') ?? '',
    services: formData.getAll('services').map(String).filter(Boolean),
    budgetRange: formData.get('budgetRange') ?? '',
    message: formData.get('message') ?? '',
    equipmentIds: formData.getAll('equipmentIds').map(String).filter(Boolean),
    source: formData.get('source') ?? 'CONTACT',
    website: formData.get('website') ?? '',
  })

  if (!parsed.success) {
    return {
      status: 'error',
      messageKey: 'invalid',
      fieldErrors: flattenErrors(parsed.error.issues),
    }
  }

  if (parsed.data.website) return { status: 'success', messageKey: 'leadSuccess' }

  const ipHash = await getClientIpHash()
  if (await isRateLimited('lead', ipHash)) {
    return { status: 'error', messageKey: 'rateLimited' }
  }

  const locale = formData.get('locale') === 'en' ? 'en' : 'th'
  const { name, email, phone, company, services, budgetRange, message, equipmentIds, source } =
    parsed.data

  let refCode: string
  try {
    refCode = await generateRefCode()

    // เก็บชื่ออุปกรณ์ ณ เวลาที่ขอไว้ด้วย เผื่ออุปกรณ์ถูกลบหรือเปลี่ยนชื่อภายหลัง
    const equipment = equipmentIds.length
      ? await db.equipment.findMany({
          where: { id: { in: equipmentIds } },
          select: { id: true, brand: true, model: true, nameTh: true },
        })
      : []

    await db.lead.create({
      data: {
        refCode,
        name,
        email,
        phone: phone || null,
        company: company || null,
        services: services as ServiceCategory[],
        budgetRange: budgetRange || null,
        message,
        locale,
        source,
        ipHash,
        items: {
          create: equipment.map((e) => ({
            equipmentId: e.id,
            labelSnapshot: `${e.brand} ${e.model}`,
          })),
        },
      },
    })

    await sendInternalNotification({
      subject: `คำขอใหม่ ${refCode} · ${name}`,
      replyTo: email,
      html: emailShell(
        `คำขอใหม่จากเว็บไซต์ · ${refCode}`,
        renderRows([
          ['ชื่อ', name],
          ['อีเมล', email],
          ['โทร', phone],
          ['บริษัท', company],
          ['ที่มา', source],
          ['บริการที่สนใจ', services.join(', ')],
          ['งบประมาณ', budgetRange],
          ['อุปกรณ์', equipment.map((e) => `${e.brand} ${e.model}`).join('\n')],
          ['ข้อความ', message],
        ]),
      ),
    })
  } catch (error) {
    console.error('[action:submitLead] บันทึกไม่สำเร็จ', error)
    return { status: 'error', messageKey: 'serverError' }
  }

  return { status: 'success', messageKey: 'leadSuccess', refCode }
}
