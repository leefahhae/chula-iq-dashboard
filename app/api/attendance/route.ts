import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { attendanceFromDb, attendanceToDb } from "@/lib/db-mappers";
import { uid } from "@/lib/utils";

interface IncomingRecord {
  enrollmentId: string;
  date: string;
  status: "present" | "absent" | "leave";
  hoursCounted: number;
}

// Accepts one or many attendance records in a single call — used by both
// markAttendance (one row) and markAllPresent (one row per student in the
// course), so a bulk check-in is a single database round trip.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const records: IncomingRecord[] = body.records;
    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: "ไม่มีข้อมูลเช็คชื่อส่งมา" }, { status: 400 });
    }

    const rows = records.map((r) => attendanceToDb({ id: uid("at"), ...r }));

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from("attendance").insert(rows as any).select();
    if (error) throw error;

    return NextResponse.json((data ?? []).map(attendanceFromDb));
  } catch (err) {
    console.error("POST /api/attendance failed:", err);
    return NextResponse.json({ error: "บันทึกการเช็คชื่อไม่สำเร็จ" }, { status: 500 });
  }
}
