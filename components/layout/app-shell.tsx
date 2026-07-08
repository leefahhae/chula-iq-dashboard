"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  CalendarCheck2,
  Send,
  Receipt,
  GraduationCap,
  Users,
  LogOut,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

function LogoutButton({ className }: { className?: string }) {
  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={cn(
        "flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive",
        className
      )}
    >
      <LogOut className="h-4 w-4" />
      ออกจากระบบ
    </button>
  );
}

const NAV_ITEMS = [
  { href: "/", label: "ภาพรวม", shortLabel: "ภาพรวม", icon: LayoutDashboard },
  { href: "/payment-entry", label: "บันทึกรับเงิน", shortLabel: "รับเงิน", icon: Wallet },
  { href: "/attendance", label: "เช็คชื่อ/คำนวณยอด", shortLabel: "เช็คชื่อ", icon: CalendarCheck2 },
  { href: "/notifications", label: "แจ้งยอดผู้ปกครอง", shortLabel: "แจ้งยอด", icon: Send },
  { href: "/expenses", label: "รายจ่าย", shortLabel: "รายจ่าย", icon: Receipt },
  { href: "/manage", label: "จัดการนักเรียน/คอร์ส", shortLabel: "จัดการ", icon: Users },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { loading, loadError, refresh } = useStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r-2 border-foreground bg-white md:flex">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-foreground bg-primary text-primary-foreground shadow-brutal-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-bold leading-tight text-primary-700">Chula IQ</p>
            <p className="text-xs text-muted-foreground">Tutor Admin Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 px-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 text-sm font-bold transition-all",
                  active
                    ? "border-foreground bg-primary text-primary-foreground shadow-brutal-sm"
                    : "border-transparent text-foreground/70 hover:border-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-brutal-sm"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mx-3 mb-2 rounded-2xl border-2 border-foreground bg-orchid p-4 text-xs font-medium text-orchid-foreground shadow-brutal-sm">
          💡 ข้อมูลทั้งหมดบันทึกลงฐานข้อมูล Supabase จริง ไม่หายเมื่อปิดเว็บ
        </div>
        <LogoutButton className="mx-3 mb-3" />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2.5 border-b-2 border-foreground bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-foreground bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-primary-700">Chula IQ</p>
            <p className="text-[11px] text-muted-foreground">Tutor Admin Dashboard</p>
          </div>
        </div>
        <LogoutButton className="px-2 text-xs" />
      </header>

      {/* Main content */}
      <main className="pb-24 md:ml-64 md:pb-8">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
              <p className="text-sm">กำลังโหลดข้อมูลจากฐานข้อมูล...</p>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <p className="max-w-sm text-sm font-medium text-destructive">{loadError}</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                ตรวจสอบว่าตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY ถูกต้องแล้วหรือยัง
              </p>
              <button
                type="button"
                onClick={() => refresh()}
                className="rounded-xl border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                ลองใหม่
              </button>
            </div>
          ) : (
            children
          )}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t-2 border-foreground bg-white px-1 py-1.5 md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-bold transition-colors",
                active ? "text-primary-700" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2",
                  active ? "border-foreground bg-primary" : "border-transparent"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {item.shortLabel}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
