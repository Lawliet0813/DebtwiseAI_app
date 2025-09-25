"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { endOfMonth, isAfter, isWithinInterval, startOfMonth, subMonths } from "date-fns"
import { CalendarClock, DollarSign, LineChart, Percent } from "lucide-react"

import { createClient } from "@/lib/supabase/client"

export type TrendDirection = "up" | "down" | "neutral"

export interface DashboardStat {
  id: string
  label: string
  value: number
  format: "currency" | "percent" | "number"
  change?: number
  changeFormat?: "currency" | "percent" | "number"
  changeLabel?: string
  trend?: TrendDirection
  helperText?: string
  icon: typeof DollarSign
}

export interface DebtCategoryDatum {
  category: string
  value: number
  percentage: number
}

export interface PaymentTrendDatum {
  month: string
  total: number
  cumulative: number
}

export interface ProgressIndicatorDatum {
  id: string
  title: string
  value: number
  targetLabel: string
  description: string
  icon: typeof DollarSign
  status: "on-track" | "at-risk" | "off-track"
  helper?: string
}

export interface DashboardDataState {
  stats: DashboardStat[]
  debtBreakdown: DebtCategoryDatum[]
  paymentTrend: PaymentTrendDatum[]
  progress: ProgressIndicatorDatum[]
  lastUpdated: Date | null
}

interface UseDashboardDataResult extends DashboardDataState {
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  refresh: () => Promise<void>
}

type DebtRow = {
  id: string
  user_id: string
  name: string
  original_amount: number | string
  current_amount: number | string
  monthly_payment: number | string
  interest_rate: number | string
  due_date: string | null
  category: string | null
  updated_at: string | null
}

type PaymentRow = {
  id: string
  user_id: string
  debt_id: string
  amount: number | string
  payment_date: string
  created_at: string
}

const currencyFormatter = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  maximumFractionDigits: 0,
})

const toNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const computeStatus = (value: number): "on-track" | "at-risk" | "off-track" => {
  if (value >= 80) return "on-track"
  if (value >= 50) return "at-risk"
  return "off-track"
}

const buildMonthBuckets = () => {
  const months: { key: string; label: string; start: Date; end: Date }[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i -= 1) {
    const date = subMonths(now, i)
    months.push({
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: `${date.getMonth() + 1}月`,
      start: startOfMonth(date),
      end: endOfMonth(date),
    })
  }

  return months
}

export function useDashboardData(userId?: string | null): UseDashboardDataResult {
  const supabase = useMemo(() => createClient(), [])
  const [state, setState] = useState<DashboardDataState>({
    stats: [],
    debtBreakdown: [],
    paymentTrend: [],
    progress: [],
    lastUpdated: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!userId) {
      setState({
        stats: [],
        debtBreakdown: [],
        paymentTrend: [],
        progress: [],
        lastUpdated: new Date(),
      })
      setIsLoading(false)
      return
    }

    setError(null)

    const [{ data: debts, error: debtsError }, { data: payments, error: paymentsError }] = await Promise.all([
      supabase.from("debts").select("id, user_id, name, original_amount, current_amount, monthly_payment, interest_rate, due_date, category, updated_at").eq("user_id", userId),
      supabase
        .from("payments")
        .select("id, user_id, debt_id, amount, payment_date, created_at")
        .eq("user_id", userId)
        .order("payment_date", { ascending: true }),
    ])

    if (debtsError || paymentsError) {
      throw new Error(debtsError?.message ?? paymentsError?.message ?? "無法載入儀表板資料")
    }

    const debtRows: DebtRow[] = debts ?? []
    const paymentRows: PaymentRow[] = payments ?? []

    const totalOriginal = debtRows.reduce((acc, debt) => acc + toNumber(debt.original_amount), 0)
    const totalCurrent = debtRows.reduce((acc, debt) => acc + toNumber(debt.current_amount), 0)
    const monthlyCommitment = debtRows.reduce((acc, debt) => acc + toNumber(debt.monthly_payment), 0)
    const averageInterest = debtRows.length
      ? debtRows.reduce((acc, debt) => acc + toNumber(debt.interest_rate), 0) / debtRows.length
      : 0
    const totalPaid = Math.max(totalOriginal - totalCurrent, 0)

    const now = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(now.getDate() - 30)
    const paymentsLast30Days = paymentRows.filter((payment) => {
      const paymentDate = new Date(payment.payment_date)
      return isWithinInterval(paymentDate, { start: thirtyDaysAgo, end: now })
    })
    const totalPaidLast30Days = paymentsLast30Days.reduce((acc, payment) => acc + toNumber(payment.amount), 0)

    const months = buildMonthBuckets()
    const paymentTrend = months.map((bucket) => {
      const total = paymentRows
        .filter((payment) => {
          const paymentDate = new Date(payment.payment_date)
          return isWithinInterval(paymentDate, { start: bucket.start, end: bucket.end })
        })
        .reduce((acc, payment) => acc + toNumber(payment.amount), 0)
      return {
        ...bucket,
        total,
      }
    })

    const cumulativeTrend: PaymentTrendDatum[] = paymentTrend.reduce<PaymentTrendDatum[]>((acc, bucket) => {
      const previousTotal = acc.at(-1)?.cumulative ?? 0
      const cumulative = previousTotal + bucket.total
      acc.push({ month: bucket.label, total: bucket.total, cumulative })
      return acc
    }, [])

    const categoryTotals = debtRows.reduce<Record<string, number>>((acc, debt) => {
      const categoryKey = debt.category || "其他"
      acc[categoryKey] = (acc[categoryKey] ?? 0) + toNumber(debt.current_amount)
      return acc
    }, {})

    const debtBreakdown: DebtCategoryDatum[] = Object.entries(categoryTotals).map(([category, value]) => ({
      category,
      value,
      percentage: totalCurrent ? (value / totalCurrent) * 100 : 0,
    }))

    debtBreakdown.sort((a, b) => b.value - a.value)

    const nextDueDebt = debtRows
      .map((debt) => ({
        ...debt,
        dueDate: debt.due_date ? new Date(debt.due_date) : null,
      }))
      .filter((debt) => debt.dueDate && isAfter(debt.dueDate, now))
      .sort((a, b) => (a.dueDate && b.dueDate ? a.dueDate.getTime() - b.dueDate.getTime() : 0))
      .at(0)

    const daysUntilNextPayment = nextDueDebt?.dueDate
      ? Math.ceil((nextDueDebt.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null

    const paydownProgress = totalOriginal ? Math.min((totalPaid / totalOriginal) * 100, 100) : 0
    const monthlyProgress = monthlyCommitment
      ? Math.min((totalPaidLast30Days / monthlyCommitment) * 100, 150)
      : totalPaidLast30Days > 0
      ? 100
      : 0
    const progress: ProgressIndicatorDatum[] = [
      {
        id: "paydown",
        title: "債務清償進度",
        value: paydownProgress,
        targetLabel: "目標：完全清償",
        description: `已償還 ${currencyFormatter.format(totalPaid)}`,
        icon: LineChart,
        status: computeStatus(paydownProgress),
        helper: totalOriginal
          ? `剩餘 ${currencyFormatter.format(totalCurrent)} / 總額 ${currencyFormatter.format(totalOriginal)}`
          : "等待新增債務資料",
      },
      {
        id: "monthly",
        title: "月度還款達成率",
        value: monthlyProgress,
        targetLabel: `月度承諾：${currencyFormatter.format(monthlyCommitment)}`,
        description: `近30天實付 ${currencyFormatter.format(totalPaidLast30Days)}`,
        icon: DollarSign,
        status: computeStatus(monthlyProgress),
        helper: monthlyCommitment
          ? monthlyProgress >= 100
            ? "超越既定還款目標"
            : "持續維持每月還款節奏"
          : "尚未設定月度還款金額",
      },
      {
        id: "nextDue",
        title: "下一筆到期",
        value:
          daysUntilNextPayment !== null
            ? Math.max(0, Math.min(100, ((30 - daysUntilNextPayment) / 30) * 100))
            : 0,
        targetLabel: nextDueDebt?.name ? `帳戶：${nextDueDebt.name}` : "目前無到期帳戶",
        description:
          daysUntilNextPayment !== null
            ? `距離到期還有 ${daysUntilNextPayment} 天`
            : "未找到到期資訊",
        icon: CalendarClock,
        status:
          daysUntilNextPayment !== null
            ? daysUntilNextPayment <= 7
              ? "off-track"
              : daysUntilNextPayment <= 14
              ? "at-risk"
              : "on-track"
            : "at-risk",
        helper: nextDueDebt?.dueDate
          ? `到期日：${nextDueDebt.dueDate.toLocaleDateString("zh-TW")}`
          : "請確認債務到期日設定",
      },
    ]

    const stats: DashboardStat[] = [
      {
        id: "currentDebt",
        label: "目前債務餘額",
        value: totalCurrent,
        format: "currency",
        change: totalPaidLast30Days,
        changeFormat: "currency",
        changeLabel: "過去30天已償還",
        trend: totalPaidLast30Days > 0 ? "down" : "neutral",
        helperText: totalOriginal
          ? `原始總額 ${currencyFormatter.format(totalOriginal)}`
          : "等待新增債務資料",
        icon: DollarSign,
      },
      {
        id: "monthlyCommitment",
        label: "月度還款承諾",
        value: monthlyCommitment,
        format: "currency",
        change: totalPaidLast30Days,
        changeFormat: "currency",
        changeLabel: "近30天實際還款",
        trend: totalPaidLast30Days >= monthlyCommitment ? "up" : "neutral",
        helperText: monthlyCommitment
          ? "建議持續達成或超越目標"
          : "建議設定月度還款金額",
        icon: LineChart,
      },
      {
        id: "totalPaid",
        label: "累計已償還",
        value: totalPaid,
        format: "currency",
        change: paydownProgress,
        changeFormat: "percent",
        changeLabel: "清償進度",
        trend: paydownProgress > 0 ? "up" : "neutral",
        helperText: paydownProgress > 0 ? "保持這樣的還款節奏" : "尚未開始清償",
        icon: DollarSign,
      },
      {
        id: "averageRate",
        label: "平均利率",
        value: averageInterest,
        format: "percent",
        change: averageInterest,
        changeFormat: "percent",
        changeLabel: "目前加權平均",
        trend: averageInterest <= 0.1 ? "down" : averageInterest >= 0.2 ? "up" : "neutral",
        helperText: "優先清償高利率債務",
        icon: Percent,
      },
    ]

    const formattedTrend = cumulativeTrend.map((item) => ({
      month: item.month,
      total: Number(item.total.toFixed(0)),
      cumulative: Number(item.cumulative.toFixed(0)),
    }))

    setState({
      stats,
      debtBreakdown,
      paymentTrend: formattedTrend,
      progress,
      lastUpdated: new Date(),
    })
  }, [supabase, userId])

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        await fetchData()
      } catch (err) {
        console.error(err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : "發生未知錯誤")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [fetchData])

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await fetchData()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "發生未知錯誤")
    } finally {
      setIsRefreshing(false)
    }
  }, [fetchData])

  return {
    ...state,
    isLoading,
    isRefreshing,
    error,
    refresh,
  }
}
