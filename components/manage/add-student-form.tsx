"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, UserPlus } from "lucide-react";

export function AddStudentForm() {
  const { courses, addStudent, addEnrollment } = useStore();

  const [name, setName] = React.useState("");
  const [grade, setGrade] = React.useState("");
  const [parentName, setParentName] = React.useState("");
  const [parentLine, setParentLine] = React.useState("");
  const [parentFacebook, setParentFacebook] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [selectedCourses, setSelectedCourses] = React.useState<Record<string, boolean>>({});
  const [overrides, setOverrides] = React.useState<Record<string, string>>({});
  const [success, setSuccess] = React.useState(false);

  function toggleCourse(courseId: string, defaultValue: number | undefined) {
    setSelectedCourses((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
    setOverrides((prev) => ({ ...prev, [courseId]: prev[courseId] ?? String(defaultValue ?? "") }));
  }

  function resetForm() {
    setName("");
    setGrade("");
    setParentName("");
    setParentLine("");
    setParentFacebook("");
    setPhone("");
    setSelectedCourses({});
    setOverrides({});
  }

  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !grade || submitting) return;

    setSubmitting(true);
    try {
      const studentId = await addStudent({
        name,
        grade,
        parentName,
        parentLine,
        parentFacebook,
        phone: phone || undefined,
      });
      if (!studentId) return;

      for (const course of courses) {
        if (!selectedCourses[course.id]) continue;
        const overrideValue = Number(overrides[course.id]) || 0;
        if (course.type === "private") {
          await addEnrollment({ studentId, courseId: course.id, monthlyHours: overrideValue });
        } else {
          await addEnrollment({ studentId, courseId: course.id, monthlyFee: overrideValue });
        }
      }

      resetForm();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>ชื่อนักเรียน</Label>
          <Input placeholder="เช่น น้องออม" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>ระดับชั้น</Label>
          <Input placeholder="เช่น ม.5" value={grade} onChange={(e) => setGrade(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>ชื่อผู้ปกครอง</Label>
          <Input
            placeholder="เช่น คุณสมชาย (พ่อ)"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>เบอร์โทร (ไม่บังคับ)</Label>
          <Input placeholder="08x-xxx-xxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>ชื่อบัญชี LINE ผู้ปกครอง</Label>
          <Input value={parentLine} onChange={(e) => setParentLine(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>ชื่อ/ลิงก์ Facebook ผู้ปกครอง</Label>
          <Input value={parentFacebook} onChange={(e) => setParentFacebook(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>ลงทะเบียนคอร์ส (เลือกได้ทันที ไม่บังคับ)</Label>
        <div className="space-y-2">
          {courses.map((course) => {
            const checked = !!selectedCourses[course.id];
            return (
              <div
                key={course.id}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 transition-colors",
                  checked ? "border-primary bg-primary-50" : "border-border"
                )}
              >
                <label className="flex flex-1 min-w-[160px] items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      toggleCourse(
                        course.id,
                        course.type === "private" ? course.defaultMonthlyHours : course.monthlyFee
                      )
                    }
                  />
                  {course.name}
                </label>
                {checked && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      {course.type === "private" ? "โควตาชม./เดือน" : "ค่าเรียน/เดือน"}
                    </span>
                    <input
                      type="number"
                      value={overrides[course.id] ?? ""}
                      onChange={(e) =>
                        setOverrides((prev) => ({ ...prev, [course.id]: e.target.value }))
                      }
                      className="w-20 rounded-lg border border-input px-2 py-1 text-sm"
                    />
                  </div>
                )}
              </div>
            );
          })}
          {courses.length === 0 && (
            <p className="text-sm text-muted-foreground">ยังไม่มีคอร์สในระบบ เพิ่มคอร์สก่อนได้ที่การ์ดด้านบน</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={submitting}>
          <UserPlus className="h-4 w-4" /> {submitting ? "กำลังบันทึก..." : "เพิ่มนักเรียน"}
        </Button>
        {success && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-success">
            <CheckCircle2 className="h-4 w-4" /> เพิ่มนักเรียนแล้ว
          </span>
        )}
      </div>
    </form>
  );
}
