import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { transactionFromDb } from "@/lib/db-mappers";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const patch: Record<string, unknown> = {};
    if (body.studentId !== undefined) patch.student_id = body.studentId;
    if (body.courseId !== undefined) patch.course_id = body.courseId;
    if (body.amount !== undefined) patch.amount = body.amount;
    if (body.method !== undefined) patch.method = body.method;
    if (body.slipImage !== undefined) patch.slip_image = body.slipImage;
    if (body.note !== undefined) patch.note = body.note;

    const supabase = getSupabaseServerClient();
    const { data, error } = await (supabase.from("transactions") as any)
      .update(patch)
      .eq("id", params.id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(transactionFromDb(data));
  } catch (err) {
    console.error(`PATCH /api/transactions/${params.id} failed:`, err);
    return NextResponse.json({ error: "แก้ไขรายการรับเงินไม่สำเร็จ" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("transactions").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`DELETE /api/transactions/${params.id} failed:`, err);
    return NextResponse.json({ error: "ลบรายการรับเงินไม่สำเร็จ" }, { status: 500 });
  }
}
