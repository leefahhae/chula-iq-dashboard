"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlipUpload } from "@/components/payment/slip-upload";
import { EXPENSE_CATEGORY_LABEL, type ExpenseCategory, type PaymentMethod } from "@/lib/types";
import { Banknote, Landmark, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS: ExpenseCategory[] = [
  "payroll",
  "materials",
  "utilities",
  "marketing",
  "misc",
];

export function ExpenseForm() {
  const { addExpense } = useStore();

  const [title, setTitle] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [category, setCategory] = React.useState<ExpenseCategory>("utilities");
  const [method, setMethod] = React.useState<PaymentMethod>("transfer");
  const [receiptImage, setReceiptImage] = React.useState<string | undefined>(undefined);
  const [success, setSuccess] = React.useState(false);

  function resetForm() {
    setTitle("");
    setAmount("");
    setCategory("utilities");
    setMethod("transfer");
    setReceiptImage(undefined);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!title || !numericAmount || numericAmount <= 0) return;

    addExpense({ title, amount: numericAmount, category, method, receiptImage });
    resetForm();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label>ชื่อรายการ/คำอธิบาย</Label>
        <Input
          placeholder="เช่น ค่าไฟประจำเดือน, ค่ากระดาษ"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>จำนวนเงิน (บาท)</Label>
          <Input
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="0.00"
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
              "flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors",
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
              "flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors",
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
        label="แนบรูปใบเสร็จ/หลักฐานการจ่ายเงิน"
        hint="ลากรูปมาวาง หรือคลิกเพื่ออัปโหลดใบเสร็จ"
      />

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" size="lg" className="flex-1 sm:flex-none">
          บันทึกรายจ่าย
        </Button>
        {success && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-success">
            <CheckCircle2 className="h-4 w-4" /> บันทึกสำเร็จแล้ว
          </span>
        )}
      </div>
    </form>
  );
}
