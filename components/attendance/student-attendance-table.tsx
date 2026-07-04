"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { formatBaht } from "@/lib/utils";
import { CheckCircle2, XCircle, CalendarClock, Pencil } from "lucide-react";
import type { Course } from "@/lib/types";

export function StudentAttendanceTable({ course }: { course: Course }) {
  const {
    enrollments,
    attendance,
    getStudent,
    markAttendance,
    updateEnrollmentHours,
    updateEnrollmentFee,
  } = useStore();

  const rows = enrollments.filter((e) => e.courseId === course.id);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");

  function startEdit(enrollmentId: string, currentValue: number) {
    setEditingId(enrollmentId);
    setEditValue(String(currentValue));
  }

  function saveEdit(enrollmentId: string) {
    const val = Number(editValue) || 0;
    if (course.type === "private") updateEnrollmentHours(enrollmentId, val);
    else updateEnrollmentFee(enrollmentId, val);
    setEditingId(null);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>นักเรียน</TableHead>
            <TableHead>{course.type === "private" ? "ชั่วโมงเรียน" : "สถิติเข้าเรียน"}</TableHead>
            <TableHead>{course.type === "private" ? "ยอดสะสมเดือนนี้" : "ค่าเรียนรายเดือน"}</TableHead>
            <TableHead className="text-right">เช็คชื่อวันนี้</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((enrollment) => {
            const student = getStudent(enrollment.studentId);
            if (!student) return null;

            const isEditing = editingId === enrollment.id;

            if (course.type === "private") {
              const quota = enrollment.monthlyHours ?? course.defaultMonthlyHours ?? 0;
              const used = enrollment.hoursUsed;
              const pct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
              const amountDue = Math.round(used * (course.hourlyRate ?? 0));

              return (
                <TableRow key={enrollment.id}>
                  <TableCell>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.grade}</p>
                  </TableCell>
                  <TableCell className="min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {used}/
                        {isEditing ? (
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(enrollment.id)}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit(enrollment.id)}
                            className="ml-0.5 w-12 rounded border border-primary-300 px-1 text-sm"
                          />
                        ) : (
                          <button
                            onClick={() => startEdit(enrollment.id, quota)}
                            className="ml-0.5 inline-flex items-center gap-0.5 underline decoration-dotted underline-offset-2"
                          >
                            {quota} ชม. <Pencil className="h-3 w-3 text-muted-foreground" />
                          </button>
                        )}
                      </span>
                    </div>
                    <Progress value={pct} className="mt-1.5" />
                  </TableCell>
                  <TableCell className="font-semibold text-primary-700">
                    {formatBaht(amountDue)}
                  </TableCell>
                  <TableCell>
                    <AttendanceButtons enrollmentId={enrollment.id} onMark={markAttendance} />
                  </TableCell>
                </TableRow>
              );
            }

            // Group class
            const records = attendance.filter((a) => a.enrollmentId === enrollment.id);
            const present = records.filter((r) => r.status === "present").length;
            const absent = records.filter((r) => r.status === "absent").length;
            const leave = records.filter((r) => r.status === "leave").length;
            const fee = enrollment.monthlyFee ?? course.monthlyFee ?? 0;

            return (
              <TableRow key={enrollment.id}>
                <TableCell>
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.grade}</p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="success">มา {present}</Badge>
                    <Badge variant="destructive">ขาด {absent}</Badge>
                    <Badge variant="warning">ลา {leave}</Badge>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-primary-700">
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(enrollment.id)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(enrollment.id)}
                      className="w-20 rounded border border-primary-300 px-1.5 py-0.5 text-sm"
                    />
                  ) : (
                    <button
                      onClick={() => startEdit(enrollment.id, fee)}
                      className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-2"
                    >
                      {formatBaht(fee)} <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </TableCell>
                <TableCell>
                  <AttendanceButtons enrollmentId={enrollment.id} onMark={markAttendance} />
                </TableCell>
              </TableRow>
            );
          })}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                ยังไม่มีนักเรียนในคอร์สนี้
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function AttendanceButtons({
  enrollmentId,
  onMark,
}: {
  enrollmentId: string;
  onMark: (id: string, status: "present" | "absent" | "leave") => void;
}) {
  return (
    <div className="flex justify-end gap-1.5">
      <Button
        size="sm"
        variant="success"
        onClick={() => onMark(enrollmentId, "present")}
        className="px-2.5"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">มาเรียน</span>
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => onMark(enrollmentId, "absent")}
        className="px-2.5"
      >
        <XCircle className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">ขาดเรียน</span>
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onMark(enrollmentId, "leave")}
        className="px-2.5"
      >
        <CalendarClock className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">ลาเรียน</span>
      </Button>
    </div>
  );
}
