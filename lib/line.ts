import "server-only";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Small helpers around the LINE Messaging API. Kept server-only since they
// touch LINE_CHANNEL_SECRET / LINE_CHANNEL_ACCESS_TOKEN — the webhook route
// verifies inbound requests really came from LINE, and replyLineMessage /
// pushLineMessage send outbound messages using the channel access token.
// ---------------------------------------------------------------------------

/**
 * Verifies the `x-line-signature` header LINE attaches to every webhook
 * request: base64(HMAC-SHA256(channel secret, raw request body)). Must be
 * computed against the raw (unparsed) body text, not the re-serialized JSON.
 */
export function verifyLineSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");

  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function replyLineMessage(replyToken: string, text: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return;

  try {
    await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ replyToken, messages: [{ type: "text", text }] }),
    });
  } catch (err) {
    console.error("replyLineMessage failed:", err);
  }
}

export async function pushLineMessage(toUserId: string, text: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("ยังไม่ได้ตั้งค่า LINE_CHANNEL_ACCESS_TOKEN");
  }

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: toUserId, messages: [{ type: "text", text }] }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("pushLineMessage failed:", res.status, detail);
    throw new Error("ส่งข้อความ LINE ไม่สำเร็จ (LINE API ปฏิเสธคำขอ)");
  }
}
