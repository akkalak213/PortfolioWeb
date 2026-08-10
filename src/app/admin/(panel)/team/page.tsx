import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/AdminPage'
import { emptyTeamMember, TeamMemberForm } from '@/components/admin/TeamMemberForm'
import { getAdminTeam } from '@/server/admin-queries'

export const metadata: Metadata = { title: 'ทีมงาน' }

export default async function AdminTeamPage() {
  const team = await getAdminTeam()

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="ทีมงาน"
        description="คนที่แสดงบนหน้า /about — ลูกค้าองค์กรมักดูหน้านี้ก่อนตัดสินใจ"
      />

      <div className="space-y-5">
        {team.map((member) => (
          <TeamMemberForm
            key={member.id}
            member={{
              id: member.id,
              name: member.name,
              roleTh: member.roleTh,
              roleEn: member.roleEn,
              bioTh: member.bioTh ?? '',
              bioEn: member.bioEn ?? '',
              photo: member.photo ?? '',
              email: member.email ?? '',
              socials: (member.socials as Record<string, string>) ?? {},
              isActive: member.isActive,
              order: String(member.order),
            }}
          />
        ))}

        <div>
          <h2 className="mb-3 font-medium">เพิ่มสมาชิกใหม่</h2>
          <TeamMemberForm member={emptyTeamMember} />
        </div>
      </div>
    </div>
  )
}
