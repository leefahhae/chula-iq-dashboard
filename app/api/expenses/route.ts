import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { expenseFromDb, expenseToDb } from "@/lib/db-mappers";
import { uid } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = uid("ex");
    const row = expenseToDb({
      id,
      createdAt: new Date().toISOString(),
      ...body,
    });

    const supabase = getSupabaseServerClient();
    const { data, error } = await (supabase.from("expenses") as any).insert(row).select().single();
    if (error) throw error;

    return NextResponse.json(expenseFromDb(data));
  } catch (err) {
    console.error("POST /api/expenses failed:", err);
    return NextResponse.json({ error: "บันทึกรายจ่ายไม่สำเร็จ" }, { status: 500 });
  }
}
