"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatBaht } from "@/lib/utils";
import { EXPENSE_CATEGORY_COLOR, EXPENSE_CATEGORY_LABEL, type ExpenseCategory } from "@/lib/types";
import { Receipt } from "lucide-react";

interface ExpenseCategoryChartProps {
  byCategory: Record<ExpenseCategory, number>;
}

export function ExpenseCategoryChart({ byCategory }: ExpenseCategoryChartProps) {
  const data = (Object.keys(byCategory) as ExpenseCategory[])
    .map((key) => ({ key, name: EXPENSE_CATEGORY_LABEL[key], value: byCategory[key] }))
    .filter((d) => d.value > 0);

  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Receipt className="h-4 w-4 text-primary-500" />
          สัดส่วนรายจ่ายตามหมวดหมู่ (เดือนนี้)
        </CardTitle>
        <CardDescription>ดูว่าเงินหมดไปกับอะไรมากที่สุด</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">ยังไม่มีรายจ่ายเดือนนี้</p>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {data.map((d) => (
                    <Cell
                      key={d.key}
                      fill={EXPENSE_CATEGORY_COLOR[d.key]}
                      stroke="#15171a"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatBaht(value)} />
                <Legend verticalAlign="bottom" height={40} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
