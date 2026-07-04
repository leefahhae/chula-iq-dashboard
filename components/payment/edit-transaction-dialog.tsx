"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlipUpload } from "@/components/payment/slip-upload";
import type { PaymentMethod, Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Pencil, Banknote, Landmark, Trash2 } from "lucide-react";

export function EditTransactionDialog({ transaction }: { transaction: Transaction }) {
  const { students, enrollments, getCourse, updateTransaction, deleteTransaction } = useStore();
  const [open, setOpen] = React.useState(false);

  const [studentId, setStudentId] = React.useState(transaction.studentId);
  const [courseId, setCourseId] = React.useState(transaction.courseId);
  const [amount, setAmount] = React.useState(String(transaction.amount));
  const [method, setMethod] = React.useState<PaymentMethod>(transaction.method);
  const [slipImage, setSlipImage] = React.useState<string | undefined>(transaction.slipImage);
  const [note, setNote] = React.useState(transaction.note ?? "");

  React.useEffect(() => {
    if (open) {
      setStudentId(transaction.studentId);
      setCourseId(transaction.courseId);
      setAmount(String(transaction.amount));
      setMethod(transaction.method);
      setSlipImage(transaction.slipImage);
      setNote(transaction.note ?? "");
    }
  }, [open, transaction]);

  const availableCourses = enrollments
    .filter((e) => e.studentId === studentId)
    .map((e) => getCourse(e.courseId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  function handleSave() {
    const numericAmount = Number(amount);
    if (!studentId || !courseId || !numericAmount || numericAmount <= 0) return;
    updateTransaction(transaction.id, {
      studentId,
      courseId,
      amount: numericAmount,
      method,
      slipImage: method === "transfer" ? slipImage : undefined,
      note: note || undefined,
    });
    setOpen(false);
  }

  function handleDelete() {
    if (window.confirm("ลบรายการรับเงินนี้ใช่ไหม? ลบแล้วกู้คืนไม่ได้")) {
      deleteTransaction(transaction.id);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" aria-label="แก้ไขรายการรับเงิน">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>แก้ไขรายการรับเงิน</DialogTitle>
          <DialogDescription>ใช้เมื่อคีย์ยอด/เลือกนักเรียนผิด แก้ไขแล้วกดบันทึก</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกคอร์ส" />
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
            <Label>จำนวนเงิน (บาท)</Label>
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Label>ช่องทางชำระเงิน</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod("cash")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-colors",
                  method === "cash"
                    ? "border-warning bg-warning/10 text-warning"
                    : "border-border text-muted-foreground hover:border-warning/50"
                )}
              >
                <Banknote className="h-4 w-4" /> เงินสด
              </button>
              <button
                type="button"
                onClick={() => setMethod("transfer")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-colors",
                  method === "transfer"
                    ? "border-primary bg-primary-50 text-primary-700"
                    : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                <Landmark className="h-4 w-4" /> เงินโอน
              </button>
            </div>
          </div>

          {method === "transfer" && <SlipUpload value={slipImage} onChange={setSlipImage} />}

          <div className="space-y-1.5">
            <Label>บันทึกเพิ่มเติม</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="destructive" onClick={handleDelete} type="button">
            <Trash2 className="h-4 w-4" /> ลบรายการนี้
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              ยกเลิก
            </Button>
            <Button onClick={handleSave} type="button">
              บันทึกการแก้ไข
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
