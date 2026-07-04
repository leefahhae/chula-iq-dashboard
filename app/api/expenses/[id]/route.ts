import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { expenseFromDb } from "@/lib/db-mappers";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const patch: Record<string, unknown> = {};
    if (body.title !== undefined) patch.title = body.title;
    if (body.amount !== undefined) patch.amount = body.amount;
    if (body.category !== undefined) patch.category = body.category;
    if (body.method !== undefined) patch.method = body.method;
    if (body.receiptImage !== undefined) patch.receipt_image = body.receiptImage;

    const supabase = getSupabaseServerClient();
    const { data, error } = await (supabase.from("expenses") as any)
      .update(patch)
      .eq("id", params.id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(expenseFromDb(data));
  } catch (err) {
    console.error(`PATCH /api/expenses/${params.id} failed:`, err);
    return NextResponse.json({ error: "แก้ไขรายจ่ายไม่สำเร็จ" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("expenses").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`DELETE /api/expenses/${params.id} failed:`, err);
    return NextResponse.json({ error: "ลบรายจ่ายไม่สำเร็จ" }, { status: 500 });
  }
}
