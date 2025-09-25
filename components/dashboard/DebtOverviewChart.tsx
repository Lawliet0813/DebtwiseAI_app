"use client"

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Info } from "lucide-react"

import type { DebtCategoryDatum } from "@/hooks/useDashboardData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const COLORS = ["#6366F1", "#22D3EE", "#F59E0B", "#EF4444", "#A855F7", "#10B981", "#F97316"]

interface DebtOverviewChartProps {
  data: DebtCategoryDatum[]
  isLoading?: boolean
}

export function DebtOverviewChart({ data, isLoading }: DebtOverviewChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0)

  return (
    <Card className="h-full border-white/10 bg-slate-950/60 text-white shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">債務結構分析</CardTitle>
          <p className="text-sm text-white/60">了解不同類型債務的占比狀況</p>
        </div>
        <span className="rounded-full bg-white/10 p-2 text-white/80">
          <Info className="h-4 w-4" />
        </span>
      </CardHeader>
      <CardContent className="h-[320px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-white/60">
            <p className="text-sm">目前沒有債務資料，請新增債務以檢視分析。</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.category}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, _: string, item) => [
                  `${Number(value).toLocaleString()} 元`,
                  `${item?.payload?.category ?? ""}`,
                ]}
                labelFormatter={() => ""}
                contentStyle={{
                  background: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.75rem",
                  color: "white",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
        {!isLoading && data.length > 0 ? (
          <div className="mt-6 space-y-2 text-sm text-white/70">
            {data.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{item.category}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span>{Math.round(item.percentage)}%</span>
                  <span className="text-white/50">/</span>
                  <span>{item.value.toLocaleString()} 元</span>
                </div>
              </div>
            ))}
            <div className="mt-4 flex items-center justify-between text-sm font-semibold text-white">
              <span>債務總額</span>
              <span>{total.toLocaleString()} 元</span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
