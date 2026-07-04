import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sarabun } from "next/font/google";
import "./globals.css";

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

// This root layout stays deliberately minimal (just fonts/HTML shell) so
// that /login can render without the authenticated app's sidebar/nav around
// it. The sidebar, nav, and data StoreProvider only wrap the actual app
// pages — see app/(app)/layout.tsx.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" className={sarabun.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
