import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();
    // Enrollments (and, transitively, attendance) cascade-delete via the
    // foreign key defined in supabase/schema.sql.
    const { error } = await supabase.from("students").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`DELETE /api/students/${params.id} failed:`, err);
    return NextResponse.json({ error: "ลบนักเรียนไม่สำเร็จ" }, { status: 500 });
  }
}
