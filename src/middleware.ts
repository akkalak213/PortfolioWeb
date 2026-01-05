import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// หมายเหตุ: ใน Production จริง ควรใช้ @supabase/ssr เพื่อจัดการ Cookie ฝั่ง Server
// แต่ถ้าใช้แบบง่าย (Client Login) เราสามารถเช็คการมีอยู่ของ Cookie 'sb-access-token' หรือ 'admin_access'
export function middleware(request: NextRequest) {
  
  // 1. เช็ค Supabase Session Token (ชื่อ Cookie จะขึ้นต้นด้วย sb-)
  // หรือ 2. เช็ค Cookie 'admin_access' ที่เราแอบ set ไว้ใน LoginModal เพื่อความเข้ากันได้
  const hasSupabaseSession = request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))
  const hasLegacyCookie = request.cookies.get('admin_access')?.value === 'GRANTED'

  if (!hasSupabaseSession && !hasLegacyCookie) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}