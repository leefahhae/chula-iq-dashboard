import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { studentFromDb, studentToDb } from "@/lib/db-mappers";
import { uid } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = uid("st");
    const row = studentToDb({ id, ...body });

    const supabase = getSupabaseServerClient();
    const { data, error } = await (supabase.from("students") as any).insert(row).select().single();
    if (error) throw error;

    return NextResponse.json(studentFromDb(data));
  } catch (err) {
    console.error("POST /api/students failed:", err);
    return NextResponse.json({ error: "บันทึกนักเรียนไม่สำเร็จ" }, { status: 500 });
  }
}
