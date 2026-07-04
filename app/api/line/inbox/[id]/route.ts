import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

// Links a pending LINE inbox entry to a student (sets students.line_user_id)
// then removes the entry from the inbox, since it's resolved.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const studentId: string | undefined = body.studentId;
    if (!studentId) {
      return NextResponse.json({ error: "กรุณาเลือกนักเรียน" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data: entry, error: fetchError } = await supabase
      .from("line_inbox")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!entry) {
      return NextResponse.json({ error: "ไม่พบข้อความนี้แล้ว (อาจถูกเชื่อมไปแล้ว)" }, { status: 404 });
    }

    const { error: updateError } = await (supabase.from("students") as any)
      .update({ line_user_id: (entry as any).line_user_id })
      .eq("id", studentId);
    if (updateError) throw updateError;

    const { error: deleteError } = await supabase.from("line_inbox").delete().eq("id", params.id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`PATCH /api/line/inbox/${params.id} failed:`, err);
    return NextResponse.json({ error: "เชื่อมบัญชี LINE ไม่สำเร็จ" }, { status: 500 });
  }
}

// Dismisses an inbox entry without linking it (e.g. spam / wrong number).
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("line_inbox").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`DELETE /api/line/inbox/${params.id} failed:`, err);
    return NextResponse.json({ error: "ลบข้อความไม่สำเร็จ" }, { status: 500 });
  }
}
