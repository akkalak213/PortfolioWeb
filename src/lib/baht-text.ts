/**
 * แปลงจำนวนเงินเป็นตัวอักษรภาษาไทย เช่น 15000 → "หนึ่งหมื่นห้าพันบาทถ้วน"
 *
 * เอกสารทางการเงินของไทยต้องมีบรรทัดนี้เสมอ เพราะกันการแก้ตัวเลขภายหลัง
 * กฎที่ต่างจากการอ่านเลขทั่วไป: หลักสิบใช้ "ยี่สิบ" ไม่ใช่ "สองสิบ"
 * และหลักหน่วยที่เป็น 1 เมื่อมีหลักสิบนำหน้าจะอ่านว่า "เอ็ด"
 */

const digits = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
const places = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน']

/** อ่านจำนวนเต็มไม่เกิน 7 หลัก (ส่วนที่เกินล้านจะถูกตัดมาเรียกซ้ำ) */
function readGroup(value: string): string {
  const length = value.length
  let result = ''

  for (let i = 0; i < length; i++) {
    const digit = Number(value[i])
    if (digit === 0) continue

    const place = length - i - 1

    if (place === 1 && digit === 1) {
      result += 'สิบ'
    } else if (place === 1 && digit === 2) {
      result += 'ยี่สิบ'
    } else if (place === 0 && digit === 1 && length > 1) {
      result += 'เอ็ด'
    } else {
      result += digits[digit] + places[place]
    }
  }

  return result
}

function readInteger(value: number): string {
  if (value === 0) return 'ศูนย์'

  const text = String(value)

  // ตัวเลขเกินหลักล้าน: อ่านส่วนหน้าแล้วต่อท้ายด้วย "ล้าน" แล้ววนซ้ำกับส่วนที่เหลือ
  if (text.length > 7) {
    const head = text.slice(0, text.length - 6)
    const tail = text.slice(text.length - 6)
    const tailText = Number(tail) === 0 ? '' : readGroup(tail.replace(/^0+/, '') || '0')
    return `${readInteger(Number(head))}ล้าน${tailText}`
  }

  return readGroup(text)
}

export function bahtText(amount: number): string {
  if (!Number.isFinite(amount)) return ''

  const isNegative = amount < 0
  const absolute = Math.abs(amount)

  // ปัดที่สตางค์เพื่อเลี่ยงปัญหาทศนิยมลอยตัว เช่น 0.1 + 0.2
  const totalSatang = Math.round(absolute * 100)
  const baht = Math.floor(totalSatang / 100)
  const satang = totalSatang % 100

  const bahtPart = `${readInteger(baht)}บาท`
  const satangPart = satang === 0 ? 'ถ้วน' : `${readGroup(String(satang).padStart(2, '0'))}สตางค์`

  return `${isNegative ? 'ลบ' : ''}${bahtPart}${satangPart}`
}
