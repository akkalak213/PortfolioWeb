import { Resend } from 'resend'
import { isMailConfigured, serverEnv } from './env'

/**
 * อีเมลเป็นส่วนเสริม ไม่ใช่ส่วนบังคับ
 * ถ้ายังไม่ได้ตั้ง RESEND_API_KEY ฟอร์มยังบันทึกลงฐานข้อมูลตามปกติ แค่ไม่มีเมลแจ้งเตือน
 * ทีมยังเห็นคำขอทั้งหมดได้จากกล่อง lead ในหน้า /admin
 */

const resend = isMailConfigured ? new Resend(serverEnv.RESEND_API_KEY) : null

type SendArgs = {
  subject: string
  html: string
  replyTo?: string
}

export async function sendInternalNotification({ subject, html, replyTo }: SendArgs) {
  if (!resend) {
    console.info('[mail] ข้ามการส่งอีเมล — ยังไม่ได้ตั้งค่า Resend')
    return { sent: false as const }
  }

  try {
    const { error } = await resend.emails.send({
      from: serverEnv.MAIL_FROM!,
      to: serverEnv.MAIL_TO!,
      subject,
      html,
      replyTo,
    })

    if (error) {
      console.error('[mail] Resend ปฏิเสธคำขอ', error)
      return { sent: false as const }
    }

    return { sent: true as const }
  } catch (error) {
    // ส่งเมลไม่สำเร็จต้องไม่ทำให้ลูกค้าเห็นหน้า error ทั้งที่ข้อมูลบันทึกแล้ว
    console.error('[mail] ส่งอีเมลไม่สำเร็จ', error)
    return { sent: false as const }
  }
}

/** หนีอักขระ HTML ก่อนยัดข้อความจากผู้ใช้ลงในเทมเพลตอีเมล */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function renderRows(rows: [label: string, value: string | null | undefined][]): string {
  return rows
    .filter(([, value]) => Boolean(value))
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:8px 16px 8px 0;color:#6b675c;font-size:13px;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
          <td style="padding:8px 0;color:#16150f;font-size:14px">${escapeHtml(String(value)).replace(/\n/g, '<br>')}</td>
        </tr>`,
    )
    .join('')
}

export function emailShell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#fbfaf8;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px">
      <p style="margin:0 0 24px;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#c2632a">Alexan Production</p>
      <h1 style="margin:0 0 20px;font-size:20px;color:#16150f">${escapeHtml(title)}</h1>
      <table style="width:100%;border-collapse:collapse">${bodyHtml}</table>
    </div>
  </body></html>`
}
