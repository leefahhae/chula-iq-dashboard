"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatBaht } from "@/lib/utils";
import { PieChart as PieChartIcon } from "lucide-react";

interface RevenueChannelChartProps {
  cash: number;
  transfer: number;
}

const COLORS = ["#f59e0b", "#f9457f"];

export function RevenueChannelChart({ cash, transfer }: RevenueChannelChartProps) {
  const data = [
    { name: "เงินสด", value: cash },
    { name: "เงินโอน", value: transfer },
  ];
  const total = cash + transfer;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <PieChartIcon className="h-4 w-4 text-primary-500" />
          สัดส่วนรายได้ตามช่องทาง (เดือนนี้)
        </CardTitle>
        <CardDescription>เงินสด vs เงินโอน</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">ยังไม่มีข้อมูลรายรับเดือนนี้</p>
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
                  {data.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatBaht(value)} />
                <Legend verticalAlign="bottom" height={28} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
