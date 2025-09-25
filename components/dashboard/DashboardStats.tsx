"use client"

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"

import type { DashboardStat } from "@/hooks/useDashboardData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface DashboardStatsProps {
  stats: DashboardStat[]
  isLoading?: boolean
}

const currencyFormatter = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat("zh-TW", {
  style: "percent",
  maximumFractionDigits: 1,
})

const numberFormatter = new Intl.NumberFormat("zh-TW", {
  maximumFractionDigits: 0,
})

const formatValue = (value: number, format: DashboardStat["format"]) => {
  switch (format) {
    case "currency":
      return currencyFormatter.format(value)
    case "percent":
      return percentFormatter.format(value)
    default:
      return numberFormatter.format(value)
  }
}

const formatChange = (value: number | undefined, format: DashboardStat["format"] | "number") => {
  if (value === undefined) return ""
  if (format === "currency") return currencyFormatter.format(value)
  if (format === "percent") return percentFormatter.format(value)
  return numberFormatter.format(value)
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={`stat-skeleton-${index}`} className="border-white/10 bg-gradient-to-br from-white/5 to-white/0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-32" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <Card className="border-white/10 bg-slate-950/60 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold">暫無統計資料</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-white/70">
          尚未偵測到債務或還款資訊，新增資料後即可查看即時統計。
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const TrendIcon = stat.trend === "up" ? ArrowUpRight : stat.trend === "down" ? ArrowDownRight : Minus
        const trendColor =
          stat.trend === "up"
            ? "text-emerald-400"
            : stat.trend === "down"
            ? "text-sky-400"
            : "text-muted-foreground"

        return (
          <Card
            key={stat.id}
            className="relative overflow-hidden border-white/10 bg-gradient-to-br from-slate-950/70 via-slate-900/60 to-slate-950/90 text-white shadow-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(76,29,149,0.25),_transparent_60%)]" aria-hidden />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">{stat.label}</CardTitle>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                <Icon className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardContent className="relative space-y-3">
              <div className="text-3xl font-semibold tracking-tight">
                {formatValue(stat.value, stat.format)}
              </div>
              {stat.change !== undefined && stat.changeLabel ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className={cn("flex items-center gap-1 font-medium", trendColor)}>
                    <TrendIcon className="h-4 w-4" />
                    {formatChange(stat.change, stat.changeFormat ?? stat.format)}
                  </span>
                  <span className="text-white/70">{stat.changeLabel}</span>
                </div>
              ) : null}
              {stat.helperText ? (
                <p className="text-xs text-white/60">{stat.helperText}</p>
              ) : null}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
