import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/AdminPage'
import { emptyPost, PostForm } from '@/components/admin/PostForm'

export const metadata: Metadata = { title: 'เขียนบทความ' }

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader title="เขียนบทความ" />
      <PostForm post={emptyPost} />
    </div>
  )
}
