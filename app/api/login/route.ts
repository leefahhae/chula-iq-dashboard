import { NextResponse } from "next/server";
import { AUTH_COOKIE, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const configuredPassword = process.env.APP_PASSWORD;

  if (!configuredPassword) {
    return NextResponse.json(
      { error: "ยังไม่ได้ตั้งค่า APP_PASSWORD บนเซิร์ฟเวอร์ กรุณาตั้งค่าใน Environment Variables ก่อน" },
      { status: 500 }
    );
  }

  let password: unknown;
  try {
    const body = await request.json();
    password = body?.password;
  } catch {
    return NextResponse.json({ error: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  if (typeof password !== "string" || password !== configuredPassword) {
    return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const sessionValue = await hashPassword(configuredPassword);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return response;
}
