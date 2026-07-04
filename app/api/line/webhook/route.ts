import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { verifyLineSignature, replyLineMessage } from "@/lib/line";
import { uid } from "@/lib/utils";

// Called directly by LINE's servers (see middleware.ts — this path is
// excluded from the login cookie check). Authenticity is verified via the
// x-line-signature header instead. Every "message"/"follow" event from a LINE
// user not yet linked to a student gets queued in line_inbox for an admin to
// match manually on the Notifications page (see LineInboxPanel).
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!verifyLineSignature(rawBody, signature)) {
    console.error("POST /api/line/webhook: invalid signature");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  try {
    const body = JSON.parse(rawBody);
    const events: any[] = Array.isArray(body.events) ? body.events : [];
    const supabase = getSupabaseServerClient();

    for (const event of events) {
      const userId: string | undefined = event.source?.userId;
      if (!userId) continue;

      // Already linked to a student? Nothing to queue.
      const { data: existingStudent } = await supabase
        .from("students")
        .select("id")
        .eq("line_user_id", userId)
        .maybeSingle();
      if (existingStudent) continue;

      let messageText: string | null = null;
      if (event.type === "message" && event.message?.type === "text") {
        messageText = event.message.text;
      } else if (event.type === "follow") {
        messageText = "(เพิ่มเพื่อนใหม่ ยังไม่ได้พิมพ์ข้อความ)";
      } else {
        continue;
      }

      // Keep only the latest unlinked entry per LINE user so the admin's
      // inbox list doesn't fill up with duplicates from one parent.
      await supabase.from("line_inbox").delete().eq("line_user_id", userId);
      await (supabase.from("line_inbox") as any).insert({
        id: uid("li"),
        line_user_id: userId,
        message_text: messageText,
        created_at: new Date().toISOString(),
      });

      if (event.replyToken) {
        await replyLineMessage(
          event.replyToken,
          "ขอบคุณค่ะ ระบบได้รับข้อความแล้ว รอแอดมินยืนยันการเชื่อมบัญชีนะคะ 🙏"
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/line/webhook failed:", err);
    return NextResponse.json({ error: "webhook processing failed" }, { status: 500 });
  }
}
