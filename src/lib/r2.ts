import { randomBytes } from 'node:crypto'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { isR2Configured, serverEnv } from './env'

/**
 * Cloudflare R2 — ที่เก็บรูปและไฟล์ทั้งหมดของเว็บ
 *
 * เบราว์เซอร์อัปโหลดตรงเข้า R2 ด้วย presigned URL ไม่ผ่านเซิร์ฟเวอร์ Next
 * ไฟล์วิดีโอหรือรูปความละเอียดสูงจึงไม่กินแรมและ bandwidth ของ container บน Railway
 */

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
] as const

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024 // 15MB

let client: S3Client | null = null

function getClient(): S3Client {
  if (!isR2Configured) throw new Error('ยังไม่ได้ตั้งค่า Cloudflare R2 ใน environment variable')

  client ??= new S3Client({
    region: 'auto',
    endpoint: `https://${serverEnv.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: serverEnv.R2_ACCESS_KEY_ID!,
      secretAccessKey: serverEnv.R2_SECRET_ACCESS_KEY!,
    },
  })

  return client
}

/**
 * ชื่อไฟล์ใน bucket: uploads/2026/08/a1b2c3d4-ชื่อเดิม.jpg
 * แยกตามเดือนเพื่อให้เปิดดูใน dashboard ของ Cloudflare แล้วยังหาเจอ
 * และเติมสตริงสุ่มกันไฟล์ชื่อซ้ำทับกัน
 */
export function buildObjectKey(fileName: string, folder = 'uploads'): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  const extension = fileName.split('.').pop()?.toLowerCase().slice(0, 5) ?? 'bin'
  const base = fileName
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

  const safeFolder = folder.replace(/[^a-z0-9-]/gi, '') || 'uploads'
  const unique = randomBytes(4).toString('hex')

  return `${safeFolder}/${year}/${month}/${unique}-${base || 'file'}.${extension}`
}

export function publicUrlFor(key: string): string {
  return `${serverEnv.R2_PUBLIC_URL!.replace(/\/$/, '')}/${key}`
}

/** URL ที่เบราว์เซอร์เอาไปยิง PUT ได้โดยตรง มีอายุ 10 นาที */
export async function createPresignedUpload(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: serverEnv.R2_BUCKET!,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(getClient(), command, { expiresIn: 600 })
  return { uploadUrl, key, publicUrl: publicUrlFor(key) }
}

export async function deleteObject(key: string) {
  await getClient().send(
    new DeleteObjectCommand({ Bucket: serverEnv.R2_BUCKET!, Key: key }),
  )
}

/** แกะ object key กลับจาก public URL เพื่อใช้ตอนลบไฟล์ */
export function keyFromPublicUrl(url: string): string | null {
  const base = serverEnv.R2_PUBLIC_URL?.replace(/\/$/, '')
  if (!base || !url.startsWith(base)) return null
  return url.slice(base.length + 1) || null
}
