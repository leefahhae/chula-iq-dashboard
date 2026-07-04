# Chula IQ — Tutor Admin Dashboard

ระบบหลังบ้านสถาบันกวดวิชา สร้างด้วย Next.js (App Router) + TypeScript + Tailwind CSS + Radix UI (สไตล์ shadcn/ui)

## วิธีรันโปรเจกต์

```bash
npm install
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

### ตั้งรหัสผ่านเข้าระบบ (สำคัญ)

เว็บนี้มีหน้า Login กันคนนอกเข้ามาดูข้อมูลการเงิน โดยใช้รหัสผ่านเดียวที่แอดมินทุกคนใช้ร่วมกัน (ยังไม่ใช่ระบบบัญชีผู้ใช้แยกรายคน) ต้องตั้งค่า Environment Variable ชื่อ `APP_PASSWORD` ก่อนถึงจะเข้าเว็บได้:

- **รันในเครื่อง**: สร้างไฟล์ `.env.local` ที่ root โปรเจกต์ ใส่ `APP_PASSWORD=รหัสผ่านที่ต้องการ`
- **บน Vercel**: ไปที่ Project → Settings → Environment Variables → เพิ่ม `APP_PASSWORD` ใส่ค่ารหัสผ่าน → Save แล้ว redeploy

ถ้ายังไม่ตั้งค่านี้ หน้าเว็บจะเด้งไปหน้า Login ตลอดและแจ้งว่ายังไม่ได้ตั้งรหัสผ่าน (เป็นการป้องกันไม่ให้ข้อมูลเปิดเผยโดยไม่ตั้งใจ)

> โค้ดถูกเขียนและตรวจสอบด้วยมือ (manual review) แต่ยังไม่ได้รัน `npm install` / `npm run build` จริงในเครื่องที่พัฒนา เนื่องจากแซนด์บ็อกซ์ไม่มีสิทธิ์เข้าถึง npm registry — กรุณารัน `npm run build` อีกครั้งบนเครื่องของคุณเพื่อดักจับ error ที่อาจหลุดรอดการตรวจสอบด้วยตา แล้วแจ้งกลับมาได้หากเจอปัญหา

## โครงสร้างโปรเจกต์

- `app/(app)/page.tsx` — Dashboard ภาพรวมการเงิน (รายรับ/รายจ่าย/กำไรสุทธิ)
- `app/(app)/payment-entry/page.tsx` — ฟอร์มบันทึกการรับเงิน + ประวัติ 5 รายการล่าสุด
- `app/(app)/attendance/page.tsx` — เช็คชื่อและคำนวณยอดเงินอัตโนมัติ (คลาสเดี่ยว/คลาสกลุ่ม)
- `app/(app)/notifications/page.tsx` — สร้าง/คัดลอกข้อความแจ้งยอดผู้ปกครอง + เช็คคนค้างชำระ
- `app/(app)/expenses/page.tsx` — บันทึกและจัดการรายจ่ายของสถาบัน
- `app/(app)/manage/page.tsx` — เพิ่ม/ลบนักเรียนและคอร์ส
- `app/(app)/layout.tsx` — ครอบทุกหน้าในกลุ่มนี้ด้วย `StoreProvider` + แถบเมนู (`AppShell`)
- `app/login/page.tsx`, `app/api/login`, `app/api/logout`, `middleware.ts`, `lib/auth.ts` — ระบบล็อกอินรหัสผ่านเดียว
- `lib/store.tsx` — Context กลางที่เก็บ state ทั้งหมด (นักเรียน, คอร์ส, ธุรกรรม, รายจ่าย ฯลฯ)
- `lib/analytics.ts` — คำนวณยอดรวม/ยอดค้างชำระ/ชั่วโมงเรียนของเดือนปัจจุบัน
- `lib/types.ts` — Type ทั้งหมดที่ตรงกับโครงสร้างตารางฐานข้อมูลในอนาคต
- `lib/mock-data.ts` — ข้อมูลตัวอย่างสำหรับทดลองใช้งาน
- `components/ui/*` — UI primitives สไตล์ shadcn (Button, Card, Dialog, Select ฯลฯ)

### หมายเหตุเรื่องระบบล็อกอิน

ตอนนี้เป็นรหัสผ่านเดียวที่แอดมินทุกคนใช้ร่วมกัน (ตั้งผ่าน `APP_PASSWORD`) ป้องกันคนนอกสุ่มเปิดลิงก์แล้วเห็นข้อมูลการเงินได้ แต่ไม่ใช่ระบบบัญชีผู้ใช้แยกรายคน ไม่มี audit log ว่าใครทำอะไร ถ้าต้องการแยกบัญชีแอดมินแต่ละคน/ดูประวัติการแก้ไข ควรอัปเกรดเป็นระบบ auth จริง (เช่น NextAuth/Auth.js) ที่ผูกกับฐานข้อมูลผู้ใช้

## ต่อยอดเชื่อมฐานข้อมูลจริง

ทุกฟังก์ชันเปลี่ยนแปลงข้อมูล (`addTransaction`, `addExpense`, `markAttendance`, `updateEnrollmentHours`, `updateEnrollmentFee`, `updateCoursePrice`) รวมศูนย์อยู่ใน `lib/store.tsx` จุดเดียว — เมื่อจะต่อฐานข้อมูลจริง (Postgres/Supabase/Prisma) ให้แทนที่ `setState(...)` ภายในแต่ละฟังก์ชันด้วย `fetch("/api/...")` หรือ Server Action แล้ว refetch/อัปเดต state ตามผลลัพธ์ ส่วน component ทั้งหมดเรียกผ่าน `useStore()` เหมือนเดิมโดยไม่ต้องแก้โค้ดหน้าอื่น

รูปสลิป/ใบเสร็จตอนนี้เก็บเป็น base64 data URL ใน localStorage (สำหรับ demo) — ตอนต่อ production ให้เปลี่ยน `fileToDataUrl` ใน `lib/utils.ts` เป็นการอัปโหลดไปยัง object storage จริง (S3 / Supabase Storage) แล้วเก็บ URL แทน
