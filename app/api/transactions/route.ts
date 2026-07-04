import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { transactionFromDb, transactionToDb } from "@/lib/db-mappers";
import { uid } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = uid("tx");
    const row = transactionToDb({
      id,
      createdAt: new Date().toISOString(),
      ...body,
    });

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from("transactions").insert(row as any).select().single();
    if (error) throw error;

    return NextResponse.json(transactionFromDb(data));
  } catch (err) {
    console.error("POST /api/transactions failed:", err);
    return NextResponse.json({ error: "บันทึกการรับเงินไม่สำเร็จ" }, { status: 500 });
  }
}
