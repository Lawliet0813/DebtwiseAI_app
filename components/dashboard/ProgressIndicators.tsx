"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { ProgressIndicatorDatum } from "@/hooks/useDashboardData"

interface ProgressIndicatorsProps {
  indicators: ProgressIndicatorDatum[]
  isLoading?: boolean
}

const STATUS_STYLES: Record<ProgressIndicatorDatum["status"], string> = {
  "on-track": "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  "at-risk": "border-amber-500/40 bg-amber-500/10 text-amber-300",
  "off-track": "border-rose-500/40 bg-rose-500/10 text-rose-300",
}

const STATUS_LABELS: Record<ProgressIndicatorDatum["status"], string> = {
  "on-track": "進度良好",
  "at-risk": "請注意",
  "off-track": "需立即關注",
}

export function ProgressIndicators({ indicators, isLoading }: ProgressIndicatorsProps) {
  if (isLoading) {
    return (
      <Card className="border-white/10 bg-slate-950/60 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">進度指標</CardTitle>
          <p className="text-sm text-white/60">掌握主要財務目標的完成度</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`progress-skeleton-${index}`} className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (indicators.length === 0) {
    return (
      <Card className="border-white/10 bg-slate-950/60 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">進度指標</CardTitle>
          <p className="text-sm text-white/60">尚無可顯示的進度指標，請先新增債務或還款資料。</p>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-white/10 bg-slate-950/60 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">進度指標</CardTitle>
        <p className="text-sm text-white/60">掌握主要財務目標的完成度</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {indicators.map((indicator) => {
          const Icon = indicator.icon
          return (
            <div key={indicator.id} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-white">{indicator.title}</p>
                    <p className="text-sm text-white/60">{indicator.targetLabel}</p>
                  </div>
                </div>
                <Badge className={`${STATUS_STYLES[indicator.status]} border`}>{STATUS_LABELS[indicator.status]}</Badge>
              </div>
              <Progress
                value={indicator.value}
                className="h-2 bg-white/10"
                indicatorClassName="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-white/70">
                <span>{indicator.description}</span>
                {indicator.helper ? <span className="text-white/50">{indicator.helper}</span> : null}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
