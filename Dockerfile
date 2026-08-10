# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────
# Alexan Production — image สำหรับ deploy บน Railway
#
# แบ่งเป็นหลายชั้นเพื่อให้ layer ของ dependency ถูกแคชไว้
# แก้โค้ดแล้ว build ใหม่จะไม่ต้อง npm ci ซ้ำทุกครั้ง
# ─────────────────────────────────────────────────────────────

FROM node:22-alpine AS base
# Prisma และ Next บน Alpine ต้องการ libc6-compat
RUN apk add --no-cache libc6-compat
WORKDIR /app


# ───────────────── ติดตั้ง dependency ─────────────────
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# postinstall เรียก prisma generate จึงต้องมี schema อยู่ก่อนแล้ว
RUN npm ci


# ───────────────────── build ─────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ค่าที่ต้องฝังเข้า bundle ตั้งแต่ตอน build (NEXT_PUBLIC_*)
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID

# next.config อ่านค่านี้ตอน build เพื่อใส่โดเมน R2 ลงใน images.remotePatterns
# ตั้งเป็น runtime variable อย่างเดียวไม่พอ — รูปที่อัปโหลดจะโดน next/image ปฏิเสธ
ARG R2_PUBLIC_URL
ENV R2_PUBLIC_URL=$R2_PUBLIC_URL

# ตอน build ยังไม่มี DATABASE_URL และ AUTH_SECRET จริง — ข้ามการ validate env ไปก่อน
# ค่าจริงจะถูกอ่านตอน runtime จาก Variables ของ Railway
ENV SKIP_ENV_VALIDATION=1
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


# ──────────────────── runtime ────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# ไม่รันด้วย root
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# standalone รวมเฉพาะ node_modules ที่ใช้จริง ทำให้ image เล็กลงมาก
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# ต้องใช้ตอนรัน prisma migrate deploy ก่อนสตาร์ต
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
# prisma.config.ts เปิดไฟล์ด้วย import 'dotenv/config' — ขาดไปแล้ว migrate deploy จะพังตั้งแต่โหลด config
# (บน Railway ค่าจริงมาจาก environment variable อยู่แล้ว dotenv แค่ทำให้ไฟล์ config โหลดผ่าน)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/dotenv ./node_modules/dotenv

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# รัน migration ที่ยังไม่ได้ apply ก่อนเปิดรับ traffic
# ถ้า migration ล้มเหลว container จะไม่สตาร์ต ดีกว่าเปิดเว็บด้วย schema ที่ไม่ตรง
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
