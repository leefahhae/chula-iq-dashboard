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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-white/70 backdrop-blur-md md:flex">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-soft">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-bold leading-tight text-primary-700">Chula IQ</p>
            <p className="text-xs text-muted-foreground">Tutor Admin Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-white shadow-soft"
                    : "text-foreground/70 hover:bg-primary-50 hover:text-primary-700"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mx-3 mb-2 rounded-2xl bg-primary-50 p-4 text-xs text-primary-800">
          💡 ระบบนี้เก็บข้อมูลไว้ในเบราว์เซอร์เพื่อทดลองใช้งาน พร้อมต่อฐานข้อมูลจริงได้ทันที
        </div>
        <LogoutButton className="mx-3 mb-3" />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2.5 border-b border-border bg-white/80 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
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
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-border bg-white/95 px-1 py-1.5 backdrop-blur-md md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-colors",
                active ? "text-primary-700" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  active && "bg-primary-100"
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
