import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, getExpectedSessionValue } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const expected = await getExpectedSessionValue();

  // No APP_PASSWORD configured yet — send everyone to /login, which shows
  // a clear setup message instead of silently exposing the app.
  if (!expected) {
    if (request.nextUrl.pathname === "/login") return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const cookie = request.cookies.get(AUTH_COOKIE)?.value;
  if (cookie === expected) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|api/login|api/logout).*)"],
};
