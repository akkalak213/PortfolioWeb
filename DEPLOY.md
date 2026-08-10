# Deploy ขึ้น Railway

## โครงสร้างที่ต้องมีบน Railway

โปรเจกต์เดียวมีสอง service:

| Service | คืออะไร |
|---|---|
| **Postgres** | ฐานข้อมูล เพิ่มจาก `+ New` → `Database` → `PostgreSQL` |
| **Web** | ตัวเว็บ deploy จาก GitHub repo นี้ Railway จะเจอ `Dockerfile` เอง |

---

## 1. Environment variables ของ service `Web`

ตั้งใน Railway → service `Web` → **Variables**

### จำเป็น

| ตัวแปร | ค่าที่ใส่ |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` — พิมพ์แบบนี้ตรง ๆ Railway จะอ้างอิงให้เอง |
| `AUTH_SECRET` | สร้างด้วย `npx auth secret` แล้วคัดลอกมาวาง |
| `AUTH_URL` | โดเมนจริง เช่น `https://alexanproduction.com` |
| `NEXT_PUBLIC_SITE_URL` | โดเมนเดียวกับ `AUTH_URL` |

> **ต้องใช้ `${{Postgres.DATABASE_URL}}` ไม่ใช่ค่า public ที่ลงท้าย `proxy.rlwy.net`**
> ค่า internal วิ่งในเครือข่ายของ Railway เอง เร็วกว่าและไม่เสียค่า egress
> ส่วนค่า public มีไว้ต่อจากเครื่องตัวเองเท่านั้น

### ไฟล์และอีเมล

| ตัวแปร | หมายเหตุ |
|---|---|
| `R2_ACCOUNT_ID` `R2_ACCESS_KEY_ID` `R2_SECRET_ACCESS_KEY` `R2_BUCKET` `R2_PUBLIC_URL` | ไม่ตั้ง = อัปโหลดรูปไม่ได้ แต่เว็บยังทำงานปกติ |
| `RESEND_API_KEY` `MAIL_FROM` `MAIL_TO` | ไม่ตั้ง = ฟอร์มยังบันทึกลงฐานข้อมูล แต่ไม่มีเมลแจ้งเตือน |
| `NEXT_PUBLIC_GA_ID` | ไม่ตั้ง = ไม่โหลดสคริปต์ Google Analytics เลย |

### ค่าที่ต้องใส่ตอน build ด้วย

`NEXT_PUBLIC_*` ถูกฝังเข้า bundle ตั้งแต่ตอน build ไม่ใช่อ่านตอนรัน
ใน Railway ให้เพิ่มเป็น **Build argument** ด้วย (Settings → Build → Build Arguments):

```
NEXT_PUBLIC_SITE_URL=https://alexanproduction.com
NEXT_PUBLIC_GA_ID=
```

ถ้าลืมข้อนี้ ลิงก์ในเว็บจะชี้กลับไปที่ `http://localhost:3000`

---

## 2. Migration

ไม่ต้องรันเอง — `Dockerfile` สั่ง `prisma migrate deploy` ก่อนสตาร์ตทุกครั้ง
ถ้า migration ล้มเหลว container จะไม่ขึ้น ซึ่งตั้งใจให้เป็นแบบนั้น
ดีกว่าเปิดเว็บด้วย schema ที่ไม่ตรงกับโค้ด

**สร้างผู้ดูแลคนแรก** ต้องทำครั้งเดียวหลัง deploy สำเร็จ จากเครื่องตัวเอง:

```bash
DATABASE_URL="<ค่า public ที่ลงท้าย proxy.rlwy.net>" SEED_ADMIN_PASSWORD="รหัสที่ต้องการ" npm run db:seed
```

---

## 3. Health check

ตั้งไว้แล้วใน `railway.json` ชี้ไปที่ `/api/health`
คืน `503` เมื่อต่อฐานข้อมูลไม่ได้ Railway จะไม่สลับ traffic มาที่ container ที่ยังไม่พร้อม

เรียกดูเองได้:

```bash
curl https://alexanproduction.com/api/health
```

---

## 4. โดเมนและ CDN

1. Railway → Settings → **Networking** → Custom Domain → ใส่โดเมน
2. เอา DNS ไปไว้ที่ **Cloudflare** แล้วเปิดเมฆส้ม (proxied)
   Railway ไม่มี CDN ในตัว — Cloudflare จะช่วยแคชไฟล์ static และรูป
3. Cloudflare → SSL/TLS → ตั้งเป็น **Full (strict)**

### CORS ของ R2 ต้องเพิ่มโดเมนจริง

หลังมีโดเมนแล้ว กลับไปแก้ CORS ของ bucket ไม่งั้นอัปโหลดจากหลังบ้าน production จะโดนบล็อก:

```json
[
  {
    "AllowedOrigins": ["https://alexanproduction.com", "http://localhost:3000"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["content-type"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 5. เช็กลิสต์ก่อนเปิดให้คนนอกเข้า

- [ ] `/api/health` คืน `status: ok`
- [ ] เข้า `/admin` ได้ และเปลี่ยนรหัสผ่านผู้ดูแลแล้ว
- [ ] อัปโหลดรูปที่ `/admin/media` สำเร็จ (ทดสอบ CORS ของโดเมนจริง)
- [ ] ส่งฟอร์มติดต่อแล้วได้อีเมลแจ้งเตือน
- [ ] แก้ข้อมูลบริษัทที่ `/admin/settings` ให้เป็นข้อมูลจริง — ค่า seed เป็นตัวอย่างทั้งหมด
- [ ] ลบผลงานและรีวิวตัวอย่างที่มาจาก seed
- [ ] เอา `picsum.photos` ออกจาก `next.config.ts` เมื่อเปลี่ยนรูปครบแล้ว
- [ ] ส่ง `https://alexanproduction.com/sitemap.xml` เข้า Google Search Console
