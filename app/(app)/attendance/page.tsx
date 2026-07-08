"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import { CoursePriceSettings } from "@/components/attendance/course-price-settings";
import { StudentAttendanceTable } from "@/components/attendance/student-attendance-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users2, CheckCheck } from "lucide-react";

export default function AttendancePage() {
  const { courses, enrollments, markAllPresent } = useStore();
  const [courseId, setCourseId] = React.useState(courses[0]?.id ?? "");

  const selectedCourse = courses.find((c) => c.id === courseId);
  const courseEnrollmentCount = enrollments.filter((e) => e.courseId === courseId).length;

  async function handleMarkAllPresent() {
    if (!selectedCourse) return;
    if (
      window.confirm(
        `เช็คชื่อ "มาเรียน" ให้นักเรียนทุกคนในคอร์ส "${selectedCourse.name}" (${courseEnrollmentCount} คน) ใช่ไหม?`
      )
    ) {
      await markAllPresent(selectedCourse.id);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">เช็คชื่อและคำนวณยอดเงินอัตโนมัติ</h1>
        <p className="text-sm text-muted-foreground">
          เลือกคอร์ส แล้วติ๊กเช็คชื่อได้ทันทีบนมือถือหรือแท็บเล็ต
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {courses.map((c) => {
          const count = enrollments.filter((e) => e.courseId === c.id).length;
          const active = c.id === courseId;
          return (
            <button
              key={c.id}
              onClick={() => setCourseId(c.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all",
                active
                  ? "border-foreground bg-primary text-primary-foreground shadow-brutal-sm"
                  : "border-foreground/30 bg-white text-foreground/70 hover:border-foreground"
              )}
            >
              {c.name}
              <Badge
                variant={active ? "secondary" : "outline"}
                className={cn(active && "border-foreground bg-white/40 text-primary-foreground")}
              >
                <Users2 className="h-3 w-3" /> {count}
              </Badge>
            </button>
          );
        })}
      </div>

      {selectedCourse && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant={selectedCourse.type === "private" ? "default" : "secondary"}>
                {selectedCourse.type === "private" ? "คลาสเดี่ยว (Private)" : "คลาสกลุ่ม (Group)"}
              </Badge>
              <span className="text-sm text-muted-foreground">วิชา{selectedCourse.subject}</span>
            </div>
            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={handleMarkAllPresent}
              disabled={courseEnrollmentCount === 0}
            >
              <CheckCheck className="h-4 w-4" /> เช็คชื่อมาเรียนทั้งหมด
            </Button>
          </div>

          <CoursePriceSettings course={selectedCourse} />
          <StudentAttendanceTable course={selectedCourse} />
        </div>
      )}
    </div>
  );
}
