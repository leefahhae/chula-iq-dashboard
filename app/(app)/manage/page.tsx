"use client";

import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddCourseForm } from "@/components/manage/add-course-form";
import { AddStudentForm } from "@/components/manage/add-student-form";
import { GraduationCap, UserPlus, Trash2 } from "lucide-react";

export default function ManagePage() {
  const { students, courses, deleteStudent, deleteCourse } = useStore();

  function handleDeleteCourse(id: string, name: string) {
    if (window.confirm(`ลบคอร์ส "${name}" ใช่ไหม? นักเรียนที่ลงทะเบียนคอร์สนี้จะถูกถอนออกด้วย`)) {
      deleteCourse(id);
    }
  }

  function handleDeleteStudent(id: string, name: string) {
    if (window.confirm(`ลบนักเรียน "${name}" ใช่ไหม? การลงทะเบียนคอร์สของนักเรียนคนนี้จะถูกลบด้วย`)) {
      deleteStudent(id);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">จัดการนักเรียนและคอร์สเรียน</h1>
        <p className="text-sm text-muted-foreground">
          เพิ่มนักเรียนใหม่หรือคอร์สใหม่เข้าระบบได้จากหน้านี้ ไม่ต้องแก้โค้ด
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary-500" />
              เพิ่มคอร์สใหม่
            </CardTitle>
            <CardDescription>ตั้งราคาและรูปแบบคอร์สได้ตั้งแต่ตอนสร้าง</CardDescription>
          </CardHeader>
          <CardContent>
            <AddCourseForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary-500" />
              เพิ่มนักเรียนใหม่
            </CardTitle>
            <CardDescription>กรอกข้อมูลติดต่อผู้ปกครอง แล้วลงทะเบียนคอร์สได้เลย</CardDescription>
          </CardHeader>
          <CardContent>
            <AddStudentForm />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">คอร์สทั้งหมดในระบบ ({courses.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {courses.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.type === "private" ? "default" : "secondary"}>
                    {c.type === "private" ? "เดี่ยว" : "กลุ่ม"}
                  </Badge>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`ลบคอร์ส ${c.name}`}
                    onClick={() => handleDeleteCourse(c.id, c.name)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">ยังไม่มีคอร์สในระบบ</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">นักเรียนทั้งหมดในระบบ ({students.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {students.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm"
              >
                <p className="font-medium">{s.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{s.grade}</Badge>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`ลบนักเรียน ${s.name}`}
                    onClick={() => handleDeleteStudent(s.id, s.name)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">ยังไม่มีนักเรียนในระบบ</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
