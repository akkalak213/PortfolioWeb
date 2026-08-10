/**
 * คำนวณยอดใบเสนอราคา
 *
 * ใช้ทั้งฝั่ง client (แสดงยอดสดขณะพิมพ์) และฝั่ง server (ค่าที่บันทึกจริง)
 * ห้ามคำนวณคนละที่คนละสูตร ไม่งั้นตัวเลขบนจอกับในฐานข้อมูลจะไม่ตรงกัน
 *
 * ลำดับตามหลักบัญชีไทย:
 *   ยอดรวม → หักส่วนลด → บวก VAT → หักภาษี ณ ที่จ่าย → ยอดชำระสุทธิ
 * ภาษีหัก ณ ที่จ่ายคิดจากฐานก่อน VAT เสมอ
 */

export type QuoteLine = {
  quantity: number
  unitPrice: number
}

export type QuoteTotals = {
  subtotal: number
  discount: number
  afterDiscount: number
  vatAmount: number
  withholdingAmount: number
  total: number
}

/** ปัดสองตำแหน่งเพื่อเลี่ยงเศษทศนิยมลอยตัวสะสมในยอดรวม */
const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

export function lineAmount(line: QuoteLine): number {
  return round2((Number(line.quantity) || 0) * (Number(line.unitPrice) || 0))
}

export function computeQuoteTotals({
  lines,
  discount = 0,
  vatRate = 7,
  withholdingRate = 0,
}: {
  lines: QuoteLine[]
  discount?: number
  vatRate?: number
  withholdingRate?: number
}): QuoteTotals {
  const subtotal = round2(lines.reduce((sum, line) => sum + lineAmount(line), 0))
  const safeDiscount = round2(Math.min(Math.max(discount || 0, 0), subtotal))
  const afterDiscount = round2(subtotal - safeDiscount)

  const vatAmount = round2((afterDiscount * (vatRate || 0)) / 100)
  const withholdingAmount = round2((afterDiscount * (withholdingRate || 0)) / 100)
  const total = round2(afterDiscount + vatAmount - withholdingAmount)

  return { subtotal, discount: safeDiscount, afterDiscount, vatAmount, withholdingAmount, total }
}
