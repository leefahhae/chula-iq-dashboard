// ---------------------------------------------------------------------------
// Chula IQ – Tutor Admin Dashboard
// Shared domain types. These map closely to what real DB tables would look
// like (e.g. Postgres via Prisma/Supabase) so the Context store in store.tsx
// can later be swapped for real fetch()/API calls with minimal changes.
// ---------------------------------------------------------------------------

export type PaymentMethod = "cash" | "transfer";

export type CourseType = "private" | "group";

export type AttendanceStatus = "present" | "absent" | "leave";

export interface Student {
  id: string;
  name: string; // ชื่อเล่น/ชื่อเต็มของนักเรียน
  grade: string; // เช่น ม.6, ม.4
  parentName: string;
  parentLine: string; // LINE ID / ชื่อบัญชี LINE (ข้อความอ้างอิงเฉยๆ ไม่ใช่ตัวที่ใช้ส่งอัตโนมัติ)
  parentFacebook: string; // ชื่อหรือลิงก์ Facebook
  phone?: string;
  /**
   * LINE Messaging API userId ของผู้ปกครอง — ได้มาหลังจากผู้ปกครองแอดไลน์ OA
   * ของสถาบันแล้วแอดมินเชื่อมบัญชีให้ผ่านหน้า "แจ้งยอดผู้ปกครอง" (ดู
   * LineInboxEntry ด้านล่าง) มีค่านี้แล้วถึงจะกดปุ่ม "ส่งผ่าน LINE อัตโนมัติ" ได้
   */
  lineUserId?: string;
}

/**
 * A parent's LINE account after they add the institute's Official Account as
 * a friend or send it a message, before an admin has manually matched it to a
 * student record. Populated by app/api/line/webhook; resolved (and removed)
 * once linked via app/api/line/inbox/[id].
 */
export interface LineInboxEntry {
  id: string;
  lineUserId: string;
  messageText: string;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string; // เช่น Chemistry ม.6 (Private)
  subject: string;
  type: CourseType;
  // --- Private class pricing ---
  hourlyRate?: number; // บาทต่อชั่วโมง
  defaultMonthlyHours?: number; // โควตาชั่วโมง/เดือน ค่าเริ่มต้น
  // --- Group class pricing ---
  monthlyFee?: number; // ค่าเรียนเหมาจ่ายต่อเดือน (ปรับได้)
}

/**
 * An Enrollment links a Student to a Course.
 * - Private: billed by hours attended, checked against monthlyHours (quota),
 *   editable per student. Hours-used-this-month is *derived* from the dated
 *   attendance log (see getHoursUsedThisMonth in lib/analytics.ts) rather
 *   than stored here, so it rolls over to a new month automatically.
 * - Group: tracks attendance stats only; monthlyFee editable per enrollment
 *   (so a "ปิดเทอม" intensive course can charge more for the same subject).
 */
export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  monthlyHours?: number; // override quota for private classes
  monthlyFee?: number; // override flat fee for group classes
  /** @deprecated unused for billing/display — hours are derived from the attendance log instead. Kept only so older seed/persisted records still type-check. */
  hoursUsed: number;
  sessionHours: number; // hours counted per "present" tick (private), e.g. 1.5
}

export interface AttendanceRecord {
  id: string;
  enrollmentId: string;
  date: string; // ISO date
  status: AttendanceStatus;
  hoursCounted: number; // 0 for absent/leave, sessionHours for present (private)
}

export interface Transaction {
  id: string;
  studentId: string;
  courseId: string;
  amount: number;
  method: PaymentMethod;
  slipImage?: string; // data URL locally; object-storage URL in production
  note?: string;
  createdAt: string; // ISO datetime
}

export type ExpenseCategory =
  | "payroll"
  | "materials"
  | "utilities"
  | "marketing"
  | "misc";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  method: PaymentMethod;
  receiptImage?: string; // data URL locally; object-storage URL in production
  createdAt: string; // ISO datetime
}

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  payroll: "ค่าจ้าง/ค่าตัวติวเตอร์",
  materials: "ค่าอุปกรณ์/ชีทเรียน/หนังสือ",
  utilities: "ค่าน้ำ/ค่าไฟ",
  marketing: "ค่าการตลาด/โฆษณา",
  misc: "อื่นๆ",
};

// Pantone pastel palette (677 rose / 9320 pink / 9241 peach / 14-3612 orchid /
// 9044 mint) — keeps the expense pie chart consistent with the site's
// neo-brutalist reskin instead of the old vivid brand colors.
export const EXPENSE_CATEGORY_COLOR: Record<ExpenseCategory, string> = {
  payroll: "#E8A9BC",
  materials: "#F6D8DC",
  utilities: "#F3C6A4",
  marketing: "#C7AEDD",
  misc: "#A9D9C0",
};
