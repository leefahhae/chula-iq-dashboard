# Chula IQ — Tutor Admin Dashboard

ระบบหลังบ้านสถาบันกวดวิชา สร้างด้วย Next.js (App Router) + TypeScript + Tailwind CSS + Radix UI (สไตล์ shadcn/ui)

## วิธีรันโปรเจกต์

```bash
npm install
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

> โค้ดถูกเขียนและตรวจสอบด้วยมือ (manual review) แต่ยังไม่ได้รัน `npm install` / `npm run build` จริงในเครื่องที่พัฒนา เนื่องจากแซนด์บ็อกซ์ไม่มีสิทธิ์เข้าถึง npm registry — กรุณารัน `npm run build` อีกครั้งบนเครื่องของคุณเพื่อดักจับ error ที่อาจหลุดรอดการตรวจสอบด้วยตา แล้วแจ้งกลับมาได้หากเจอปัญหา

## โครงสร้างโปรเจกต์

- `app/page.tsx` — Dashboard ภาพรวมการเงิน (รายรับ/รายจ่าย/กำไรสุทธิ)
- `app/payment-entry/page.tsx` — ฟอร์มบันทึกการรับเงิน + ประวัติ 5 รายการล่าสุด
- `app/attendance/page.tsx` — เช็คชื่อและคำนวณยอดเงินอัตโนมัติ (คลาสเดี่ยว/คลาสกลุ่ม)
- `app/notifications/page.tsx` — สร้าง/คัดลอกข้อความแจ้งยอดผู้ปกครอง
- `app/expenses/page.tsx` — บันทึกและจัดการรายจ่ายของสถาบัน
- `lib/store.tsx` — Context กลางที่เก็บ state ทั้งหมด (นักเรียน, คอร์ส, ธุรกรรม, รายจ่าย ฯลฯ)
- `lib/types.ts` — Type ทั้งหมดที่ตรงกับโครงสร้างตารางฐานข้อมูลในอนาคต
- `lib/mock-data.ts` — ข้อมูลตัวอย่างสำหรับทดลองใช้งาน
- `components/ui/*` — UI primitives สไตล์ shadcn (Button, Card, Dialog, Select ฯลฯ)

## ต่อยอดเชื่อมฐานข้อมูลจริง

ทุกฟังก์ชันเปลี่ยนแปลงข้อมูล (`addTransaction`, `addExpense`, `markAttendance`, `updateEnrollmentHours`, `updateEnrollmentFee`, `updateCoursePrice`) รวมศูนย์อยู่ใน `lib/store.tsx` จุดเดียว — เมื่อจะต่อฐานข้อมูลจริง (Postgres/Supabase/Prisma) ให้แทนที่ `setState(...)` ภายในแต่ละฟังก์ชันด้วย `fetch("/api/...")` หรือ Server Action แล้ว refetch/อัปเดต state ตามผลลัพธ์ ส่วน component ทั้งหมดเรียกผ่าน `useStore()` เหมือนเดิมโดยไม่ต้องแก้โค้ดหน้าอื่น

รูปสลิป/ใบเสร็จตอนนี้เก็บเป็น base64 data URL ใน localStorage (สำหรับ demo) — ตอนต่อ production ให้เปลี่ยน `fileToDataUrl` ใน `lib/utils.ts` เป็นการอัปโหลดไปยัง object storage จริง (S3 / Supabase Storage) แล้วเก็บ URL แทน
