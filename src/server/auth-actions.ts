'use server'

import { AuthError } from 'next-auth'
import { signIn, signOut } from '@/auth'
import type { AdminActionState } from './admin-state'

export async function authenticate(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const next = String(formData.get('next') ?? '/admin')
  // กัน open redirect — รับเฉพาะ path ภายในหลังบ้านเท่านั้น
  const redirectTo = next.startsWith('/admin') ? next : '/admin'

  try {
    await signIn('credentials', {
      email: String(formData.get('email') ?? '').toLowerCase(),
      password: String(formData.get('password') ?? ''),
      redirectTo,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      // ไม่บอกว่าอีเมลผิดหรือรหัสผ่านผิด เพื่อไม่ให้เดาได้ว่าอีเมลไหนมีอยู่ในระบบ
      return { status: 'error', message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }
    }
    // signIn โยน NEXT_REDIRECT เมื่อสำเร็จ ต้องปล่อยผ่านไปให้ Next จัดการ
    throw error
  }

  return { status: 'success' }
}

export async function logout() {
  await signOut({ redirectTo: '/admin/login' })
}
