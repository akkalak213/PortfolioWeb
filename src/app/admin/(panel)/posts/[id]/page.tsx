import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPage'
import { PostForm } from '@/components/admin/PostForm'
import { getAdminPost } from '@/server/admin-queries'

export const metadata: Metadata = { title: 'แก้ไขบทความ' }

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getAdminPost(id)
  if (!post) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader title="แก้ไขบทความ" description={`อยู่ที่ /blog/${post.slug}`} />
      <PostForm
        post={{
          id: post.id,
          slug: post.slug,
          titleTh: post.titleTh,
          titleEn: post.titleEn,
          excerptTh: post.excerptTh,
          excerptEn: post.excerptEn,
          bodyTh: post.bodyTh,
          bodyEn: post.bodyEn,
          coverImage: post.coverImage ?? '',
          tags: post.tags,
          isFeatured: post.isFeatured,
          status: post.status,
        }}
      />
    </div>
  )
}
