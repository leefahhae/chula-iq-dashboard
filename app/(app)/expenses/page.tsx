"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseHistoryTable } from "@/components/expenses/expense-history-table";
import { Receipt } from "lucide-react";

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">บันทึกและจัดการรายจ่าย</h1>
        <p className="text-sm text-muted-foreground">
          บันทึกค่าใช้จ่ายของสถาบัน พร้อมแนบหลักฐาน แล้วดูสรุปย้อนหลังได้ทันที
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary-500" />
            บันทึกรายจ่ายใหม่
          </CardTitle>
          <CardDescription>กรอกรายการ จำนวนเงิน หมวดหมู่ และช่องทางการจ่ายเงิน</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติรายจ่ายทั้งหมด</CardTitle>
          <CardDescription>เรียงจากล่าสุด</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseHistoryTable />
        </CardContent>
      </Card>
    </div>
  );
}
