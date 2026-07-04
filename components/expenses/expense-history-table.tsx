"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { formatBaht, formatDateOnly } from "@/lib/utils";
import { EXPENSE_CATEGORY_LABEL } from "@/lib/types";
import { ImageIcon, Banknote, Landmark } from "lucide-react";

export function ExpenseHistoryTable() {
  const { expenses } = useStore();
  const [viewingReceipt, setViewingReceipt] = React.useState<string | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>วันที่</TableHead>
              <TableHead>รายการ</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead>ช่องทาง</TableHead>
              <TableHead className="text-right">จำนวนเงิน</TableHead>
              <TableHead className="text-right">หลักฐาน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((ex) => (
              <TableRow key={ex.id}>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDateOnly(ex.createdAt)}
                </TableCell>
                <TableCell className="font-medium">{ex.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{EXPENSE_CATEGORY_LABEL[ex.category]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={ex.method === "cash" ? "warning" : "success"}>
                    {ex.method === "cash" ? (
                      <>
                        <Banknote className="h-3 w-3" /> เงินสด
                      </>
                    ) : (
                      <>
                        <Landmark className="h-3 w-3" /> เงินโอน
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-destructive">
                  -{formatBaht(ex.amount)}
                </TableCell>
                <TableCell className="text-right">
                  {ex.receiptImage ? (
                    <Button size="sm" variant="ghost" onClick={() => setViewingReceipt(ex.receiptImage!)}>
                      <ImageIcon className="h-3.5 w-3.5" /> ดูหลักฐาน
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {expenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  ยังไม่มีรายการรายจ่าย
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewingReceipt} onOpenChange={(o) => !o && setViewingReceipt(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>หลักฐานการจ่ายเงิน</DialogTitle>
          </DialogHeader>
          {viewingReceipt && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={viewingReceipt}
              alt="ใบเสร็จ/หลักฐานการจ่ายเงิน"
              className="w-full rounded-xl border border-border"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
