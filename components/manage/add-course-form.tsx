"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CourseType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, GraduationCap } from "lucide-react";

export function AddCourseForm() {
  const { addCourse } = useStore();

  const [name, setName] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [type, setType] = React.useState<CourseType>("private");
  const [hourlyRate, setHourlyRate] = React.useState("");
  const [defaultMonthlyHours, setDefaultMonthlyHours] = React.useState("8");
  const [monthlyFee, setMonthlyFee] = React.useState("1000");
  const [success, setSuccess] = React.useState(false);

  function resetForm() {
    setName("");
    setSubject("");
    setType("private");
    setHourlyRate("");
    setDefaultMonthlyHours("8");
    setMonthlyFee("1000");
  }

  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !subject || submitting) return;

    setSubmitting(true);
    try {
      const courseId = await addCourse({
        name,
        subject,
        type,
        hourlyRate: type === "private" ? Number(hourlyRate) || 0 : undefined,
        defaultMonthlyHours: type === "private" ? Number(defaultMonthlyHours) || 0 : undefined,
        monthlyFee: type === "group" ? Number(monthlyFee) || 0 : undefined,
      });
      if (!courseId) return;

      resetForm();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>ชื่อคอร์ส</Label>
        <Input
          placeholder="เช่น Chemistry ตัวต่อตัว ม.5"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>วิชา</Label>
        <Input placeholder="เช่น เคมี" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label>รูปแบบคอร์ส</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType("private")}
            className={cn(
              "rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-colors",
              type === "private"
                ? "border-primary bg-primary-50 text-primary-700"
                : "border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            คลาสเดี่ยว (Private)
          </button>
          <button
            type="button"
            onClick={() => setType("group")}
            className={cn(
              "rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-colors",
              type === "group"
                ? "border-primary bg-primary-50 text-primary-700"
                : "border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            คลาสกลุ่ม (Group)
          </button>
        </div>
      </div>

      {type === "private" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>ค่าเรียนต่อชั่วโมง (บาท)</Label>
            <Input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="เช่น 500"
            />
          </div>
          <div className="space-y-1.5">
            <Label>โควตาชั่วโมง/เดือน (ค่าเริ่มต้น)</Label>
            <Input
              type="number"
              value={defaultMonthlyHours}
              onChange={(e) => setDefaultMonthlyHours(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label>ค่าเรียนเหมาจ่ายต่อเดือน (บาท/วิชา)</Label>
          <Input type="number" value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} />
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={submitting}>
          <GraduationCap className="h-4 w-4" /> {submitting ? "กำลังบันทึก..." : "เพิ่มคอร์ส"}
        </Button>
        {success && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-success">
            <CheckCircle2 className="h-4 w-4" /> เพิ่มคอร์สแล้ว
          </span>
        )}
      </div>
    </form>
  );
}
