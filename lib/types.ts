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
  parentLine: string; // LINE ID / ชื่อบัญชี LINE
  parentFacebook: string; // ชื่อหรือลิงก์ Facebook
  phone?: string;
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
 * An Enrollment links a Student to a Course for the *current* billing month.
 * - Private: tracks hoursUsed against monthlyHours (quota), editable per student.
 * - Group: tracks attendance stats only; monthlyFee editable per enrollment
 *   (so a "ปิดเทอม" intensive course can charge more for the same subject).
 */
export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  monthlyHours?: number; // override quota for private classes
  monthlyFee?: number; // override flat fee for group classes
  hoursUsed: number; // accumulated hours this billing month (private)
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

export const EXPENSE_CATEGORY_COLOR: Record<ExpenseCategory, string> = {
  payroll: "#f9457f",
  materials: "#ff9fbe",
  utilities: "#f59e0b",
  marketing: "#38bdf8",
  misc: "#a78bfa",
};
