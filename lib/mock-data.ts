import type {
  Student,
  Course,
  Enrollment,
  Transaction,
  Expense,
  AttendanceRecord,
} from "./types";

// Seed data for local demo/prototyping only.
// Replace with real fetches (e.g. `SELECT * FROM students`) when wiring a DB.

export const seedStudents: Student[] = [
  {
    id: "st_1",
    name: "น้องมิ้นท์",
    grade: "ม.6",
    parentName: "คุณสมศรี (แม่)",
    parentLine: "mint_mom_2026",
    parentFacebook: "facebook.com/somsri.k",
    phone: "081-234-5678",
  },
  {
    id: "st_2",
    name: "น้องปันปัน",
    grade: "ม.4",
    parentName: "คุณวิชัย (พ่อ)",
    parentLine: "wichai.pp",
    parentFacebook: "facebook.com/wichai.p",
    phone: "089-876-5432",
  },
  {
    id: "st_3",
    name: "น้องข้าวปุ้น",
    grade: "ม.5",
    parentName: "คุณนภา (แม่)",
    parentLine: "napa_rice",
    parentFacebook: "facebook.com/napa.rice",
    phone: "062-345-1122",
  },
  {
    id: "st_4",
    name: "น้องพีช",
    grade: "ม.6",
    parentName: "คุณอนันต์ (พ่อ)",
    parentLine: "peach.dad.anan",
    parentFacebook: "facebook.com/anan.p",
    phone: "090-111-2233",
  },
  {
    id: "st_5",
    name: "น้องใบเฟิร์น",
    grade: "ม.3",
    parentName: "คุณสุดา (แม่)",
    parentLine: "suda_fern",
    parentFacebook: "facebook.com/suda.fern",
    phone: "086-654-9988",
  },
  {
    id: "st_6",
    name: "น้องต้นกล้า",
    grade: "ม.4",
    parentName: "คุณประยุทธ (พ่อ)",
    parentLine: "tonkla.dad",
    parentFacebook: "facebook.com/prayut.t",
    phone: "081-999-8877",
  },
];

export const seedCourses: Course[] = [
  {
    id: "co_1",
    name: "Chemistry ตัวต่อตัว ม.6",
    subject: "เคมี",
    type: "private",
    hourlyRate: 500,
    defaultMonthlyHours: 8,
  },
  {
    id: "co_2",
    name: "Math ตัวต่อตัว ม.4-5",
    subject: "คณิตศาสตร์",
    type: "private",
    hourlyRate: 450,
    defaultMonthlyHours: 8,
  },
  {
    id: "co_3",
    name: "Physics กลุ่มเล็ก ม.6",
    subject: "ฟิสิกส์",
    type: "group",
    monthlyFee: 1000,
  },
  {
    id: "co_4",
    name: "English กลุ่มเล็ก ม.3-4",
    subject: "ภาษาอังกฤษ",
    type: "group",
    monthlyFee: 1000,
  },
  {
    id: "co_5",
    name: "Biology ปิดเทอม Intensive",
    subject: "ชีววิทยา",
    type: "group",
    monthlyFee: 2500,
  },
];

export const seedEnrollments: Enrollment[] = [
  { id: "en_1", studentId: "st_1", courseId: "co_1", monthlyHours: 8, hoursUsed: 4.5, sessionHours: 1.5 },
  { id: "en_2", studentId: "st_4", courseId: "co_1", monthlyHours: 6, hoursUsed: 3, sessionHours: 1.5 },
  { id: "en_3", studentId: "st_2", courseId: "co_2", monthlyHours: 8, hoursUsed: 2, sessionHours: 2 },
  { id: "en_4", studentId: "st_6", courseId: "co_2", monthlyHours: 10, hoursUsed: 6, sessionHours: 2 },
  { id: "en_5", studentId: "st_1", courseId: "co_3", monthlyFee: 1000, hoursUsed: 0, sessionHours: 0 },
  { id: "en_6", studentId: "st_4", courseId: "co_3", monthlyFee: 1000, hoursUsed: 0, sessionHours: 0 },
  { id: "en_7", studentId: "st_3", courseId: "co_3", monthlyFee: 1000, hoursUsed: 0, sessionHours: 0 },
  { id: "en_8", studentId: "st_3", courseId: "co_4", monthlyFee: 1000, hoursUsed: 0, sessionHours: 0 },
  { id: "en_9", studentId: "st_5", courseId: "co_4", monthlyFee: 1000, hoursUsed: 0, sessionHours: 0 },
  { id: "en_10", studentId: "st_5", courseId: "co_5", monthlyFee: 2500, hoursUsed: 0, sessionHours: 0 },
];

export const seedAttendance: AttendanceRecord[] = [
  { id: "at_1", enrollmentId: "en_1", date: "2026-06-29", status: "present", hoursCounted: 1.5 },
  { id: "at_2", enrollmentId: "en_1", date: "2026-07-01", status: "present", hoursCounted: 1.5 },
  { id: "at_3", enrollmentId: "en_1", date: "2026-07-02", status: "leave", hoursCounted: 0 },
  { id: "at_4", enrollmentId: "en_5", date: "2026-06-29", status: "present", hoursCounted: 0 },
  { id: "at_5", enrollmentId: "en_5", date: "2026-07-01", status: "absent", hoursCounted: 0 },
];

function iso(daysAgo: number, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const seedTransactions: Transaction[] = [
  {
    id: "tx_1",
    studentId: "st_1",
    courseId: "co_1",
    amount: 2250,
    method: "transfer",
    note: "โอนค่าเรียน 4.5 ชม.",
    createdAt: iso(0, 9, 15),
  },
  {
    id: "tx_2",
    studentId: "st_3",
    courseId: "co_3",
    amount: 1000,
    method: "cash",
    note: "ค่าเรียนกลุ่มฟิสิกส์ ก.ค.",
    createdAt: iso(0, 11, 40),
  },
  {
    id: "tx_3",
    studentId: "st_5",
    courseId: "co_5",
    amount: 2500,
    method: "transfer",
    note: "คอร์สปิดเทอม Biology",
    createdAt: iso(0, 14, 5),
  },
  {
    id: "tx_4",
    studentId: "st_2",
    courseId: "co_2",
    amount: 900,
    method: "cash",
    note: "ค่าเรียน 2 ชม.",
    createdAt: iso(1, 16, 0),
  },
  {
    id: "tx_5",
    studentId: "st_6",
    courseId: "co_2",
    amount: 2700,
    method: "transfer",
    note: "ค่าเรียน 6 ชม.",
    createdAt: iso(2, 10, 30),
  },
  {
    id: "tx_6",
    studentId: "st_4",
    courseId: "co_3",
    amount: 1000,
    method: "cash",
    createdAt: iso(3, 13, 20),
  },
  {
    id: "tx_7",
    studentId: "st_3",
    courseId: "co_4",
    amount: 1000,
    method: "transfer",
    createdAt: iso(5, 9, 0),
  },
];

export const seedExpenses: Expense[] = [
  {
    id: "ex_1",
    title: "ค่าไฟประจำเดือน มิ.ย.",
    amount: 3200,
    category: "utilities",
    method: "transfer",
    createdAt: iso(6, 12, 0),
  },
  {
    id: "ex_2",
    title: "ค่าจ้างติวเตอร์พาร์ทไทม์ (พี่แนน)",
    amount: 8000,
    category: "payroll",
    method: "transfer",
    createdAt: iso(4, 18, 0),
  },
  {
    id: "ex_3",
    title: "ค่าปริ้นชีทเรียน + กระดาษ",
    amount: 850,
    category: "materials",
    method: "cash",
    createdAt: iso(2, 15, 30),
  },
  {
    id: "ex_4",
    title: "ค่ายิงโฆษณา Facebook Ads",
    amount: 1500,
    category: "marketing",
    method: "transfer",
    createdAt: iso(1, 20, 0),
  },
  {
    id: "ex_5",
    title: "ค่าน้ำดื่มออฟฟิศ",
    amount: 240,
    category: "misc",
    method: "cash",
    createdAt: iso(0, 8, 30),
  },
];
