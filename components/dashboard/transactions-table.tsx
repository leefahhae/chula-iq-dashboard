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
import { formatBaht, formatDateThai } from "@/lib/utils";
import type { Transaction } from "@/lib/types";
import { ImageIcon, Banknote, Landmark } from "lucide-react";

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  const { getStudent, getCourse } = useStore();
  const [viewingSlip, setViewingSlip] = React.useState<string | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เวลา</TableHead>
              <TableHead>นักเรียน</TableHead>
              <TableHead>คอร์ส</TableHead>
              <TableHead>ช่องทาง</TableHead>
              <TableHead className="text-right">จำนวนเงิน</TableHead>
              <TableHead className="text-right">สลิป</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => {
              const student = getStudent(tx.studentId);
              const course = getCourse(tx.courseId);
              return (
                <TableRow key={tx.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateThai(tx.createdAt)}
                  </TableCell>
                  <TableCell className="font-medium">{student?.name ?? "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{course?.name ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={tx.method === "cash" ? "warning" : "success"}>
                      {tx.method === "cash" ? (
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
                  <TableCell className="text-right font-semibold text-primary-700">
                    {formatBaht(tx.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {tx.slipImage ? (
                      <Button size="sm" variant="ghost" onClick={() => setViewingSlip(tx.slipImage!)}>
                        <ImageIcon className="h-3.5 w-3.5" /> ดูสลิป
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  ยังไม่มีรายการรับเงินวันนี้
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewingSlip} onOpenChange={(o) => !o && setViewingSlip(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>รูปสลิปโอนเงิน</DialogTitle>
          </DialogHeader>
          {viewingSlip && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={viewingSlip} alt="สลิปโอนเงิน" className="w-full rounded-xl border border-border" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
