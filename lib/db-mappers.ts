import type {
  Student,
  Course,
  Enrollment,
  AttendanceRecord,
  Transaction,
  Expense,
} from "./types";

// ---------------------------------------------------------------------------
// Supabase/Postgres uses snake_case column names (standard SQL convention);
// the app's TypeScript types use camelCase. These helpers are the single
// place that translates between the two, so API routes never hand-roll the
// mapping and risk a typo'd column name.
// ---------------------------------------------------------------------------

export function studentFromDb(row: any): Student {
  return {
    id: row.id,
    name: row.name,
    grade: row.grade,
    parentName: row.parent_name,
    parentLine: row.parent_line,
    parentFacebook: row.parent_facebook,
    phone: row.phone ?? undefined,
  };
}

export function studentToDb(s: {
  id: string;
  name: string;
  grade: string;
  parentName: string;
  parentLine: string;
  parentFacebook: string;
  phone?: string;
}) {
  return {
    id: s.id,
    name: s.name,
    grade: s.grade,
    parent_name: s.parentName,
    parent_line: s.parentLine,
    parent_facebook: s.parentFacebook,
    phone: s.phone ?? null,
  };
}

export function courseFromDb(row: any): Course {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    type: row.type,
    hourlyRate: row.hourly_rate ?? undefined,
    defaultMonthlyHours: row.default_monthly_hours ?? undefined,
    monthlyFee: row.monthly_fee ?? undefined,
  };
}

export function courseToDb(c: {
  id: string;
  name: string;
  subject: string;
  type: string;
  hourlyRate?: number;
  defaultMonthlyHours?: number;
  monthlyFee?: number;
}) {
  return {
    id: c.id,
    name: c.name,
    subject: c.subject,
    type: c.type,
    hourly_rate: c.hourlyRate ?? null,
    default_monthly_hours: c.defaultMonthlyHours ?? null,
    monthly_fee: c.monthlyFee ?? null,
  };
}

export function enrollmentFromDb(row: any): Enrollment {
  return {
    id: row.id,
    studentId: row.student_id,
    courseId: row.course_id,
    monthlyHours: row.monthly_hours ?? undefined,
    monthlyFee: row.monthly_fee ?? undefined,
    hoursUsed: Number(row.hours_used ?? 0),
    sessionHours: Number(row.session_hours ?? 0),
  };
}

export function enrollmentToDb(e: {
  id: string;
  studentId: string;
  courseId: string;
  monthlyHours?: number;
  monthlyFee?: number;
  hoursUsed?: number;
  sessionHours?: number;
}) {
  return {
    id: e.id,
    student_id: e.studentId,
    course_id: e.courseId,
    monthly_hours: e.monthlyHours ?? null,
    monthly_fee: e.monthlyFee ?? null,
    hours_used: e.hoursUsed ?? 0,
    session_hours: e.sessionHours ?? 0,
  };
}

export function attendanceFromDb(row: any): AttendanceRecord {
  return {
    id: row.id,
    enrollmentId: row.enrollment_id,
    date: row.date,
    status: row.status,
    hoursCounted: Number(row.hours_counted ?? 0),
  };
}

export function attendanceToDb(a: {
  id: string;
  enrollmentId: string;
  date: string;
  status: string;
  hoursCounted: number;
}) {
  return {
    id: a.id,
    enrollment_id: a.enrollmentId,
    date: a.date,
    status: a.status,
    hours_counted: a.hoursCounted,
  };
}

export function transactionFromDb(row: any): Transaction {
  return {
    id: row.id,
    studentId: row.student_id,
    courseId: row.course_id,
    amount: Number(row.amount),
    method: row.method,
    slipImage: row.slip_image ?? undefined,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  };
}

export function transactionToDb(t: {
  id: string;
  studentId: string;
  courseId: string;
  amount: number;
  method: string;
  slipImage?: string;
  note?: string;
  createdAt: string;
}) {
  return {
    id: t.id,
    student_id: t.studentId,
    course_id: t.courseId,
    amount: t.amount,
    method: t.method,
    slip_image: t.slipImage ?? null,
    note: t.note ?? null,
    created_at: t.createdAt,
  };
}

export function expenseFromDb(row: any): Expense {
  return {
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    category: row.category,
    method: row.method,
    receiptImage: row.receipt_image ?? undefined,
    createdAt: row.created_at,
  };
}

export function expenseToDb(e: {
  id: string;
  title: string;
  amount: number;
  category: string;
  method: string;
  receiptImage?: string;
  createdAt: string;
}) {
  return {
    id: e.id,
    title: e.title,
    amount: e.amount,
    category: e.category,
    method: e.method,
    receipt_image: e.receiptImage ?? null,
    created_at: e.createdAt,
  };
}
