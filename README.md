# Alexan Production

เว็บไซต์และระบบหลังบ้านของ Alexan Production — รับทำเว็บไซต์ เว็บแอป แอปมือถือ ถ่ายภาพ ผลิตวิดีโอ
และให้เช่าอุปกรณ์กับสตูดิโอ รองรับสองภาษา (ไทย/อังกฤษ) ในโค้ดชุดเดียว

โดเมนที่จะใช้จริง: `https://alexanprod.studio` (ยังไม่ได้จดทะเบียน — ตั้งค่าผ่าน `NEXT_PUBLIC_SITE_URL`)

## เทคโนโลยีที่ใช้

| ส่วน | ของที่ใช้ |
| --- | --- |
| เฟรมเวิร์ก | Next.js 16 (App Router, Turbopack) + React 19 |
| ฐานข้อมูล | Postgres บน Railway ผ่าน Prisma 7 |
| ล็อกอินหลังบ้าน | Auth.js v5 (credentials + bcrypt) |
| สองภาษา | next-intl (`/th`, `/en`) |
| เก็บไฟล์ | Cloudflare R2 (อัปโหลดตรงจากเบราว์เซอร์ด้วย presigned URL) |
| อีเมล | Resend — แจ้งเตือนคำขอใหม่ และส่งใบเสนอราคาให้ลูกค้า |
| สไตล์ | Tailwind CSS 3 + ตัวแปรสีของตัวเอง รองรับโหมดสว่าง/มืด |

## เริ่มใช้งาน

```bash
npm install
cp .env.example .env    # แล้วกรอกค่าตามคอมเมนต์ในไฟล์
npm run db:deploy       # สร้างตารางตาม migration
npm run db:seed         # ข้อมูลตั้งต้น + ผู้ดูแลคนแรก
npm run dev
```

เปิด http://localhost:3000 สำหรับหน้าเว็บ และ http://localhost:3000/admin สำหรับหลังบ้าน
(ล็อกอินด้วย `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` ที่ตั้งไว้ใน `.env`)

## คำสั่งที่ใช้บ่อย

| คำสั่ง | ทำอะไร |
| --- | --- |
| `npm run dev` | เซิร์ฟเวอร์สำหรับพัฒนา |
| `npm run build` | `prisma generate` แล้ว build เวอร์ชัน production |
| `npm run typecheck` | ตรวจชนิดข้อมูลทั้งโปรเจกต์ |
| `npm run lint` | ESLint |
| `npm run db:migrate` | สร้าง migration ใหม่ตอนแก้ schema |
| `npm run db:studio` | เปิด Prisma Studio ดูข้อมูลในฐานข้อมูล |

## โครงสร้างโค้ด

```
src/
├─ app/[locale]/     หน้าเว็บสาธารณะ (สองภาษา)
├─ app/admin/        หลังบ้าน — ภาษาไทยอย่างเดียว ไม่มี prefix ภาษา
├─ components/       UI แยกตามส่วนงาน (admin, layout, rental, work, ui, …)
├─ server/           server action และ query ทั้งหมด
├─ lib/              ตัวช่วยที่ไม่ผูกกับ React (format, seo, mail, quote-math, …)
└─ i18n/             ตั้งค่า next-intl และ Link/Router ที่เติม prefix ภาษาให้เอง
messages/            ข้อความทั้งหมดของหน้าเว็บ (th.json, en.json)
prisma/              schema, migration และ seed
```

## สิ่งที่ควรรู้ก่อนแก้

- **หน้าสาธารณะเรนเดอร์สดทุกครั้ง** (`dynamic = 'force-dynamic'`) เพราะตอน build บน Railway
  ยังต่อฐานข้อมูลไม่ได้ ถ้า prerender ไว้จะได้หน้าเปล่าค้างอยู่ในแคชหลัง deploy
- **ทุก server action ต้องเช็คสิทธิ์เอง** — action เป็น endpoint สาธารณะที่ใครก็ยิงได้
  middleware กันแค่การเปิดหน้า
- **ฟอร์มหลังบ้านพก `expectedVersion`** ของระเบียนที่เรนเดอร์มาด้วยเสมอ
  ฝั่ง server เทียบก่อนเขียนแล้วปฏิเสธถ้าหน้าที่กดบันทึกเป็นภาพเก่า (ดู `src/server/cms-helpers.ts`)
- **เมทาดาทาของทุกหน้าประกอบจาก `src/lib/seo.ts`** เพื่อให้ canonical, hreflang และรูปพรีวิว
  ครบเท่ากันทุกหน้า อย่าเขียน `alternates` เองรายหน้า

การนำขึ้น production ดูที่ [DEPLOY.md](./DEPLOY.md)
