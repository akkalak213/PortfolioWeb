import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/AdminPage'
import { emptyProject, ProjectForm } from '@/components/admin/ProjectForm'

export const metadata: Metadata = { title: 'เพิ่มผลงาน' }

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="เพิ่มผลงาน"
        description="บันทึกเป็นฉบับร่างไว้ก่อนได้ แล้วค่อยเปลี่ยนเป็นเผยแพร่เมื่อพร้อม"
      />
      <ProjectForm project={emptyProject} />
    </div>
  )
}
