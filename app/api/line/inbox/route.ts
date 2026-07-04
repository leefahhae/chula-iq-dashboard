import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { lineInboxFromDb } from "@/lib/db-mappers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("line_inbox")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    return NextResponse.json((data ?? []).map(lineInboxFromDb));
  } catch (err) {
    console.error("GET /api/line/inbox failed:", err);
    return NextResponse.json({ error: "โหลดข้อความ LINE ไม่สำเร็จ" }, { status: 500 });
  }
}
