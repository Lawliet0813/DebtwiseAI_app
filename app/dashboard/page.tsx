"use client"

import { formatDistanceToNow } from "date-fns"
import { zhTW } from "date-fns/locale"
import { RefreshCcw, ShieldCheck, Sparkles } from "lucide-react"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { DebtOverviewChart } from "@/components/dashboard/DebtOverviewChart"
import { PaymentTrendChart } from "@/components/dashboard/PaymentTrendChart"
import { ProgressIndicators } from "@/components/dashboard/ProgressIndicators"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useDashboardData } from "@/hooks/useDashboardData"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const {
    stats,
    debtBreakdown,
    paymentTrend,
    progress,
    lastUpdated,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useDashboardData(user?.id)

  const isBusy = authLoading || isLoading

  const lastUpdatedLabel = lastUpdated
    ? formatDistanceToNow(lastUpdated, { addSuffix: true, locale: zhTW })
    : "尚未更新"

  return (
    <ProtectedRoute>
      <div className="min-h-[calc(100vh-5rem)] pb-24 md:pb-12">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4">
          <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="space-y-3 text-[#111827]">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-600">
                    <ShieldCheck className="mr-1 h-3.5 w-3.5" /> 智慧守護
                  </Badge>
                  <span className="font-medium text-gray-600">最後更新：{lastUpdatedLabel}</span>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-[#111827] md:text-4xl">財務健康儀表板</h1>
                  <p className="max-w-2xl text-sm text-gray-600 md:text-base">
                    透過 AI 智能整合，即時掌握債務狀況、還款進度與風險預警，打造專屬於你的財務策略。
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-[#111827] sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  className="border-gray-300 bg-white text-[#111827] hover:bg-gray-50"
                  onClick={() => refresh()}
                  disabled={isRefreshing || isBusy}
                >
                  <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  {isRefreshing ? "刷新中" : "重新整理"}
                </Button>
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
                  <Sparkles className="mr-2 h-4 w-4" /> 產生 AI 洞察
                </Button>
              </div>
            </div>
          </section>

          {error ? (
            <Alert className="border-rose-400/60 bg-rose-500/20 text-rose-50">
              <AlertTitle>資料載入失敗</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <DashboardStats stats={stats} isLoading={isBusy} />

          <section className="grid gap-6 lg:grid-cols-2">
            <DebtOverviewChart data={debtBreakdown} isLoading={isBusy} />
            <PaymentTrendChart data={paymentTrend} isLoading={isBusy} />
          </section>

          <ProgressIndicators indicators={progress} isLoading={isBusy} />
        </div>

        <FloatingActionButton />
        <MobileNav />
      </div>
    </ProtectedRoute>
  )
}
