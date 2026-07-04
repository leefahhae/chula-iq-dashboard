import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { pushLineMessage } from "@/lib/line";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, message } = body;
    if (!studentId || !message) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data: student, error } = await supabase
      .from("students")
      .select("line_user_id, name")
      .eq("id", studentId)
      .maybeSingle();
    if (error) throw error;

    if (!student?.line_user_id) {
      return NextResponse.json(
        { error: "นักเรียนคนนี้ยังไม่ได้เชื่อมบัญชี LINE ของผู้ปกครอง" },
        { status: 400 }
      );
    }

    await pushLineMessage(student.line_user_id, message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/line/push failed:", err);
    const message = err instanceof Error ? err.message : "ส่งข้อความ LINE ไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
