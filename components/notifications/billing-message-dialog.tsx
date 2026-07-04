"use client";

import * as React from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { generateBillingMessage, type BillingLineItem } from "@/lib/billing-template";
import type { Student } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Copy, Check, Send } from "lucide-react";

interface BillingMessageDialogProps {
  student: Student;
  items: BillingLineItem[];
}

export function BillingMessageDialog({ student, items }: BillingMessageDialogProps) {
  const { transactions } = useStore();
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setMessage(generateBillingMessage(student, items, transactions));
      setCopied(false);
    }
  }, [open, student, items, transactions]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — user can still select & copy manually
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" disabled={items.length === 0}>
          <Send className="h-3.5 w-3.5" /> สร้างข้อความแจ้งยอด
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>ข้อความแจ้งยอด — {student.name}</DialogTitle>
          <DialogDescription>
            พรีวิวข้อความสรุปยอดเงิน/ชั่วโมงเรียน แก้ไขได้ก่อนคัดลอกไปวางใน LINE หรือ Facebook
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={14}
          className="font-mono text-sm leading-relaxed"
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            ปิด
          </Button>
          <Button onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4" /> คัดลอกแล้ว
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> คัดลอกข้อความ
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
