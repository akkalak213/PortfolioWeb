import { Images, Star } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { AdminPageHeader, EmptyState, StatusPill } from '@/components/admin/AdminPage'
import { contentStatusLabels, serviceCategoryLabels } from '@/lib/admin-labels'
import { getAdminProjects } from '@/server/admin-queries'

export const metadata: Metadata = { title: 'ผลงาน' }

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects()

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        title="ผลงาน"
        description="ผลงานที่แสดงบนหน้า /work — ฉบับร่างจะยังไม่ขึ้นหน้าเว็บ"
        action={{ href: '/admin/projects/new', label: 'เพิ่มผลงาน' }}
      />

      {projects.length === 0 ? (
        <EmptyState>ยังไม่มีผลงาน กดปุ่มเพิ่มผลงานเพื่อเริ่ม</EmptyState>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/admin/projects/${project.id}`}
                className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-subtle">
                  {project.coverImage && (
                    <Image
                      src={project.coverImage}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium">{project.titleTh}</span>
                    {project.isFeatured && (
                      <Star size={13} className="fill-accent text-accent" aria-label="ผลงานเด่น" />
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {serviceCategoryLabels[project.category]}
                    {project.clientName && ` · ${project.clientName}`}
                    {project.year && ` · ${project.year}`}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {project._count.media > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Images size={13} aria-hidden />
                      {project._count.media}
                    </span>
                  )}
                  <StatusPill tone={project.status === 'PUBLISHED' ? 'success' : 'muted'}>
                    {contentStatusLabels[project.status]}
                  </StatusPill>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
