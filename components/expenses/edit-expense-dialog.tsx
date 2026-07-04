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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlipUpload } from "@/components/payment/slip-upload";
import { EXPENSE_CATEGORY_LABEL, type Expense, type ExpenseCategory, type PaymentMethod } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Pencil, Banknote, Landmark, Trash2 } from "lucide-react";

const CATEGORY_OPTIONS: ExpenseCategory[] = [
  "payroll",
  "materials",
  "utilities",
  "marketing",
  "misc",
];

export function EditExpenseDialog({ expense }: { expense: Expense }) {
  const { updateExpense, deleteExpense } = useStore();
  const [open, setOpen] = React.useState(false);

  const [title, setTitle] = React.useState(expense.title);
  const [amount, setAmount] = React.useState(String(expense.amount));
  const [category, setCategory] = React.useState<ExpenseCategory>(expense.category);
  const [method, setMethod] = React.useState<PaymentMethod>(expense.method);
  const [receiptImage, setReceiptImage] = React.useState<string | undefined>(expense.receiptImage);

  React.useEffect(() => {
    if (open) {
      setTitle(expense.title);
      setAmount(String(expense.amount));
      setCategory(expense.category);
      setMethod(expense.method);
      setReceiptImage(expense.receiptImage);
    }
  }, [open, expense]);

  async function handleSave() {
    const numericAmount = Number(amount);
    if (!title || !numericAmount || numericAmount <= 0) return;
    const ok = await updateExpense(expense.id, {
      title,
      amount: numericAmount,
      category,
      method,
      receiptImage,
    });
    if (ok) setOpen(false);
  }

  async function handleDelete() {
    if (window.confirm("ลบรายการรายจ่ายนี้ใช่ไหม? ลบแล้วกู้คืนไม่ได้")) {
      const ok = await deleteExpense(expense.id);
      if (ok) setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" aria-label="แก้ไขรายจ่าย">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>แก้ไขรายจ่าย</DialogTitle>
          <DialogDescription>ใช้เมื่อคีย์รายการ/จำนวนเงินผิด แก้ไขแล้วกดบันทึก</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>ชื่อรายการ/คำอธิบาย</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <Label>หมวดหมู่รายจ่าย</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {EXPENSE_CATEGORY_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>ช่องทางการจ่ายเงิน</Label>
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

          <SlipUpload
            value={receiptImage}
            onChange={setReceiptImage}
            label="รูปใบเสร็จ/หลักฐานการจ่ายเงิน"
            hint="ลากรูปมาวาง หรือคลิกเพื่ออัปโหลดใบเสร็จ"
          />
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
