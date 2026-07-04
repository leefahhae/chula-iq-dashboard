import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sarabun } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { AppShell } from "@/components/layout/app-shell";

// Sarabun is Google Fonts' web-native successor to the Thai government
// "TH SarabunPSK" standard typeface (same foundry, revised for web use),
// so it's the closest legitimate web font to TH SarabunPSK.
const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chula IQ | Tutor Admin Dashboard",
  description: "ระบบหลังบ้านสถาบันกวดวิชา Chula IQ — บันทึกรับเงิน เช็คชื่อ แจ้งยอด และสรุปการเงิน",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" className={sarabun.variable}>
      <body className="font-sans antialiased">
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
