import type { ReactNode } from "react";
import { StoreProvider } from "@/lib/store";
import { AppShell } from "@/components/layout/app-shell";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <AppShell>{children}</AppShell>
    </StoreProvider>
  );
}
