"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BillingMessageDialog } from "@/components/notifications/billing-message-dialog";
import type { BillingLineItem } from "@/lib/billing-template";
import { getEnrollmentBalance } from "@/lib/analytics";
import { MessageCircle, Facebook, GraduationCap, AlertCircle } from "lucide-react";
import { formatBaht } from "@/lib/utils";

export default function NotificationsPage() {
  const { students, enrollments, transactions, getCourse } = useStore();
  const [onlyUnpaid, setOnlyUnpaid] = React.useState(false);

  const studentBillingInfo = students.map((student) => {
    const studentEnrollments = enrollments.filter((e) => e.studentId === student.id);
    const items: BillingLineItem[] = studentEnrollments
      .map((enrollment) => {
        const course = getCourse(enrollment.courseId);
        return course ? { course, enrollment } : null;
      })
      .filter((x): x is BillingLineItem => Boolean(x));

    const balances = items.map(({ course, enrollment }) =>
      getEnrollmentBalance(enrollment, course, transactions)
    );
    const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0);

    return { student, items, balances, totalBalance };
  });

  const unpaidCount = studentBillingInfo.filter((s) => s.totalBalance > 0).length;
  const unpaidTotal = studentBillingInfo.reduce((sum, s) => sum + s.totalBalance, 0);

  const visibleStudents = onlyUnpaid
    ? studentBillingInfo.filter((s) => s.totalBalance > 0)
    : studentBillingInfo;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">แจ้งยอด/ทวงยอดผู้ปกครอง</h1>
        <p className="text-sm text-muted-foreground">
          สร้างข้อความสรุปยอดอัตโนมัติ แล้วคัดลอกไปส่งใน LINE หรือ Facebook ของผู้ปกครองได้ทันที
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span>
              ค้างชำระ <span className="font-semibold text-destructive">{unpaidCount} คน</span> รวม{" "}
              <span className="font-semibold text-destructive">{formatBaht(unpaidTotal)}</span>
            </span>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground/80">
            <input
              type="checkbox"
              checked={onlyUnpaid}
              onChange={(e) => setOnlyUnpaid(e.target.checked)}
            />
            แสดงเฉพาะคนค้างชำระ
          </label>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleStudents.map(({ student, items, balances, totalBalance }) => (
          <Card key={student.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                {student.name}
                <Badge variant="outline">{student.grade}</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">{student.parentName}</p>
              {items.length > 0 && (
                <Badge
                  variant={totalBalance > 0 ? "destructive" : "success"}
                  className="mt-1 w-fit"
                >
                  {totalBalance > 0 ? `ค้างชำระ ${formatBaht(totalBalance)}` : "ชำระครบแล้ว"}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-foreground/80">
                  <MessageCircle className="h-3.5 w-3.5 shrink-0 text-success" />
                  <span className="truncate">{student.parentLine}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/80">
                  <Facebook className="h-3.5 w-3.5 shrink-0 text-[#1877F2]" />
                  <span className="truncate">{student.parentFacebook}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-1.5">
                {items.length === 0 && (
                  <p className="text-xs text-muted-foreground">ยังไม่ได้ลงทะเบียนคอร์ส</p>
                )}
                {items.map(({ course, enrollment }, idx) => {
                  const { due, balance } = balances[idx];
                  return (
                    <div key={enrollment.id} className="space-y-0.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 truncate text-muted-foreground">
                          <GraduationCap className="h-3 w-3 shrink-0" />
                          {course.subject}
                          {course.type === "private" && (
                            <span>
                              ({enrollment.hoursUsed}/
                              {enrollment.monthlyHours ?? course.defaultMonthlyHours} ชม.)
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 font-medium">{formatBaht(due)}</span>
                      </div>
                      <p
                        className={
                          balance > 0
                            ? "text-right text-[11px] font-medium text-destructive"
                            : "text-right text-[11px] font-medium text-success"
                        }
                      >
                        {balance > 0 ? `ค้าง ${formatBaht(balance)}` : "ชำระครบแล้ว"}
                      </p>
                    </div>
                  );
                })}
              </div>

              <BillingMessageDialog student={student} items={items} />
            </CardContent>
          </Card>
        ))}
        {visibleStudents.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            ไม่มีนักเรียนที่ค้างชำระตอนนี้ 🎉
          </p>
        )}
      </div>
    </div>
  );
}
