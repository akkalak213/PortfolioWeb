import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminShell } from '@/components/admin/AdminShell'
import { getAdminCounts } from '@/server/admin-queries'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  /**
   * middleware กันไว้ชั้นหนึ่งแล้ว แต่เช็คซ้ำที่นี่ด้วย
   * เพราะ middleware อ่านแค่ cookie ส่วนชั้นนี้คือด่านจริงที่ประกอบหน้าขึ้นมา
   */
  if (!session?.user) redirect('/admin/login')

  const counts = await getAdminCounts()

  return (
    <AdminShell
      user={{
        name: session.user.name ?? 'ผู้ดูแลระบบ',
        email: session.user.email ?? '',
        role: session.user.role,
      }}
      counts={counts}
    >
      {children}
    </AdminShell>
  )
}
