"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { formatBaht, formatDateThai } from "@/lib/utils";
import { History, Banknote, Landmark } from "lucide-react";

export function RecentEntries() {
  const { transactions, getStudent, getCourse } = useStore();
  const recent = transactions.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary-500" />
          รายการล่าสุด 5 รายการ
        </CardTitle>
        <CardDescription>ตรวจสอบย้อนหลังก่อนส่งสลิป/ยืนยันยอด</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recent.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">ยังไม่มีรายการรับเงิน</p>
        )}
        {recent.map((tx) => {
          const student = getStudent(tx.studentId);
          const course = getCourse(tx.courseId);
          return (
            <div
              key={tx.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-secondary/40 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{student?.name ?? "-"}</p>
                <p className="truncate text-xs text-muted-foreground">{course?.name ?? "-"}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{formatDateThai(tx.createdAt)}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="text-sm font-bold text-primary-700">{formatBaht(tx.amount)}</span>
                <Badge variant={tx.method === "cash" ? "warning" : "success"} className="text-[10px]">
                  {tx.method === "cash" ? (
                    <>
                      <Banknote className="h-3 w-3" /> เงินสด
                    </>
                  ) : (
                    <>
                      <Landmark className="h-3 w-3" /> เงินโอน
                    </>
                  )}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
