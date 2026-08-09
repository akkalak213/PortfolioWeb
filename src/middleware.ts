import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  /**
   * ให้ next-intl จัดการเฉพาะหน้าเว็บสาธารณะ
   * ข้าม: api, ไฟล์ static ของ Next, หลังบ้าน (/admin ใช้ภาษาไทยอย่างเดียว) และไฟล์ที่มีนามสกุล
   */
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
}
