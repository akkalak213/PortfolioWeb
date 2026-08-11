import { cache } from 'react'
import { db } from './db'

/**
 * ค่าตั้งค่าเว็บที่แก้ได้จากหลังบ้าน
 *
 * ถ้าต่อฐานข้อมูลไม่ได้ (เช่น เพิ่ง clone มายังไม่ได้ตั้ง DATABASE_URL) จะคืนค่า default
 * แทนที่จะทำให้ทั้งหน้าเว็บพัง — ทีมจะได้เปิด npm run dev ดูงานได้ทันที
 */

export type CompanySettings = {
  nameTh: string
  nameEn: string
  legalNameTh: string
  taxId: string
  addressTh: string
  addressEn: string
  email: string
  phone: string
  lineId: string
  openingHoursTh: string
  openingHoursEn: string
  mapUrl: string
  latitude: number
  longitude: number
}

export type SocialSettings = {
  facebook: string
  instagram: string
  youtube: string
  tiktok: string
  line: string
}

export type HeroSettings = {
  eyebrowTh: string
  eyebrowEn: string
  headlineTh: string
  headlineEn: string
  subheadlineTh: string
  subheadlineEn: string
}

export type SiteSettings = {
  company: CompanySettings
  social: SocialSettings
  hero: HeroSettings
}

const defaults: SiteSettings = {
  company: {
    nameTh: 'อเล็กซาน โปรดักชั่น',
    nameEn: 'Alexan Production',
    legalNameTh: 'บริษัท อเล็กซาน โปรดักชั่น จำกัด',
    taxId: '',
    addressTh: 'กรุงเทพมหานคร',
    addressEn: 'Bangkok, Thailand',
    email: 'hello@alexanproduction.com',
    phone: '',
    lineId: '',
    openingHoursTh: 'จันทร์–เสาร์ 09:00–18:00 น.',
    openingHoursEn: 'Monday–Saturday, 09:00–18:00',
    mapUrl: '',
    latitude: 13.7563,
    longitude: 100.5018,
  },
  social: { facebook: '', instagram: '', youtube: '', tiktok: '', line: '' },
  hero: {
    eyebrowTh: 'รับทำเว็บ ถ่ายภาพ ถ่ายวิดีโอ',
    eyebrowEn: 'Websites, photography, film',
    headlineTh: 'งานเว็บกับงานภาพ จบที่ทีมเดียว',
    headlineEn: 'The web side and the visual side, one team',
    subheadlineTh:
      'ไม่ต้องหาช่างภาพเจ้าหนึ่ง คนทำเว็บอีกเจ้าหนึ่ง แล้วมานั่งประสานเอง เราทำให้ทั้งหมดและคุณคุยกับเราที่เดียว',
    subheadlineEn:
      'No hiring a photographer here and a developer there, then coordinating them yourself. We do both, and you talk to one team.',
  },
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const rows = await db.siteSetting.findMany({
      where: { key: { in: ['company', 'social', 'hero'] } },
    })

    const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, unknown>

    return {
      company: { ...defaults.company, ...(byKey.company as Partial<CompanySettings>) },
      social: { ...defaults.social, ...(byKey.social as Partial<SocialSettings>) },
      hero: { ...defaults.hero, ...(byKey.hero as Partial<HeroSettings>) },
    }
  } catch {
    // ยังไม่ได้ตั้งฐานข้อมูล หรือฐานข้อมูลล่ม — แสดงค่า default ไปก่อน
    return defaults
  }
})
