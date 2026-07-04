import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { courseFromDb, courseToDb } from "@/lib/db-mappers";
import { uid } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = uid("co");
    const row = courseToDb({ id, ...body });

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from("courses").insert(row as any).select().single();
    if (error) throw error;

    return NextResponse.json(courseFromDb(data));
  } catch (err) {
    console.error("POST /api/courses failed:", err);
    return NextResponse.json({ error: "บันทึกคอร์สไม่สำเร็จ" }, { status: 500 });
  }
}
