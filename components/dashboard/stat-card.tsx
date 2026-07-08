import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "neutral" | "destructive";
  subtext?: string;
}

const TONE_STYLES: Record<NonNullable<StatCardProps["tone"]>, { bg: string; icon: string }> = {
  primary: { bg: "border-2 border-foreground bg-primary", icon: "text-primary-foreground" },
  success: { bg: "border-2 border-foreground bg-success", icon: "text-success-foreground" },
  warning: { bg: "border-2 border-foreground bg-warning", icon: "text-warning-foreground" },
  neutral: { bg: "border-2 border-foreground bg-secondary", icon: "text-secondary-foreground" },
  destructive: { bg: "border-2 border-foreground bg-destructive", icon: "text-destructive-foreground" },
};

export function StatCard({ label, value, icon: Icon, tone = "primary", subtext }: StatCardProps) {
  const styles = TONE_STYLES[tone];
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", styles.bg)}>
          <Icon className={cn("h-5 w-5", styles.icon)} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="truncate text-xl font-bold leading-tight">{value}</p>
          {subtext && <p className="truncate text-[11px] text-muted-foreground">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
