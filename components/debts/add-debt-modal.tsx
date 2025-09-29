"use client"

import { useCallback, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import type { DebtFormData } from "@/lib/types/database"
import { useToast } from "@/hooks/use-toast"

interface AddDebtModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (debt: DebtFormData) => Promise<void>
}

const debtTypes: Array<{ value: DebtFormData["type"]; label: string; emoji: string }> = [
  { value: "credit_card", label: "信用卡", emoji: "💳" },
  { value: "personal_loan", label: "個人貸款", emoji: "💰" },
  { value: "mortgage", label: "房屋貸款", emoji: "🏠" },
  { value: "student_loan", label: "學生貸款", emoji: "🎓" },
  { value: "car_loan", label: "車貸", emoji: "🚗" },
  { value: "other", label: "其他", emoji: "📋" },
]

const createInitialFormState = (): DebtFormData => ({
  name: "",
  type: "credit_card",
  total_amount: 0,
  current_balance: 0,
  interest_rate: 0,
  minimum_payment: 0,
  due_date: undefined,
  description: "",
})

export function AddDebtModal({ isOpen, onClose, onAdd }: AddDebtModalProps) {
  const [formData, setFormData] = useState<DebtFormData>(createInitialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const resetForm = useCallback(() => {
    setFormData(createInitialFormState())
  }, [])

  const handleRequestClose = useCallback(() => {
    if (isSubmitting) return
    onClose()
  }, [isSubmitting, onClose])

  const handleDialogChange = useCallback(
    (open: boolean) => {
      if (open) return
      handleRequestClose()
    },
    [handleRequestClose],
  )

  const handleInputChange = useCallback(<K extends keyof DebtFormData>(field: K, value: DebtFormData[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const handleNumberChange = useCallback(
    (field: "total_amount" | "current_balance" | "interest_rate" | "minimum_payment", value: string) => {
      const parsedValue = value === "" ? 0 : Number.parseFloat(value)
      handleInputChange(field, Number.isNaN(parsedValue) ? 0 : parsedValue)
    },
    [handleInputChange],
  )

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!formData.name.trim()) {
        toast({
          title: "請輸入債務名稱",
          description: "債務名稱為必填欄位。",
          variant: "destructive",
        })
        return
      }

      if (!formData.current_balance || formData.current_balance <= 0) {
        toast({
          title: "請輸入有效的餘額",
          description: "目前餘額需大於 0。",
          variant: "destructive",
        })
        return
      }

      setIsSubmitting(true)

      try {
        await onAdd({
          ...formData,
          total_amount: formData.total_amount || formData.current_balance,
          due_date: formData.due_date ? formData.due_date : undefined,
          description: formData.description?.trim() ? formData.description : undefined,
        })

        toast({
          title: "新增債務成功",
          description: "已將債務紀錄儲存至帳號。",
        })

        resetForm()
        onClose()
      } catch (error) {
        console.error("新增債務失敗", error)
        toast({
          title: "新增債務失敗",
          description: error instanceof Error ? error.message : "請稍後再試。",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, onAdd, onClose, resetForm, toast],
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="glass max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="gradient-text">新增債務項目</span>
            <Button variant="ghost" size="icon" onClick={handleRequestClose} disabled={isSubmitting}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="debt-name">債務名稱</Label>
            <Input
              id="debt-name"
              value={formData.name}
              onChange={(event) => handleInputChange("name", event.target.value)}
              placeholder="例如：信用卡 A"
              className="w-full focus:ring-purple-500"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="debt-type">債務類型</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange("type", value as DebtFormData["type"])}
              disabled={isSubmitting}
            >
              <SelectTrigger id="debt-type" className="w-full focus:ring-purple-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {debtTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className="mr-2">{type.emoji}</span>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total-amount">原始金額 (NT$)</Label>
            <Input
              id="total-amount"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={formData.total_amount ? String(formData.total_amount) : ""}
              onChange={(event) => handleNumberChange("total_amount", event.target.value)}
              placeholder="請輸入原始貸款金額"
              className="w-full focus:ring-purple-500"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">若未填寫，系統將以目前餘額作為原始金額。</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-balance">目前餘額 (NT$)</Label>
            <Input
              id="current-balance"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={formData.current_balance ? String(formData.current_balance) : ""}
              onChange={(event) => handleNumberChange("current_balance", event.target.value)}
              placeholder="請輸入目前尚未償還金額"
              className="w-full focus:ring-purple-500"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest-rate">利率 (%)</Label>
            <Input
              id="interest-rate"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={formData.interest_rate ? String(formData.interest_rate) : ""}
              onChange={(event) => handleNumberChange("interest_rate", event.target.value)}
              placeholder="例如：3.5"
              className="w-full focus:ring-purple-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimum-payment">最低還款額 (NT$)</Label>
            <Input
              id="minimum-payment"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={formData.minimum_payment ? String(formData.minimum_payment) : ""}
              onChange={(event) => handleNumberChange("minimum_payment", event.target.value)}
              placeholder="請輸入每月最低還款額"
              className="w-full focus:ring-purple-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due-date">到期日</Label>
            <Input
              id="due-date"
              type="date"
              value={formData.due_date ?? ""}
              onChange={(event) => handleInputChange("due_date", event.target.value)}
              className="w-full focus:ring-purple-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">備註</Label>
            <Textarea
              id="description"
              value={formData.description ?? ""}
              onChange={(event) => handleInputChange("description", event.target.value)}
              placeholder="可紀錄債務來源、還款提醒等資訊"
              className="w-full focus:ring-purple-500"
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105 transition-transform duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? "新增中..." : "新增債務"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
