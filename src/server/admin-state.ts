/** แยกจากไฟล์ 'use server' ซึ่ง export ได้เฉพาะ async function */
export type AdminActionState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Record<string, string[]>
}

export const initialAdminState: AdminActionState = { status: 'idle' }
