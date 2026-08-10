import { Star } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminPageHeader, EmptyState, StatusPill } from '@/components/admin/AdminPage'
import { contentStatusLabels } from '@/lib/admin-labels'
import { formatDate } from '@/lib/format'
import { getAdminPosts } from '@/server/admin-queries'

export const metadata: Metadata = { title: 'บทความ' }

export default async function AdminPostsPage() {
  const posts = await getAdminPosts()

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="บทความ"
        description="บทความช่วยให้เว็บติดอันดับค้นหา — เขียนเรื่องที่ลูกค้าถามบ่อยจะได้ผลดีที่สุด"
        action={{ href: '/admin/posts/new', label: 'เขียนบทความ' }}
      />

      {posts.length === 0 ? (
        <EmptyState>ยังไม่มีบทความ</EmptyState>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/admin/posts/${post.id}`}
                className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2">
                    <span className="truncate font-medium">{post.titleTh}</span>
                    {post.isFeatured && (
                      <Star size={13} className="shrink-0 fill-accent text-accent" aria-label="ปักหมุด" />
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {post.tags.join(' · ') || 'ไม่มีแท็ก'}
                    {post.readingMinutes && ` · อ่าน ${post.readingMinutes} นาที`}
                    {post.publishedAt && ` · ${formatDate(post.publishedAt, 'th')}`}
                  </p>
                </div>
                <StatusPill tone={post.status === 'PUBLISHED' ? 'success' : 'muted'}>
                  {contentStatusLabels[post.status]}
                </StatusPill>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
