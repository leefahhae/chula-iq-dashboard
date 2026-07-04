import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { enrollmentFromDb, enrollmentToDb } from "@/lib/db-mappers";
import { uid } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = uid("en");
    const row = enrollmentToDb({
      id,
      studentId: body.studentId,
      courseId: body.courseId,
      monthlyHours: body.monthlyHours,
      monthlyFee: body.monthlyFee,
      hoursUsed: 0,
      sessionHours: body.sessionHours ?? 1.5,
    });

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from("enrollments").insert(row).select().single();
    if (error) throw error;

    return NextResponse.json(enrollmentFromDb(data));
  } catch (err) {
    console.error("POST /api/enrollments failed:", err);
    return NextResponse.json({ error: "ลงทะเบียนคอร์สไม่สำเร็จ" }, { status: 500 });
  }
}
