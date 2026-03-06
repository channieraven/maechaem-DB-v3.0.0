# Mae Chaem Agroforestry DB

ระบบจัดการข้อมูลแปลงเกษตรแม่แจ่ม — ฐานข้อมูลโครงการปลูกป่าอเนกประสงค์ในพื้นที่ คทช. แม่แจ่ม

🌐 **Live:** [maechaem-db-rfd.work](https://maechaem-db-rfd.work)

---

## 🚀 Tech Stack

### Frontend & Framework

| เทคโนโลยี | เวอร์ชัน | หน้าที่ |
|---|---|---|
| **Next.js** | 16 | เฟรมเวิร์กหลัก (App Router) — ทั้ง UI และ API routes |
| **React** | 19 | ไลบรารีสร้าง Component (Dashboard, ปุ่มกด, ตาราง) |
| **Tailwind CSS** | v4 (Oxide Engine) | Utility-first CSS — เขียนสไตล์รวดเร็ว ไม่มี config file |

### 🌍 GIS & Mapping

| เทคโนโลยี | หน้าที่ |
|---|---|
| **MapLibre GL JS** | เอนจินเรนเดอร์แผนที่แบบ Vector/Raster ลื่นไหลและปรับแต่งได้อิสระ |
| **React Map GL** | React wrapper สำหรับ MapLibre GL JS |
| **`@geomatico/maplibre-cog-protocol`** | ถอดรหัส Cloud Optimized GeoTIFF (COG) โดยตรงในเบราว์เซอร์ ไม่ต้องผ่าน tile server |
| **rio cogeo** *(local tool)* | CLI บน OSGeo4W สำหรับแปลงไฟล์โดรน → Web-Optimized COG และลบขอบดำ (`--nodata 0`) |

### 🔐 Backend & Data

| เทคโนโลยี | หน้าที่ |
|---|---|
| **Clerk** | Authentication & user management — ปกป้องหน้า Dashboard จากคนนอก |
| **Neon DB** (Serverless PostgreSQL) | ฐานข้อมูลหลักสำหรับข้อมูลแปลงเกษตร รหัสแปลง และชื่อเกษตรกร |

### ☁️ Cloud Infrastructure

| เทคโนโลยี | หน้าที่ |
|---|---|
| **Cloudflare Pages** (Edge Network) | โฮสต์ Next.js ด้วยความเร็ว Edge — เซิร์ฟเวอร์กระจายทั่วโลก รวมถึงไทย |
| **Cloudflare R2** | Object Storage สำหรับไฟล์ภาพโดรน COG ขนาดใหญ่ — ส่ง tile ไปแสดงผลร่วมกับ COG Protocol |
| **Cloudflare DNS** | จัดการโดเมน `maechaem-db-rfd.work` |

---

## Getting Started

1. คัดลอกไฟล์ตัวอย่าง environment variables แล้วกรอกค่าของคุณ:

   ```bash
   cp .env.local.example .env.local
   ```

2. ติดตั้ง dependencies และเริ่ม development server:

   ```bash
   npm install
   npm run dev
   ```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

---

## Environment Variables

ดูรายละเอียดทั้งหมดใน `.env.local.example`:

| Variable | หน้าที่ |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` | Neon connection string สำหรับ Hyperdrive emulation (local dev & Cloudflare CI build) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Svix signing secret สำหรับ Clerk webhook |
| `NEXT_PUBLIC_DRONE_COG_URL` | URL ของไฟล์ COG บน Cloudflare R2 (สำหรับ overlay ภาพโดรนบนแผนที่) |

---

## Deploy on Cloudflare Pages

โปรเจกต์นี้ configured สำหรับ Cloudflare Pages ผ่าน [`@opennextjs/cloudflare`](https://github.com/opennextjs/opennextjs-cloudflare)

### คำสั่ง

```bash
# Build สำหรับ Cloudflare Workers
npm run build

# Preview ก่อน deploy
npm run preview

# Deploy ขึ้น Cloudflare Pages
npm run deploy
```

### ขั้นตอน Deploy

1. รัน `wrangler login` เพื่อ authenticate กับ Cloudflare
2. ตั้งค่า environment variables ใน Cloudflare Pages Dashboard → **Settings → Environment Variables**

   | Variable | ค่าที่ต้องตั้ง |
   |---|---|
   | `DATABASE_URL` | Neon connection string |
   | `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` | Neon connection string เดียวกับ `DATABASE_URL` — จำเป็นสำหรับ Hyperdrive emulation ระหว่าง CI build |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
   | `CLERK_SECRET_KEY` | Clerk secret key |
   | `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |
   | `NEXT_PUBLIC_DRONE_COG_URL` | URL ของไฟล์ COG บน R2 |

   > **หมายเหตุ:** ถ้าไม่ตั้ง `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` ใน Cloudflare build environment, CI จะ error: *"no local hyperdrive connection string"*

3. รัน `npm run deploy` หรือ connect GitHub repository ใน Cloudflare Pages Dashboard เพื่อ auto-deploy เมื่อ push ไปที่ branch `main`

> ไฟล์ `wrangler.jsonc` เก็บ configuration ของ Cloudflare Workers/Pages รวมถึง R2 bucket binding สำหรับ cache
