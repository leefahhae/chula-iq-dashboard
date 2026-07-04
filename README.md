# Chula IQ — Tutor Admin Dashboard

ระบบหลังบ้านสถาบันกวดวิชา สร้างด้วย Next.js (App Router) + TypeScript + Tailwind CSS + Radix UI (สไตล์ shadcn/ui)

## วิธีรันโปรเจกต์

```bash
npm install
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

### ตั้งค่าฐานข้อมูล Supabase (จำเป็น — ต้องทำก่อนใช้งานจริง)

ระบบนี้บันทึกข้อมูลนักเรียน คอร์ส รายรับ รายจ่าย ฯลฯ ลงฐานข้อมูล Postgres จริงผ่าน Supabase แล้ว (ไม่ใช่ localStorage อีกต่อไป) ต้องตั้งค่าตามขั้นตอนนี้ก่อนเปิดเว็บครั้งแรก:

1. **สร้างโปรเจกต์ Supabase**: ไปที่ [supabase.com](https://supabase.com) → สมัคร/ล็อกอิน → กด "New project" → ตั้งชื่อโปรเจกต์และรหัสผ่านฐานข้อมูล (จดไว้ อาจใช้ภายหลัง) → รอสักครู่ให้โปรเจกต์สร้างเสร็จ
2. **รันไฟล์ schema**: เปิดเมนู "SQL Editor" ในแดชบอร์ด Supabase → "New query" → คัดลอกเนื้อหาทั้งหมดจากไฟล์ `supabase/schema.sql` ในโปรเจกต์นี้ไปวาง → กด "Run" — จะได้ตาราง `students`, `courses`, `enrollments`, `attendance`, `transactions`, `expenses` ครบ
3. **คัดลอกคีย์เชื่อมต่อ**: ไปที่ Project Settings (ไอคอนเฟือง) → API → คัดลอกค่า **Project URL** และ **service_role secret** (ไม่ใช่ `anon` key)
4. **ตั้งค่า Environment Variables**:
   - **รันในเครื่อง**: คัดลอกไฟล์ `.env.example` เป็น `.env.local` แล้วใส่ค่าจริงลงในตัวแปร `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_PASSWORD`
   - **บน Vercel**: Project → Settings → Environment Variables → เพิ่มทั้ง 3 ตัวแปรข้างต้น → Save แล้ว redeploy

⚠️ `SUPABASE_SERVICE_ROLE_KEY` ข้าม Row Level Security ได้ทั้งหมด ห้ามใส่ prefix `NEXT_PUBLIC_` และห้าม commit ค่าจริงลง git (โค้ดฝั่ง client ไม่เคยเห็นคีย์นี้เลย ถูกใช้เฉพาะใน API routes ฝั่ง server เท่านั้น ผ่าน `lib/supabase.ts` ที่ import ด้วย `server-only`)

ถ้ายังไม่ได้ตั้งค่า Supabase ให้ครบ หน้าเว็บจะขึ้นข้อความแจ้ง error พร้อมปุ่ม "ลองใหม่" แทนที่จะขึ้นข้อมูลเปล่าเงียบๆ

### ตั้งรหัสผ่านเข้าระบบ (สำคัญ)

เว็บนี้มีหน้า Login กันคนนอกเข้ามาดูข้อมูลการเงิน โดยใช้รหัสผ่านเดียวที่แอดมินทุกคนใช้ร่วมกัน (ยังไม่ใช่ระบบบัญชีผู้ใช้แยกรายคน) ตั้งผ่าน Environment Variable ชื่อ `APP_PASSWORD` เหมือนขั้นตอนด้านบน

ถ้ายังไม่ตั้งค่านี้ หน้าเว็บจะเด้งไปหน้า Login ตลอดและแจ้งว่ายังไม่ได้ตั้งรหัสผ่าน (เป็นการป้องกันไม่ให้ข้อมูลเปิดเผยโดยไม่ตั้งใจ)

### ตั้งค่า LINE Official Account (ไม่บังคับ — เปิดใช้ปุ่ม "ส่งผ่าน LINE อัตโนมัติ")

ถ้าไม่ตั้งค่านี้ เว็บยังใช้งานได้ปกติทุกอย่าง แค่ปุ่ม "ส่งผ่าน LINE อัตโนมัติ" ในหน้าแจ้งยอดผู้ปกครองจะยังใช้ไม่ได้ (ใช้วิธีคัดลอกข้อความไปวางเองแทนได้เหมือนเดิม)

1. **สร้าง LINE Official Account + Messaging API channel**: ไปที่ [developers.line.biz](https://developers.line.biz) → สมัคร/ล็อกอินด้วยบัญชี LINE → สร้าง Provider → สร้าง Channel ประเภท **Messaging API** → ตั้งชื่อ OA (เช่น "Chula IQ")
2. **ปิด auto-reply ของ LINE**: ไปที่ [LINE Official Account Manager](https://manager.line.biz) → เลือก OA ของคุณ → Settings → Response settings → ปิด "Greeting messages" และ "Auto-response messages" (ไม่งั้น LINE จะตอบข้อความอัตโนมัติทับ reply ของระบบเรา)
3. **คัดลอกคีย์**: กลับไปที่ LINE Developers Console → เลือก channel → แท็บ **Messaging API**
   - เลื่อนลงหา **Channel access token** → กด "Issue" ถ้ายังไม่มี → คัดลอกเก็บไว้
   - แท็บ **Basic settings** → คัดลอก **Channel secret**
4. **ตั้ง Webhook URL**: กลับไปแท็บ Messaging API → ช่อง Webhook URL → ใส่ `https://<โดเมนเว็บของคุณ>/api/line/webhook` → กด "Update" → กด "Verify" (ควรขึ้นสำเร็จหลังตั้งค่า environment variables ในข้อถัดไปและ deploy แล้ว) → เปิดสวิตช์ "Use webhook"
5. **ตั้งค่า Environment Variables** (เหมือนขั้นตอน Supabase ด้านบน): เพิ่ม `LINE_CHANNEL_SECRET` และ `LINE_CHANNEL_ACCESS_TOKEN` ทั้งใน `.env.local` (ถ้ารันในเครื่อง) และใน Vercel → Environment Variables → redeploy
6. **ให้ผู้ปกครองแอดเพื่อน**: หา QR code ของ OA ได้ที่ LINE Official Account Manager → Home → แชร์ QR ให้ผู้ปกครอง หรือใส่ในข้อความแจ้งยอดที่ส่งครั้งแรก
7. **เชื่อมบัญชีผู้ปกครองกับนักเรียน**: หลังผู้ปกครองแอดเพื่อน/พิมพ์ข้อความมา จะเห็นการ์ด "ข้อความ LINE เข้าใหม่" ที่ด้านบนของหน้า "แจ้งยอดผู้ปกครอง" — เลือกนักเรียนที่ตรงกันแล้วกด "เชื่อมบัญชี" ครั้งเดียวต่อผู้ปกครองหนึ่งคน จากนั้นปุ่ม "ส่งผ่าน LINE อัตโนมัติ" จะใช้งานได้กับนักเรียนคนนั้น

> โค้ดถูกเขียนและตรวจสอบด้วยมือ (manual review) แต่ยังไม่ได้รัน `npm install` / `npm run build` จริงในเครื่องที่พัฒนา เนื่องจากแซนด์บ็อกซ์ไม่มีสิทธิ์เข้าถึง npm registry — กรุณารัน `npm run build` อีกครั้งบนเครื่องของคุณเพื่อดักจับ error ที่อาจหลุดรอดการตรวจสอบด้วยตา แล้วแจ้งกลับมาได้หากเจอปัญหา

## โครงสร้างโปรเจกต์

- `app/(app)/page.tsx` — Dashboard ภาพรวมการเงิน (รายรับ/รายจ่าย/กำไรสุทธิ)
- `app/(app)/payment-entry/page.tsx` — ฟอร์มบันทึกการรับเงิน + ประวัติ 5 รายการล่าสุด
- `app/(app)/attendance/page.tsx` — เช็คชื่อและคำนวณยอดเงินอัตโนมัติ (คลาสเดี่ยว/คลาสกลุ่ม)
- `app/(app)/notifications/page.tsx` — สร้าง/คัดลอกข้อความแจ้งยอดผู้ปกครอง + เช็คคนค้างชำระ + ส่งผ่าน LINE อัตโนมัติ + ค้นหานักเรียน
- `app/(app)/expenses/page.tsx` — บันทึกและจัดการรายจ่ายของสถาบัน + ค้นหาในประวัติรายจ่าย
- `app/(app)/manage/page.tsx` — เพิ่ม/ลบนักเรียนและคอร์ส + ค้นหาในรายการ
- `app/api/export/route.ts` — สร้างไฟล์ Excel (.xlsx) สรุปรายรับ-รายจ่ายทั้งหมด ปุ่มดาวน์โหลดอยู่ที่หน้า Dashboard
- `app/api/line/webhook/route.ts`, `app/api/line/push/route.ts`, `app/api/line/inbox/**`, `lib/line.ts`, `components/notifications/line-inbox-panel.tsx` — ระบบส่งแจ้งยอดผู้ปกครองผ่าน LINE อัตโนมัติ (ดูวิธีตั้งค่าด้านบน)
- `app/(app)/layout.tsx` — ครอบทุกหน้าในกลุ่มนี้ด้วย `StoreProvider` + แถบเมนู (`AppShell`)
- `app/login/page.tsx`, `app/api/login`, `app/api/logout`, `middleware.ts`, `lib/auth.ts` — ระบบล็อกอินรหัสผ่านเดียว
- `supabase/schema.sql` — คำสั่งสร้างตารางฐานข้อมูลทั้งหมด (รันครั้งเดียวตอนตั้งโปรเจกต์ Supabase)
- `lib/supabase.ts` — สร้าง Supabase client ฝั่ง server (ใช้ service-role key, import ด้วย `server-only` กันไม่ให้หลุดไปฝั่ง client)
- `lib/db-mappers.ts` — แปลงข้อมูลระหว่างคอลัมน์ฐานข้อมูล (snake_case) กับ type ฝั่งแอป (camelCase)
- `app/api/**/route.ts` — API routes ที่คุยกับ Supabase จริง (students, courses, enrollments, attendance, transactions, expenses) — เป็นจุดเดียวที่แตะฐานข้อมูลได้
- `lib/store.tsx` — Context กลางที่เก็บ state ในเบราว์เซอร์ ดึงข้อมูลเริ่มต้นจาก `GET /api/data` แล้วทุกฟังก์ชันแก้ไขข้อมูล (`addTransaction`, `markAttendance` ฯลฯ) จะเรียก API route ก่อน แล้วค่อยอัปเดต state เมื่อบันทึกลงฐานข้อมูลสำเร็จ
- `lib/analytics.ts` — คำนวณยอดรวม/ยอดค้างชำระ/ชั่วโมงเรียนของเดือนปัจจุบัน
- `lib/types.ts` — Type ทั้งหมดที่ตรงกับโครงสร้างตารางฐานข้อมูล
- `components/ui/*` — UI primitives สไตล์ shadcn (Button, Card, Dialog, Select ฯลฯ)

### หมายเหตุเรื่องระบบล็อกอิน

ตอนนี้เป็นรหัสผ่านเดียวที่แอดมินทุกคนใช้ร่วมกัน (ตั้งผ่าน `APP_PASSWORD`) ป้องกันคนนอกสุ่มเปิดลิงก์แล้วเห็นข้อมูลการเงินได้ แต่ไม่ใช่ระบบบัญชีผู้ใช้แยกรายคน ไม่มี audit log ว่าใครทำอะไร ถ้าต้องการแยกบัญชีแอดมินแต่ละคน/ดูประวัติการแก้ไข ควรอัปเกรดเป็นระบบ auth จริง (เช่น NextAuth/Auth.js) ที่ผูกกับฐานข้อมูลผู้ใช้

## หมายเหตุเรื่องรูปสลิป/ใบเสร็จ

รูปสลิป/ใบเสร็จตอนนี้ยังเก็บเป็น base64 data URL ในคอลัมน์ข้อความของฐานข้อมูล (เพื่อลดความซับซ้อนตอนตั้งค่าครั้งแรก) วิธีนี้ใช้งานได้จริงแต่จะทำให้แถวข้อมูลมีขนาดใหญ่ขึ้นถ้ารูปเยอะ ถ้าต้องการประหยัดพื้นที่ฐานข้อมูลในระยะยาว ให้เปลี่ยน `fileToDataUrl` ใน `lib/utils.ts` เป็นการอัปโหลดไปยัง Supabase Storage แล้วเก็บ URL แทน base64 ตรงๆ

## แก้ไขข้อมูลที่คีย์ผิด

หน้า "บันทึกรับเงิน" และ "รายจ่าย" มีปุ่มแก้ไข/ลบในตารางประวัติ ใช้ตอนคีย์ยอดเงิน เลือกนักเรียน หรือหมวดหมู่ผิดได้ทันทีโดยไม่ต้องลบแล้วสร้างใหม่ทั้งรายการ
