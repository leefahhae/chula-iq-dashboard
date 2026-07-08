"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlipUpload } from "@/components/payment/slip-upload";
import { RecentEntries } from "@/components/payment/recent-entries";
import type { PaymentMethod } from "@/lib/types";
import { getEnrollmentBalance } from "@/lib/analytics";
import { Banknote, Landmark, CheckCircle2, Wallet } from "lucide-react";
import { cn, formatBaht } from "@/lib/utils";

export default function PaymentEntryPage() {
  const { students, courses, enrollments, transactions, attendance, addTransaction, getCourse } =
    useStore();

  const [studentId, setStudentId] = React.useState<string>("");
  const [courseId, setCourseId] = React.useState<string>("");
  const [amount, setAmount] = React.useState<string>("");
  const [method, setMethod] = React.useState<PaymentMethod>("transfer");
  const [slipImage, setSlipImage] = React.useState<string | undefined>(undefined);
  const [note, setNote] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const studentEnrollments = React.useMemo(
    () => enrollments.filter((e) => e.studentId === studentId),
    [enrollments, studentId]
  );

  const availableCourses = studentEnrollments
    .map((e) => getCourse(e.courseId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const selectedEnrollment = studentEnrollments.find((e) => e.courseId === courseId);
  const selectedCourse = courseId ? getCourse(courseId) : undefined;

  const suggestedAmount = React.useMemo(() => {
    if (!selectedCourse || !selectedEnrollment) return null;
    // Suggests the remaining balance (accumulated due minus anything already
    // paid this month), so re-opening this form never suggests double-billing.
    return getEnrollmentBalance(selectedEnrollment, selectedCourse, transactions, attendance)
      .balance;
  }, [selectedCourse, selectedEnrollment, transactions, attendance]);

  function resetForm() {
    setStudentId("");
    setCourseId("");
    setAmount("");
    setMethod("transfer");
    setSlipImage(undefined);
    setNote("");
  }

  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!studentId || !courseId || !numericAmount || numericAmount <= 0 || submitting) return;

    setSubmitting(true);
    try {
      const ok = await addTransaction({
        studentId,
        courseId,
        amount: numericAmount,
        method,
        slipImage: method === "transfer" ? slipImage : undefined,
        note: note || undefined,
      });
      if (!ok) return;

      resetForm();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">บันทึกการรับเงิน</h1>
        <p className="text-sm text-muted-foreground">
          สำหรับกรณีผู้ปกครองโอนเงินทางแชท หรือจ่ายเงินสด แล้วแอดมินคีย์เข้าระบบภายหลัง
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary-500" />
              ฟอร์มรับเงิน
            </CardTitle>
            <CardDescription>เลือกนักเรียน คอร์ส และกรอกยอดที่รับจริง</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>ชื่อนักเรียน</Label>
                  <Select
                    value={studentId}
                    onValueChange={(v) => {
                      setStudentId(v);
                      setCourseId("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกนักเรียน" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.grade})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>คอร์สเรียน</Label>
                  <Select value={courseId} onValueChange={setCourseId} disabled={!studentId}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={studentId ? "เลือกคอร์ส" : "เลือกนักเรียนก่อน"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>จำนวนเงินที่รับจริง (บาท)</Label>
                <Input
                  type="number"
                  min={0}
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg font-semibold"
                />
                {suggestedAmount !== null && (
                  <button
                    type="button"
                    onClick={() => setAmount(String(suggestedAmount))}
                    className="text-xs text-primary-600 underline-offset-2 hover:underline"
                  >
                    ใช้ยอดแนะนำ: {formatBaht(suggestedAmount)}
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>ช่องทางชำระเงิน</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod("cash")}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors",
                      method === "cash"
                        ? "border-warning bg-warning/10 text-warning-text"
                        : "border-border text-muted-foreground hover:border-warning/50"
                    )}
                  >
                    <Banknote className="h-4 w-4" /> 💰 เงินสด (Cash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("transfer")}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors",
                      method === "transfer"
                        ? "border-primary bg-primary-50 text-primary-700"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    <Landmark className="h-4 w-4" /> เงินโอน / สแกน QR
                  </button>
                </div>
              </div>

              {method === "transfer" && (
                <SlipUpload value={slipImage} onChange={setSlipImage} />
              )}

              <div className="space-y-1.5">
                <Label>บันทึกเพิ่มเติม (ไม่บังคับ)</Label>
                <Textarea
                  placeholder="เช่น โอนตอนเที่ยง แจ้งในไลน์กลุ่มแล้ว"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button type="submit" size="lg" className="flex-1 sm:flex-none" disabled={submitting}>
                  {submitting ? "กำลังบันทึก..." : "บันทึกการรับเงิน"}
                </Button>
                {success && (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-success-text">
                    <CheckCircle2 className="h-4 w-4" /> บันทึกสำเร็จแล้ว
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <RecentEntries />
      </div>
    </div>
  );
}
