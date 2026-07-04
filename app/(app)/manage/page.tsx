"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddCourseForm } from "@/components/manage/add-course-form";
import { AddStudentForm } from "@/components/manage/add-student-form";
import { GraduationCap, UserPlus, Trash2, Search } from "lucide-react";

export default function ManagePage() {
  const { students, courses, deleteStudent, deleteCourse } = useStore();
  const [courseQuery, setCourseQuery] = React.useState("");
  const [studentQuery, setStudentQuery] = React.useState("");

  const filteredCourses = courses.filter((c) =>
    `${c.name} ${c.subject}`.toLowerCase().includes(courseQuery.trim().toLowerCase())
  );
  const filteredStudents = students.filter((s) =>
    `${s.name} ${s.grade}`.toLowerCase().includes(studentQuery.trim().toLowerCase())
  );

  async function handleDeleteCourse(id: string, name: string) {
    if (window.confirm(`ลบคอร์ส "${name}" ใช่ไหม? นักเรียนที่ลงทะเบียนคอร์สนี้จะถูกถอนออกด้วย`)) {
      await deleteCourse(id);
    }
  }

  async function handleDeleteStudent(id: string, name: string) {
    if (window.confirm(`ลบนักเรียน "${name}" ใช่ไหม? การลงทะเบียนคอร์สของนักเรียนคนนี้จะถูกลบด้วย`)) {
      await deleteStudent(id);
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
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาคอร์ส (ชื่อคอร์ส/วิชา)"
                value={courseQuery}
                onChange={(e) => setCourseQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {filteredCourses.map((c) => (
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
            {filteredCourses.length === 0 && courses.length > 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">ไม่พบคอร์สที่ค้นหา</p>
            )}
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
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหานักเรียน (ชื่อ/ระดับชั้น)"
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {filteredStudents.map((s) => (
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
            {filteredStudents.length === 0 && students.length > 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">ไม่พบนักเรียนที่ค้นหา</p>
            )}
            {students.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">ยังไม่มีนักเรียนในระบบ</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
