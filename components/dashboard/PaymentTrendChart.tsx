"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { CalendarRange } from "lucide-react"

import type { PaymentTrendDatum } from "@/hooks/useDashboardData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface PaymentTrendChartProps {
  data: PaymentTrendDatum[]
  isLoading?: boolean
}

export function PaymentTrendChart({ data, isLoading }: PaymentTrendChartProps) {
  const hasData = data.some((item) => item.total > 0)

  return (
    <Card className="h-full border-white/10 bg-slate-950/60 text-white shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">還款趨勢</CardTitle>
          <p className="text-sm text-white/60">追蹤近六個月的還款節奏與累計進度</p>
        </div>
        <span className="rounded-full bg-white/10 p-2 text-white/80">
          <CalendarRange className="h-4 w-4" />
        </span>
      </CardHeader>
      <CardContent className="h-[320px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : !hasData ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-white/60">
            <p className="text-sm">尚無還款記錄，開始新增支付以查看趨勢。</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" tickLine={false} axisLine={false} />
              <YAxis
                stroke="rgba(255,255,255,0.6)"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              <Tooltip
                formatter={(value: number) => `${Number(value).toLocaleString()} 元`}
                contentStyle={{
                  background: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.75rem",
                  color: "white",
                }}
              />
              <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)" }} />
              <Line type="monotone" dataKey="total" name="當月還款" stroke="#22D3EE" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="cumulative" name="累計還款" stroke="#A855F7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
