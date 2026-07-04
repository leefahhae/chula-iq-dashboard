import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getSupabaseServerClient } from "@/lib/supabase";
import {
  studentFromDb,
  courseFromDb,
  transactionFromDb,
  expenseFromDb,
} from "@/lib/db-mappers";
import { EXPENSE_CATEGORY_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Builds an .xlsx workbook (สรุป / รายรับ / รายจ่าย sheets) straight from the
// Supabase tables and streams it back as a file download — used by the
// "ส่งออก Excel" button on the dashboard so the owner can hand raw data to an
// accountant or use it for tax filing without touching the database directly.
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    const [studentsRes, coursesRes, txRes, exRes] = await Promise.all([
      supabase.from("students").select("*"),
      supabase.from("courses").select("*"),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }),
      supabase.from("expenses").select("*").order("created_at", { ascending: false }),
    ]);
    for (const result of [studentsRes, coursesRes, txRes, exRes]) {
      if (result.error) throw result.error;
    }

    const students = (studentsRes.data ?? []).map(studentFromDb);
    const courses = (coursesRes.data ?? []).map(courseFromDb);
    const transactions = (txRes.data ?? []).map(transactionFromDb);
    const expenses = (exRes.data ?? []).map(expenseFromDb);

    const studentMap = new Map(students.map((s) => [s.id, s]));
    const courseMap = new Map(courses.map((c) => [c.id, c]));

    const incomeRows = transactions.map((t) => ({
      วันที่: new Date(t.createdAt).toLocaleString("th-TH"),
      นักเรียน: studentMap.get(t.studentId)?.name ?? "-",
      คอร์ส: courseMap.get(t.courseId)?.name ?? "-",
      จำนวนเงิน: t.amount,
      ช่องทาง: t.method === "cash" ? "เงินสด" : "เงินโอน",
      หมายเหตุ: t.note ?? "",
    }));

    const expenseRows = expenses.map((e) => ({
      วันที่: new Date(e.createdAt).toLocaleString("th-TH"),
      รายการ: e.title,
      หมวดหมู่: EXPENSE_CATEGORY_LABEL[e.category],
      จำนวนเงิน: e.amount,
      ช่องทาง: e.method === "cash" ? "เงินสด" : "เงินโอน",
    }));

    const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const summaryRows = [
      { รายการ: "รายรับรวมทั้งหมด (ทุกช่วงเวลา)", จำนวนเงิน: totalIncome },
      { รายการ: "รายจ่ายรวมทั้งหมด (ทุกช่วงเวลา)", จำนวนเงิน: totalExpense },
      { รายการ: "กำไรสุทธิ", จำนวนเงิน: totalIncome - totalExpense },
      { รายการ: "จำนวนรายการรับเงินทั้งหมด", จำนวนเงิน: transactions.length },
      { รายการ: "จำนวนรายการรายจ่ายทั้งหมด", จำนวนเงิน: expenses.length },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryRows), "สรุป");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(incomeRows), "รายรับ");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(expenseRows), "รายจ่าย");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
    const filename = `chula-iq-report-${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("GET /api/export failed:", err);
    return NextResponse.json({ error: "ส่งออกรายงานไม่สำเร็จ" }, { status: 500 });
  }
}
