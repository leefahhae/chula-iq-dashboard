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
import { Copy, Check, Send, MessageCircle, Loader2 } from "lucide-react";

interface BillingMessageDialogProps {
  student: Student;
  items: BillingLineItem[];
}

export function BillingMessageDialog({ student, items }: BillingMessageDialogProps) {
  const { transactions, attendance } = useStore();
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [sendingLine, setSendingLine] = React.useState(false);
  const [lineSent, setLineSent] = React.useState(false);
  const [lineError, setLineError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setMessage(generateBillingMessage(student, items, transactions, attendance));
      setCopied(false);
      setLineSent(false);
      setLineError(null);
    }
  }, [open, student, items, transactions, attendance]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — user can still select & copy manually
    }
  }

  async function handleSendLine() {
    setSendingLine(true);
    setLineError(null);
    try {
      const res = await fetch("/api/line/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, message }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "ส่งข้อความไม่สำเร็จ");
      setLineSent(true);
      setTimeout(() => setLineSent(false), 2500);
    } catch (err) {
      setLineError(err instanceof Error ? err.message : "ส่งข้อความไม่สำเร็จ");
    } finally {
      setSendingLine(false);
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

        {student.lineUserId ? (
          <div className="flex flex-col gap-1.5">
            {lineError && <p className="text-xs text-destructive">{lineError}</p>}
            {lineSent && <p className="text-xs text-success">ส่งเข้า LINE ผู้ปกครองเรียบร้อยแล้ว</p>}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            ยังไม่ได้เชื่อมบัญชี LINE ของผู้ปกครองคนนี้ — เชื่อมได้ที่การ์ด "ข้อความ LINE เข้าใหม่"
            ด้านบนของหน้านี้ หลังผู้ปกครองแอดไลน์ OA ของสถาบันแล้ว
          </p>
        )}

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
          {student.lineUserId && (
            <Button variant="success" onClick={handleSendLine} disabled={sendingLine}>
              {sendingLine ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> กำลังส่ง...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4" /> ส่งผ่าน LINE อัตโนมัติ
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
