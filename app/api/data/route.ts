import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import {
  studentFromDb,
  courseFromDb,
  enrollmentFromDb,
  attendanceFromDb,
  transactionFromDb,
  expenseFromDb,
} from "@/lib/db-mappers";

// This route has no cookies()/headers() usage, so without this Next.js may
// treat it as static and cache the response at build time — every request
// would then replay that one frozen snapshot forever, making the app look
// like it "loses" data on refresh even though Supabase is fine. Forcing
// dynamic rendering guarantees every request actually re-queries the DB.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Fetches everything the app needs in one round trip. The client store
// (lib/store.tsx) calls this once on load instead of seeding from mock data
// or localStorage.
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    const [students, courses, enrollments, attendance, transactions, expenses] =
      await Promise.all([
        supabase.from("students").select("*").order("name"),
        supabase.from("courses").select("*").order("name"),
        supabase.from("enrollments").select("*"),
        supabase.from("attendance").select("*").order("date", { ascending: false }),
        supabase.from("transactions").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses").select("*").order("created_at", { ascending: false }),
      ]);

    for (const result of [students, courses, enrollments, attendance, transactions, expenses]) {
      if (result.error) throw result.error;
    }

    return NextResponse.json({
      students: (students.data ?? []).map(studentFromDb),
      courses: (courses.data ?? []).map(courseFromDb),
      enrollments: (enrollments.data ?? []).map(enrollmentFromDb),
      attendance: (attendance.data ?? []).map(attendanceFromDb),
      transactions: (transactions.data ?? []).map(transactionFromDb),
      expenses: (expenses.data ?? []).map(expenseFromDb),
    });
  } catch (err) {
    console.error("GET /api/data failed:", err);
    return NextResponse.json(
      { error: "โหลดข้อมูลจากฐานข้อมูลไม่สำเร็จ ตรวจสอบการตั้งค่า Supabase" },
      { status: 500 }
    );
  }
}
