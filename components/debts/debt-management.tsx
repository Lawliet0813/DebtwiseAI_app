"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, RefreshCw, AlertTriangle } from "lucide-react"
import { AddDebtModal } from "./add-debt-modal"
import { cn } from "@/lib/utils"
import type { Debt, DebtFormData } from "@/lib/types/database"
import { useToast } from "@/hooks/use-toast"

type DebtWithOptionalDescription = Debt & { description?: string | null }

const debtTypeConfig: Record<Debt["type"], { emoji: string; label: string; color: string }> = {
  credit_card: { emoji: "💳", label: "信用卡", color: "border-red-500" },
  personal_loan: { emoji: "💰", label: "個人貸款", color: "border-purple-500" },
  mortgage: { emoji: "🏠", label: "房屋貸款", color: "border-blue-500" },
  student_loan: { emoji: "🎓", label: "學生貸款", color: "border-yellow-500" },
  car_loan: { emoji: "🚗", label: "車貸", color: "border-green-500" },
  other: { emoji: "📋", label: "其他", color: "border-gray-500" },
}

const currencyFormatter = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  maximumFractionDigits: 0,
})

const formatCurrency = (value: number) => currencyFormatter.format(value)

export function DebtManagement() {
  const [debts, setDebts] = useState<DebtWithOptionalDescription[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingDebtId, setDeletingDebtId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchDebts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/debts", { cache: "no-store" })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error ?? "獲取債務資料失敗")
      }

      setDebts(result.debts ?? [])
    } catch (err) {
      console.error("取得債務列表失敗", err)
      setError(err instanceof Error ? err.message : "無法載入債務資料")
      setDebts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDebts()
  }, [fetchDebts])

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined
    }

    const handleOpenAddDebt = () => setIsAddModalOpen(true)

    window.addEventListener("open-add-debt", handleOpenAddDebt)
    return () => {
      window.removeEventListener("open-add-debt", handleOpenAddDebt)
    }
  }, [])

  const summary = useMemo(() => {
    if (debts.length === 0) {
      return {
        totalBalance: 0,
        totalMinimum: 0,
        avgInterest: 0,
      }
    }

    const totalBalance = debts.reduce((sum, debt) => sum + (debt.current_balance ?? 0), 0)
    const totalMinimum = debts.reduce((sum, debt) => sum + (debt.minimum_payment ?? 0), 0)
    const avgInterest = debts.reduce((sum, debt) => sum + (debt.interest_rate ?? 0), 0) / debts.length

    return { totalBalance, totalMinimum, avgInterest }
  }, [debts])

  const handleAddDebt = useCallback(
    async (newDebt: DebtFormData) => {
      try {
        setIsMutating(true)
        setError(null)

        const response = await fetch("/api/debts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newDebt),
        })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error ?? "新增債務失敗")
        }

        setDebts((prev) => [result.debt, ...prev])

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("debt-added"))
        }
      } finally {
        setIsMutating(false)
      }
    },
    [],
  )

  const handleDeleteDebt = useCallback(
    async (id: string) => {
      try {
        setDeletingDebtId(id)

        const response = await fetch(`/api/debts/${id}`, {
          method: "DELETE",
        })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error ?? "刪除債務失敗")
        }

        setDebts((prev) => prev.filter((debt) => debt.id !== id))
        toast({ title: "債務已刪除" })

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("debt-added"))
        }
      } catch (err) {
        console.error("刪除債務失敗", err)
        toast({
          title: "刪除債務失敗",
          description: err instanceof Error ? err.message : "請稍後再試",
          variant: "destructive",
        })
      } finally {
        setDeletingDebtId(null)
      }
    },
    [toast],
  )

  const calculateProgress = useCallback((debt: DebtWithOptionalDescription) => {
    const total = debt.total_amount ?? debt.current_balance ?? 0
    if (total <= 0) return 0
    const paid = total - (debt.current_balance ?? 0)
    const ratio = (paid / total) * 100
    return Number.isFinite(ratio) ? Math.max(0, Math.min(100, ratio)) : 0
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="glass p-6">
              <div className="h-16 bg-gray-100 rounded" />
            </Card>
          ))}
        </div>
        <Card className="glass p-10 animate-pulse">
          <div className="h-32 bg-gray-100 rounded" />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>💳</span>
            債務管理
          </h1>
          <p className="text-gray-600">管理您的所有債務項目</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden md:inline-flex"
            onClick={fetchDebts}
            disabled={isMutating}
            title="重新整理"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            disabled={isMutating}
          >
            <Plus className="h-4 w-4 mr-2" />
            新增債務
          </Button>
        </div>
      </div>

      {error && (
        <Card className="glass border-red-200 bg-red-50 p-4 text-red-600 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-semibold">載入資料失敗</p>
            <p className="text-sm">{error}</p>
            <Button variant="link" className="px-0 text-red-600" onClick={fetchDebts}>
              重新嘗試
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{formatCurrency(summary.totalBalance)}</div>
            <div className="text-sm text-gray-600">總債務餘額</div>
          </div>
        </Card>
        <Card className="glass p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{formatCurrency(summary.totalMinimum)}</div>
            <div className="text-sm text-gray-600">月最低還款</div>
          </div>
        </Card>
        <Card className="glass p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{summary.avgInterest.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">平均利率</div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {debts.map((debt) => {
          const config = debtTypeConfig[debt.type]
          const progress = calculateProgress(debt)
          const paidAmount = (debt.total_amount ?? debt.current_balance ?? 0) - (debt.current_balance ?? 0)
          const dueDateText = debt.due_date ? new Date(debt.due_date).toLocaleDateString() : "—"

          return (
            <Card key={debt.id} className={cn("glass p-6 border-l-4", config?.color ?? "border-gray-200")}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{config?.emoji ?? "📄"}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">{debt.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {config?.label ?? "其他"}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteDebt(debt.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={deletingDebtId === debt.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-800">{formatCurrency(debt.current_balance ?? 0)}</div>
                  <div className="text-xs text-gray-600">目前餘額</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-800">{(debt.interest_rate ?? 0).toFixed(2)}%</div>
                  <div className="text-xs text-gray-600">利率</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-800">{formatCurrency(debt.minimum_payment ?? 0)}</div>
                  <div className="text-xs text-gray-600">最低還款</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-800">{dueDateText}</div>
                  <div className="text-xs text-gray-600">到期日</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-800">{formatCurrency(debt.total_amount ?? debt.current_balance ?? 0)}</div>
                  <div className="text-xs text-gray-600">原始金額</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">還款進度</span>
                  <span className="font-medium">{progress.toFixed(1)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>已還: {formatCurrency(Math.max(0, paidAmount))}</span>
                  <span>剩餘: {formatCurrency(debt.current_balance ?? 0)}</span>
                </div>
                {debt.description && (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-md p-3">{debt.description}</p>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {debts.length === 0 && !error && (
        <Card className="glass p-12 text-center">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">尚未新增任何債務</h3>
          <p className="text-gray-600 mb-6">開始記錄您的債務項目，制定還款計畫</p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            新增第一筆債務
          </Button>
        </Card>
      )}

      <AddDebtModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddDebt} />
    </div>
  )
}
