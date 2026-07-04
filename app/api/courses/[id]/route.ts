import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { courseFromDb } from "@/lib/db-mappers";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const patch: Record<string, unknown> = {};
    if (body.hourlyRate !== undefined) patch.hourly_rate = body.hourlyRate;
    if (body.defaultMonthlyHours !== undefined) patch.default_monthly_hours = body.defaultMonthlyHours;
    if (body.monthlyFee !== undefined) patch.monthly_fee = body.monthlyFee;

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("courses")
      .update(patch as any)
      .eq("id", params.id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(courseFromDb(data));
  } catch (err) {
    console.error(`PATCH /api/courses/${params.id} failed:`, err);
    return NextResponse.json({ error: "แก้ไขราคาคอร์สไม่สำเร็จ" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("courses").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`DELETE /api/courses/${params.id} failed:`, err);
    return NextResponse.json({ error: "ลบคอร์สไม่สำเร็จ" }, { status: 500 });
  }
}
