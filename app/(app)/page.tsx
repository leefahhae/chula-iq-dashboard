"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { computeDashboardStats } from "@/lib/analytics";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChannelChart } from "@/components/dashboard/revenue-channel-chart";
import { ExpenseCategoryChart } from "@/components/dashboard/expense-category-chart";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatBaht } from "@/lib/utils";
import {
  Wallet,
  Landmark,
  Banknote,
  Receipt,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
} from "lucide-react";

export default function DashboardPage() {
  const { transactions, expenses } = useStore();

  const stats = useMemo(() => computeDashboardStats(transactions, expenses), [transactions, expenses]);

  const monthLabel = new Intl.DateTimeFormat("th-TH", { month: "long", year: "numeric" }).format(
    new Date()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">ภาพรวมการเงิน</h1>
          <p className="text-sm text-muted-foreground">สรุปยอดรับเงิน รายจ่าย และกำไรสุทธิของสถาบัน</p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <a href="/api/export" download>
            <FileSpreadsheet className="h-4 w-4" /> ส่งออก Excel (รายรับ-รายจ่ายทั้งหมด)
          </a>
        </Button>
      </div>

      {/* Top row: today's snapshot */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="ยอดรายรับรวมวันนี้"
          value={formatBaht(stats.todayTotal)}
          icon={Wallet}
          tone="primary"
          subtext={`${stats.todayTx.length} รายการ`}
        />
        <StatCard
          label="ยอดเงินโอนรวมวันนี้"
          value={formatBaht(stats.todayTransfer)}
          icon={Landmark}
          tone="success"
        />
        <StatCard
          label="ยอดเงินสดในลิ้นชัก"
          value={formatBaht(stats.cashOnHand)}
          icon={Banknote}
          tone="warning"
          subtext="สะสมทั้งหมด หักรายจ่ายเงินสดแล้ว"
        />
      </div>

      {/* Second row: monthly + expenses + profit */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`รายรับรวมเดือนนี้ (${monthLabel})`}
          value={formatBaht(stats.monthTotal)}
          icon={TrendingUp}
          tone="primary"
        />
        <StatCard
          label="แยกเงินสด / เงินโอน"
          value={`${formatBaht(stats.monthCash)} / ${formatBaht(stats.monthTransfer)}`}
          icon={Receipt}
          tone="neutral"
        />
        <StatCard
          label="รายจ่ายรวมเดือนนี้"
          value={formatBaht(stats.monthExpenseTotal)}
          icon={TrendingDown}
          tone="destructive"
        />
        <StatCard
          label="กำไรสุทธิประจำเดือน"
          value={formatBaht(stats.netProfit)}
          icon={Wallet}
          tone={stats.netProfit >= 0 ? "success" : "destructive"}
          subtext="รายรับรวม − รายจ่ายรวม"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RevenueChannelChart cash={stats.monthCash} transfer={stats.monthTransfer} />
        <ExpenseCategoryChart byCategory={stats.expenseByCategory} />
      </div>

      {/* Today's transactions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>รายการรับเงินทั้งหมดของวันนี้</CardTitle>
          <CardDescription>กดดูสลิปย้อนหลังได้จากตาราง</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionsTable transactions={stats.todayTx} />
        </CardContent>
      </Card>
    </div>
  );
}
