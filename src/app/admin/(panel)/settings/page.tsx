import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/AdminPage'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { getAdminSettings } from '@/server/admin-queries'

export const metadata: Metadata = { title: 'ข้อมูลบริษัท' }

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings()

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="ข้อมูลบริษัท"
        description="ข้อมูลชุดนี้ใช้ทั่วทั้งเว็บ แก้ที่นี่แล้วเปลี่ยนทุกหน้าพร้อมกันโดยไม่ต้อง deploy ใหม่"
      />
      <SettingsForm
        company={settings.company}
        social={settings.social}
        hero={settings.hero}
        quote={settings.quote}
      />
    </div>
  )
}
