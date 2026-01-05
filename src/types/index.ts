export interface Project {
  id: number
  created_at?: string
  title: string
  slug: string        // เพิ่ม
  description: string
  category: string
  tags: string[]
  cover_image: string
  gallery_images: string[] // เพิ่ม
  demo_url?: string
  repo_url?: string
  is_featured?: boolean
}