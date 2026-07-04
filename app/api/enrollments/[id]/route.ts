import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { enrollmentFromDb } from "@/lib/db-mappers";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const patch: Record<string, unknown> = {};
    if (body.monthlyHours !== undefined) patch.monthly_hours = body.monthlyHours;
    if (body.monthlyFee !== undefined) patch.monthly_fee = body.monthlyFee;

    const supabase = getSupabaseServerClient();
    const { data, error } = await (supabase.from("enrollments") as any)
      .update(patch)
      .eq("id", params.id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(enrollmentFromDb(data));
  } catch (err) {
    console.error(`PATCH /api/enrollments/${params.id} failed:`, err);
    return NextResponse.json({ error: "แก้ไขโควตา/ราคาไม่สำเร็จ" }, { status: 500 });
  }
}
