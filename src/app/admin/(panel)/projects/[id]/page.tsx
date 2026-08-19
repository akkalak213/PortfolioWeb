import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPage'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { toPairRows, versionOf } from '@/server/cms-helpers'
import { getAdminProject } from '@/server/admin-queries'

export const metadata: Metadata = { title: 'แก้ไขผลงาน' }

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getAdminProject(id)
  if (!project) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="แก้ไขผลงาน"
        description={`อยู่ที่ /work/${project.slug}`}
      />
      <ProjectForm
        project={{
          id: project.id,
          version: versionOf(project.updatedAt),
          slug: project.slug,
          category: project.category,
          titleTh: project.titleTh,
          titleEn: project.titleEn,
          summaryTh: project.summaryTh,
          summaryEn: project.summaryEn,
          bodyTh: project.bodyTh ?? '',
          bodyEn: project.bodyEn ?? '',
          clientName: project.clientName ?? '',
          year: project.year ? String(project.year) : '',
          location: project.location ?? '',
          coverImage: project.coverImage,
          videoUrl: project.videoUrl ?? '',
          liveUrl: project.liveUrl ?? '',
          repoUrl: project.repoUrl ?? '',
          techStack: project.techStack,
          creditsTh: toPairRows(project.creditsTh, 'role', 'name'),
          creditsEn: toPairRows(project.creditsEn, 'role', 'name'),
          mediaUrls: project.media.map((m) => m.url),
          isFeatured: project.isFeatured,
          status: project.status,
          order: String(project.order),
        }}
      />
    </div>
  )
}
