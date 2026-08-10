'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type {
  ContentStatus,
  EquipmentCategory,
  EquipmentStatus,
  PriceUnit,
  ServiceCategory,
} from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import type { AdminActionState } from './admin-state'
import {
  boolean,
  integer,
  list,
  number,
  optionalText,
  pairs,
  requireAdmin,
  requireEditor,
  slugify,
  text,
} from './cms-helpers'

/**
 * Action ของ CMS ทั้งหมด
 *
 * รูปแบบเดียวกันทุกตัว: เช็คสิทธิ์ → อ่าน formData → เขียนฐานข้อมูล → revalidate หน้าสาธารณะ
 * สร้างใหม่จะ redirect กลับไปหน้ารายการ ส่วนการแก้จะคืน state ให้แสดงข้อความในหน้าเดิม
 */

function revalidateSite(...paths: string[]) {
  for (const path of paths) revalidatePath(path, 'page')
}

function failure(error: unknown, label: string): AdminActionState {
  console.error(`[cms:${label}]`, error)
  const message =
    error instanceof Error && error.message.includes('Unique constraint')
      ? 'มีรายการที่ใช้ slug นี้อยู่แล้ว กรุณาเปลี่ยน slug'
      : 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง'
  return { status: 'error', message }
}

// ─────────────────────────── ผลงาน ───────────────────────────

export async function saveProject(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const user = await requireEditor()

  const id = optionalText(formData, 'id')
  const titleTh = text(formData, 'titleTh')
  if (!titleTh) return { status: 'error', message: 'ต้องกรอกชื่อผลงานภาษาไทย' }

  const slug = slugify(text(formData, 'slug') || text(formData, 'titleEn') || titleTh)
  const status = text(formData, 'status') as ContentStatus
  const mediaUrls = list(formData, 'mediaUrl')

  const data = {
    slug,
    category: text(formData, 'category') as ServiceCategory,
    titleTh,
    titleEn: text(formData, 'titleEn') || titleTh,
    summaryTh: text(formData, 'summaryTh'),
    summaryEn: text(formData, 'summaryEn') || text(formData, 'summaryTh'),
    bodyTh: optionalText(formData, 'bodyTh'),
    bodyEn: optionalText(formData, 'bodyEn'),
    clientName: optionalText(formData, 'clientName'),
    year: number(formData, 'year'),
    location: optionalText(formData, 'location'),
    coverImage: text(formData, 'coverImage'),
    videoUrl: optionalText(formData, 'videoUrl'),
    liveUrl: optionalText(formData, 'liveUrl'),
    repoUrl: optionalText(formData, 'repoUrl'),
    techStack: list(formData, 'techStack'),
    creditsTh: pairs(formData, 'creditsTh', 'role', 'name'),
    creditsEn: pairs(formData, 'creditsEn', 'role', 'name'),
    isFeatured: boolean(formData, 'isFeatured'),
    status,
    order: integer(formData, 'order'),
    // ตั้งวันเผยแพร่ครั้งแรกที่กดเผยแพร่ ไม่ทับของเดิมเวลาแก้ซ้ำ
    publishedAt: status === 'PUBLISHED' ? new Date() : null,
  }

  try {
    if (id) {
      const existing = await db.project.findUnique({
        where: { id },
        select: { publishedAt: true },
      })

      await db.project.update({
        where: { id },
        data: {
          ...data,
          publishedAt:
            status === 'PUBLISHED' ? (existing?.publishedAt ?? new Date()) : null,
        },
      })

      // แกลเลอรีแทนที่ทั้งชุด — ง่ายกว่าและตรงกับที่ผู้ใช้เห็นในฟอร์ม
      await db.projectMedia.deleteMany({ where: { projectId: id } })
      if (mediaUrls.length) {
        await db.projectMedia.createMany({
          data: mediaUrls.map((url, index) => ({ projectId: id, url, order: index })),
        })
      }

      revalidateSite('/[locale]/work', `/[locale]/work/${slug}`, '/[locale]')
      return { status: 'success', message: 'บันทึกผลงานแล้ว' }
    }

    const created = await db.project.create({
      data: {
        ...data,
        authorId: user.id,
        media: {
          create: mediaUrls.map((url, index) => ({ url, order: index })),
        },
      },
    })

    revalidateSite('/[locale]/work', '/[locale]')
    revalidatePath('/admin/projects')
    redirect(`/admin/projects/${created.id}`)
  } catch (error) {
    // redirect() ทำงานด้วยการโยน error — ต้องปล่อยผ่าน ไม่งั้นจะกลายเป็นข้อความ "บันทึกไม่สำเร็จ"
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error
    if (typeof error === 'object' && error !== null && 'digest' in error) throw error
    return failure(error, 'saveProject')
  }

  return { status: 'success' }
}

export async function deleteProject(formData: FormData) {
  await requireEditor()
  const id = text(formData, 'id')

  try {
    await db.project.delete({ where: { id } })
  } catch (error) {
    console.error('[cms:deleteProject]', error)
  }

  revalidateSite('/[locale]/work', '/[locale]')
  revalidatePath('/admin/projects')
  redirect('/admin/projects')
}

// ─────────────────────── อุปกรณ์ให้เช่า ───────────────────────

export async function saveEquipment(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireEditor()

  const id = optionalText(formData, 'id')
  const brand = text(formData, 'brand')
  const model = text(formData, 'model')
  if (!brand || !model) return { status: 'error', message: 'ต้องกรอกยี่ห้อและรุ่น' }

  const nameTh = text(formData, 'nameTh') || `${brand} ${model}`

  const data = {
    slug: slugify(text(formData, 'slug') || `${brand} ${model}`),
    category: text(formData, 'category') as EquipmentCategory,
    brand,
    model,
    nameTh,
    nameEn: text(formData, 'nameEn') || `${brand} ${model}`,
    descriptionTh: optionalText(formData, 'descriptionTh'),
    descriptionEn: optionalText(formData, 'descriptionEn'),
    specs: pairs(formData, 'specs', 'label', 'value'),
    dailyRate: number(formData, 'dailyRate'),
    weeklyRate: number(formData, 'weeklyRate'),
    depositAmount: number(formData, 'depositAmount'),
    image: optionalText(formData, 'image'),
    gallery: list(formData, 'gallery'),
    quantity: integer(formData, 'quantity', 1),
    status: text(formData, 'status') as EquipmentStatus,
    isFeatured: boolean(formData, 'isFeatured'),
    isActive: boolean(formData, 'isActive'),
    order: integer(formData, 'order'),
  }

  try {
    if (id) {
      await db.equipment.update({ where: { id }, data })
      revalidateSite('/[locale]/rental')
      return { status: 'success', message: 'บันทึกอุปกรณ์แล้ว' }
    }

    await db.equipment.create({ data })
    revalidateSite('/[locale]/rental')
    revalidatePath('/admin/equipment')
    redirect('/admin/equipment')
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'digest' in error) throw error
    return failure(error, 'saveEquipment')
  }

  return { status: 'success' }
}

export async function deleteEquipment(formData: FormData) {
  await requireEditor()

  try {
    await db.equipment.delete({ where: { id: text(formData, 'id') } })
  } catch (error) {
    console.error('[cms:deleteEquipment]', error)
  }

  revalidateSite('/[locale]/rental')
  revalidatePath('/admin/equipment')
  redirect('/admin/equipment')
}

// ─────────────────────────── บริการ ───────────────────────────

export async function saveService(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireEditor()

  const id = text(formData, 'id')
  const slug = text(formData, 'slug')

  try {
    await db.service.update({
      where: { id },
      data: {
        titleTh: text(formData, 'titleTh'),
        titleEn: text(formData, 'titleEn'),
        taglineTh: text(formData, 'taglineTh'),
        taglineEn: text(formData, 'taglineEn'),
        descriptionTh: text(formData, 'descriptionTh'),
        descriptionEn: text(formData, 'descriptionEn'),
        icon: text(formData, 'icon') || 'Aperture',
        coverImage: optionalText(formData, 'coverImage'),
        highlightsTh: list(formData, 'highlightsTh'),
        highlightsEn: list(formData, 'highlightsEn'),
        processTh: pairs(formData, 'processTh', 'title', 'detail'),
        processEn: pairs(formData, 'processEn', 'title', 'detail'),
        faqTh: pairs(formData, 'faqTh', 'question', 'answer'),
        faqEn: pairs(formData, 'faqEn', 'question', 'answer'),
        isActive: boolean(formData, 'isActive'),
        order: integer(formData, 'order'),
      },
    })
  } catch (error) {
    return failure(error, 'saveService')
  }

  revalidateSite('/[locale]/services', `/[locale]/services/${slug}`, '/[locale]')
  return { status: 'success', message: 'บันทึกบริการแล้ว' }
}

export async function saveServicePackages(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireEditor()

  const serviceId = text(formData, 'serviceId')
  const slug = text(formData, 'slug')

  const nameTh = formData.getAll('pkgNameTh').map((v) => String(v).trim())
  const nameEn = formData.getAll('pkgNameEn').map((v) => String(v).trim())
  const priceFrom = formData.getAll('pkgPrice').map((v) => String(v).trim())
  const priceUnit = formData.getAll('pkgUnit').map((v) => String(v) as PriceUnit)
  const includesTh = formData.getAll('pkgIncludesTh').map((v) => String(v))
  const includesEn = formData.getAll('pkgIncludesEn').map((v) => String(v))
  const popularIndex = text(formData, 'pkgPopular')

  const rows = nameTh
    .map((name, index) => ({
      nameTh: name,
      nameEn: nameEn[index] || name,
      priceFrom: priceFrom[index] ? Number(priceFrom[index].replace(/,/g, '')) : null,
      priceUnit: priceUnit[index] ?? ('PROJECT' as PriceUnit),
      // แต่ละบรรทัดในกล่องข้อความ = หนึ่งรายการที่ลูกค้าจะได้รับ
      includesTh: (includesTh[index] ?? '').split('\n').map((s) => s.trim()).filter(Boolean),
      includesEn: (includesEn[index] ?? '').split('\n').map((s) => s.trim()).filter(Boolean),
      isPopular: String(index) === popularIndex,
      order: index + 1,
      serviceId,
    }))
    .filter((row) => row.nameTh)

  try {
    await db.servicePackage.deleteMany({ where: { serviceId } })
    if (rows.length) await db.servicePackage.createMany({ data: rows })
  } catch (error) {
    return failure(error, 'saveServicePackages')
  }

  revalidateSite(`/[locale]/services/${slug}`)
  return { status: 'success', message: `บันทึก ${rows.length} แพ็กเกจแล้ว` }
}

// ─────────────────────────── บทความ ───────────────────────────

export async function savePost(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const user = await requireEditor()

  const id = optionalText(formData, 'id')
  const titleTh = text(formData, 'titleTh')
  if (!titleTh) return { status: 'error', message: 'ต้องกรอกชื่อบทความภาษาไทย' }

  const slug = slugify(text(formData, 'slug') || text(formData, 'titleEn') || titleTh)
  const status = text(formData, 'status') as ContentStatus
  const bodyTh = text(formData, 'bodyTh')

  const data = {
    slug,
    titleTh,
    titleEn: text(formData, 'titleEn') || titleTh,
    excerptTh: text(formData, 'excerptTh'),
    excerptEn: text(formData, 'excerptEn') || text(formData, 'excerptTh'),
    bodyTh,
    bodyEn: text(formData, 'bodyEn') || bodyTh,
    coverImage: optionalText(formData, 'coverImage'),
    tags: list(formData, 'tags'),
    // ประมาณจากภาษาไทยราว 3 ตัวอักษรต่อคำ อ่านได้ราว 200 คำต่อนาที
    readingMinutes: Math.max(1, Math.round(bodyTh.length / 3 / 200)),
    isFeatured: boolean(formData, 'isFeatured'),
    status,
  }

  try {
    if (id) {
      const existing = await db.post.findUnique({ where: { id }, select: { publishedAt: true } })
      await db.post.update({
        where: { id },
        data: {
          ...data,
          publishedAt: status === 'PUBLISHED' ? (existing?.publishedAt ?? new Date()) : null,
        },
      })
      revalidateSite('/[locale]/blog', `/[locale]/blog/${slug}`)
      return { status: 'success', message: 'บันทึกบทความแล้ว' }
    }

    const created = await db.post.create({
      data: {
        ...data,
        authorId: user.id,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
    })

    revalidateSite('/[locale]/blog')
    revalidatePath('/admin/posts')
    redirect(`/admin/posts/${created.id}`)
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'digest' in error) throw error
    return failure(error, 'savePost')
  }

  return { status: 'success' }
}

export async function deletePost(formData: FormData) {
  await requireEditor()

  try {
    await db.post.delete({ where: { id: text(formData, 'id') } })
  } catch (error) {
    console.error('[cms:deletePost]', error)
  }

  revalidateSite('/[locale]/blog')
  revalidatePath('/admin/posts')
  redirect('/admin/posts')
}

// ─────────────────────────── ทีมงาน ───────────────────────────

export async function saveTeamMember(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireEditor()

  const id = optionalText(formData, 'id')
  const name = text(formData, 'name')
  if (!name) return { status: 'error', message: 'ต้องกรอกชื่อ' }

  const data = {
    name,
    roleTh: text(formData, 'roleTh'),
    roleEn: text(formData, 'roleEn') || text(formData, 'roleTh'),
    bioTh: optionalText(formData, 'bioTh'),
    bioEn: optionalText(formData, 'bioEn'),
    photo: optionalText(formData, 'photo'),
    email: optionalText(formData, 'email'),
    socials: Object.fromEntries(
      ['instagram', 'facebook', 'linkedin', 'github', 'website']
        .map((key) => [key, optionalText(formData, `social_${key}`)])
        .filter(([, value]) => value),
    ),
    isActive: boolean(formData, 'isActive'),
    order: integer(formData, 'order'),
  }

  try {
    if (id) {
      await db.teamMember.update({ where: { id }, data })
    } else {
      await db.teamMember.create({ data })
    }
  } catch (error) {
    return failure(error, 'saveTeamMember')
  }

  revalidateSite('/[locale]/about')
  revalidatePath('/admin/team')
  return { status: 'success', message: 'บันทึกข้อมูลทีมงานแล้ว' }
}

export async function deleteTeamMember(formData: FormData) {
  await requireEditor()

  try {
    await db.teamMember.delete({ where: { id: text(formData, 'id') } })
  } catch (error) {
    console.error('[cms:deleteTeamMember]', error)
  }

  revalidateSite('/[locale]/about')
  revalidatePath('/admin/team')
}

// ─────────────────── ข้อมูลบริษัทและค่าตั้งค่า ───────────────────

export async function saveSettings(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin()

  const company = {
    nameTh: text(formData, 'company_nameTh'),
    nameEn: text(formData, 'company_nameEn'),
    legalNameTh: text(formData, 'company_legalNameTh'),
    taxId: text(formData, 'company_taxId'),
    addressTh: text(formData, 'company_addressTh'),
    addressEn: text(formData, 'company_addressEn'),
    email: text(formData, 'company_email'),
    phone: text(formData, 'company_phone'),
    lineId: text(formData, 'company_lineId'),
    openingHoursTh: text(formData, 'company_openingHoursTh'),
    openingHoursEn: text(formData, 'company_openingHoursEn'),
    mapUrl: text(formData, 'company_mapUrl'),
    latitude: number(formData, 'company_latitude') ?? 13.7563,
    longitude: number(formData, 'company_longitude') ?? 100.5018,
  }

  const social = {
    facebook: text(formData, 'social_facebook'),
    instagram: text(formData, 'social_instagram'),
    youtube: text(formData, 'social_youtube'),
    tiktok: text(formData, 'social_tiktok'),
    line: text(formData, 'social_line'),
  }

  const hero = {
    eyebrowTh: text(formData, 'hero_eyebrowTh'),
    eyebrowEn: text(formData, 'hero_eyebrowEn'),
    headlineTh: text(formData, 'hero_headlineTh'),
    headlineEn: text(formData, 'hero_headlineEn'),
    subheadlineTh: text(formData, 'hero_subheadlineTh'),
    subheadlineEn: text(formData, 'hero_subheadlineEn'),
  }

  const quote = {
    defaultValidDays: integer(formData, 'quote_defaultValidDays', 30),
    defaultVatRate: number(formData, 'quote_defaultVatRate') ?? 7,
    defaultWithholdingRate: number(formData, 'quote_defaultWithholdingRate') ?? 3,
    termsTh: text(formData, 'quote_termsTh'),
    termsEn: text(formData, 'quote_termsEn'),
    bankName: text(formData, 'quote_bankName'),
    bankAccountName: text(formData, 'quote_bankAccountName'),
    bankAccountNumber: text(formData, 'quote_bankAccountNumber'),
  }

  try {
    await Promise.all(
      Object.entries({ company, social, hero, quote }).map(([key, value]) =>
        db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } }),
      ),
    )
  } catch (error) {
    return failure(error, 'saveSettings')
  }

  // ข้อมูลบริษัทอยู่ใน footer ของทุกหน้า จึงต้องล้างแคชทั้งเว็บ
  revalidatePath('/', 'layout')
  return { status: 'success', message: 'บันทึกข้อมูลบริษัทแล้ว' }
}
