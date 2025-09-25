"use client"

import { useCallback, useEffect, useState } from "react"

import { AddDebtDialog } from "@/components/debts/add-debt-dialog"

export function GlobalAddDebtDialog() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)

    window.addEventListener("open-add-debt", handleOpen)
    return () => {
      window.removeEventListener("open-add-debt", handleOpen)
    }
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
  }, [])

  const handleSuccess = useCallback(() => {
    window.dispatchEvent(new Event("debt-added"))
  }, [])

  return <AddDebtDialog open={isOpen} onOpenChange={handleOpenChange} onSuccess={handleSuccess} />
}
