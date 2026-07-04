"use client";

import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BillingMessageDialog } from "@/components/notifications/billing-message-dialog";
import type { BillingLineItem } from "@/lib/billing-template";
import { MessageCircle, Facebook, GraduationCap } from "lucide-react";
import { formatBaht } from "@/lib/utils";

export default function NotificationsPage() {
  const { students, enrollments, getCourse } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">แจ้งยอด/ทวงยอดผู้ปกครอง</h1>
        <p className="text-sm text-muted-foreground">
          สร้างข้อความสรุปยอดอัตโนมัติ แล้วคัดลอกไปส่งใน LINE หรือ Facebook ของผู้ปกครองได้ทันที
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {students.map((student) => {
          const studentEnrollments = enrollments.filter((e) => e.studentId === student.id);
          const items: BillingLineItem[] = studentEnrollments
            .map((enrollment) => {
              const course = getCourse(enrollment.courseId);
              return course ? { course, enrollment } : null;
            })
            .filter((x): x is BillingLineItem => Boolean(x));

          return (
            <Card key={student.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  {student.name}
                  <Badge variant="outline">{student.grade}</Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">{student.parentName}</p>
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

                <div className="space-y-1">
                  {items.length === 0 && (
                    <p className="text-xs text-muted-foreground">ยังไม่ได้ลงทะเบียนคอร์ส</p>
                  )}
                  {items.map(({ course, enrollment }) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="flex items-center gap-1.5 truncate text-muted-foreground">
                        <GraduationCap className="h-3 w-3 shrink-0" />
                        {course.subject}
                      </span>
                      <span className="shrink-0 font-medium">
                        {course.type === "private"
                          ? `${enrollment.hoursUsed}/${enrollment.monthlyHours ?? course.defaultMonthlyHours} ชม.`
                          : formatBaht(enrollment.monthlyFee ?? course.monthlyFee ?? 0)}
                      </span>
                    </div>
                  ))}
                </div>

                <BillingMessageDialog student={student} items={items} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
