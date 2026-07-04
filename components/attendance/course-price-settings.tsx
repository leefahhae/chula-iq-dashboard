"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import type { Course } from "@/lib/types";
import { Settings2 } from "lucide-react";

export function CoursePriceSettings({ course }: { course: Course }) {
  const { updateCoursePrice } = useStore();
  const [hourlyRate, setHourlyRate] = React.useState(String(course.hourlyRate ?? ""));
  const [defaultHours, setDefaultHours] = React.useState(
    String(course.defaultMonthlyHours ?? "")
  );
  const [monthlyFee, setMonthlyFee] = React.useState(String(course.monthlyFee ?? ""));
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    setHourlyRate(String(course.hourlyRate ?? ""));
    setDefaultHours(String(course.defaultMonthlyHours ?? ""));
    setMonthlyFee(String(course.monthlyFee ?? ""));
  }, [course.id, course.hourlyRate, course.defaultMonthlyHours, course.monthlyFee]);

  async function save() {
    const ok =
      course.type === "private"
        ? await updateCoursePrice(course.id, {
            hourlyRate: Number(hourlyRate) || 0,
            defaultMonthlyHours: Number(defaultHours) || 0,
          })
        : await updateCoursePrice(course.id, { monthlyFee: Number(monthlyFee) || 0 });
    if (!ok) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Settings2 className="h-4 w-4 text-primary-500" />
          ตั้งค่าราคาคอร์ส: {course.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {course.type === "private" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">ค่าเรียนต่อชั่วโมง (บาท)</Label>
              <Input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">โควตาชั่วโมง/เดือน (ค่าเริ่มต้น)</Label>
              <Input
                type="number"
                value={defaultHours}
                onChange={(e) => setDefaultHours(e.target.value)}
              />
            </div>
            <Button onClick={save} variant="secondary">
              {saved ? "บันทึกแล้ว ✓" : "บันทึกการตั้งค่า"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">ค่าเรียนเหมาจ่ายต่อเดือน (บาท/วิชา)</Label>
              <Input
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                ใช้เป็นราคาเริ่มต้น — ปรับเฉพาะนักเรียนแต่ละคนได้ในตารางด้านล่าง (เช่น คอร์สปิดเทอม)
              </p>
            </div>
            <Button onClick={save} variant="secondary">
              {saved ? "บันทึกแล้ว ✓" : "บันทึกการตั้งค่า"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
