import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Chula IQ | Tutor Admin Dashboard",
  description: "ระบบหลังบ้านสถาบันกวดวิชา Chula IQ — บันทึกรับเงิน เช็คชื่อ แจ้งยอด และสรุปการเงิน",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body className="font-sans antialiased">
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
