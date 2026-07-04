import type { Course, Enrollment, Student } from "./types";
import { formatBaht } from "./utils";

export interface BillingLineItem {
  course: Course;
  enrollment: Enrollment;
}

/**
 * Generates a ready-to-send Thai billing/notification message for a parent,
 * covering every course the student is enrolled in. Private classes show
 * hours used vs quota; group classes show the flat monthly fee.
 */
export function generateBillingMessage(
  student: Student,
  items: BillingLineItem[],
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

  let total = 0;

  items.forEach((item, idx) => {
    const { course, enrollment } = item;
    if (course.type === "private") {
      const quota = enrollment.monthlyHours ?? course.defaultMonthlyHours ?? 0;
      const used = enrollment.hoursUsed;
      const rate = course.hourlyRate ?? 0;
      const amount = Math.round(used * rate);
      total += amount;
      lines.push(`${idx + 1}) วิชา${course.subject} (คลาสเดี่ยว)`);
      lines.push(`    เรียนไปแล้ว ${used}/${quota} ชม. × ${formatBaht(rate)}/ชม.`);
      lines.push(`    ยอดค่าเรียนสะสมเดือนนี้: ${formatBaht(amount)}`);
    } else {
      const fee = enrollment.monthlyFee ?? course.monthlyFee ?? 0;
      total += fee;
      lines.push(`${idx + 1}) วิชา${course.subject} (คลาสกลุ่ม - เหมาจ่าย)`);
      lines.push(`    ค่าเรียนรายเดือน: ${formatBaht(fee)}`);
    }
    lines.push("");
  });

  lines.push(`💰 ยอดรวมทั้งหมด: ${formatBaht(total)}`);
  lines.push("");
  lines.push("ชำระได้ทั้งเงินสดหรือโอนผ่าน QR พร้อมส่งสลิปแจ้งแอดมินได้เลยค่ะ");
  lines.push(`ขอบคุณค่ะ 🌸 ${instituteName}`);

  return lines.join("\n");
}
