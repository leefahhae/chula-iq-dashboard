import type { Course, Enrollment, Student, Transaction, AttendanceRecord } from "./types";
import { formatBaht } from "./utils";
import { getEnrollmentBalance, getHoursUsedThisMonth } from "./analytics";

export interface BillingLineItem {
  course: Course;
  enrollment: Enrollment;
}

/**
 * Generates a ready-to-send Thai billing/notification message for a parent,
 * covering every course the student is enrolled in. Private classes show
 * hours used vs quota; group classes show the flat monthly fee. Amounts
 * already paid this month (per `transactions`) are subtracted so the message
 * only asks for the outstanding balance, never double-charging a parent who
 * already transferred part of the fee.
 */
export function generateBillingMessage(
  student: Student,
  items: BillingLineItem[],
  transactions: Transaction[] = [],
  attendance: AttendanceRecord[] = [],
  instituteName = "Chula IQ"
): string {
  const today = new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const lines: string[] = [];
  lines.push(`📚 ${instituteName} — แจ้งยอดค่าเรียน`);
  lines.push(`เรียน คุณผู้ปกครองของ ${student.name} (${student.grade})`);
  lines.push(`ข้อมูล ณ วันที่ ${today}`);
  lines.push("");

  let totalBalance = 0;

  items.forEach((item, idx) => {
    const { course, enrollment } = item;
    const { due, paid, balance } = getEnrollmentBalance(enrollment, course, transactions, attendance);
    totalBalance += balance;

    if (course.type === "private") {
      const quota = enrollment.monthlyHours ?? course.defaultMonthlyHours ?? 0;
      const used = getHoursUsedThisMonth(enrollment.id, attendance);
      const rate = course.hourlyRate ?? 0;
      lines.push(`${idx + 1}) วิชา${course.subject} (คลาสเดี่ยว)`);
      lines.push(`    เรียนไปแล้ว ${used}/${quota} ชม. × ${formatBaht(rate)}/ชม.`);
      lines.push(`    ยอดค่าเรียนสะสมเดือนนี้: ${formatBaht(due)}`);
    } else {
      lines.push(`${idx + 1}) วิชา${course.subject} (คลาสกลุ่ม - เหมาจ่าย)`);
      lines.push(`    ค่าเรียนรายเดือน: ${formatBaht(due)}`);
    }

    if (paid > 0) {
      lines.push(`    ชำระแล้ว: ${formatBaht(paid)}`);
    }
    lines.push(
      balance > 0
        ? `    คงเหลือที่ต้องชำระ: ${formatBaht(balance)}`
        : `    ชำระครบแล้ว ✅`
    );
    lines.push("");
  });

  lines.push(
    totalBalance > 0
      ? `💰 ยอดคงเหลือที่ต้องชำระทั้งหมด: ${formatBaht(totalBalance)}`
      : `✅ ชำระค่าเรียนครบทุกวิชาแล้วค่ะ ขอบคุณค่ะ`
  );
  lines.push("");
  if (totalBalance > 0) {
    lines.push("ชำระได้ทั้งเงินสดหรือโอนผ่าน QR พร้อมส่งสลิปแจ้งแอดมินได้เลยค่ะ");
  }
  lines.push(`ขอบคุณค่ะ 🌸 ${instituteName}`);

  return lines.join("\n");
}
