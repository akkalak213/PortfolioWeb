import NextAuth from 'next-auth'
import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import { authConfig } from './auth.config'
import { routing } from './i18n/routing'

/**
 * middleware ตัวเดียวรับสองหน้าที่:
 *   /admin/*  → ตรวจว่าล็อกอินแล้วหรือยัง (หลังบ้านใช้ภาษาไทยอย่างเดียว ไม่มี prefix ภาษา)
 *   ที่เหลือ  → ให้ next-intl จัดการเปลี่ยนเส้นทางไป /th หรือ /en
 */

const intlMiddleware = createMiddleware(routing)
const { auth } = NextAuth(authConfig)

export default auth((request) => {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login'
    const isSignedIn = Boolean(request.auth)

    if (!isSignedIn && !isLoginPage) {
      const loginUrl = new URL('/admin/login', request.nextUrl.origin)
      // จำหน้าที่ตั้งใจจะไป เพื่อพากลับมาหลังล็อกอินสำเร็จ
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (isSignedIn && isLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.nextUrl.origin))
    }

    return NextResponse.next()
  }

  return intlMiddleware(request)
})

export const config = {
  // ข้าม API, ไฟล์ static ของ Next และไฟล์ที่มีนามสกุล
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
