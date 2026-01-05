import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    // ดึง Email จาก Environment Variable (Server เท่านั้นที่รู้)
    const email = process.env.ADMIN_EMAIL

    if (!email) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    // สร้าง Client สำหรับ Server Side
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Login หลังบ้าน
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    // ส่ง Session กลับไปให้หน้าเว็บ (โดยไม่ต้องบอก Email)
    return NextResponse.json({ session: data.session })

  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}