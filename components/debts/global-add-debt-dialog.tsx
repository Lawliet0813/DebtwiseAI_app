"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useState } from "react"
import type { ComponentType } from "react"

import type { AddDebtDialogProps } from "@/components/debts/add-debt-dialog"
import { OPEN_ADD_DEBT_EVENT, emitDebtAdded, type OpenAddDebtEventDetail } from "@/lib/debts/events"

const AddDebtDialog = dynamic(
  () => import("@/components/debts/add-debt-dialog").then((mod) => mod.AddDebtDialog),
  { ssr: false },
) as ComponentType<AddDebtDialogProps>

export function GlobalAddDebtDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [preset, setPreset] = useState<OpenAddDebtEventDetail["preset"]>()

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined
    }

    const handleOpen = (event: Event) => {
      const { detail } = event as CustomEvent<OpenAddDebtEventDetail>
      setPreset(detail?.preset ? { ...detail.preset } : undefined)
      setIsOpen(true)
    }

    window.addEventListener(OPEN_ADD_DEBT_EVENT, handleOpen as EventListener)
    return () => {
      window.removeEventListener(OPEN_ADD_DEBT_EVENT, handleOpen as EventListener)
    }
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)

    if (!open) {
      setPreset(undefined)
    }
  }, [])

  const handleSuccess = useCallback(() => {
    emitDebtAdded()
  }, [])

  return (
    <AddDebtDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      onSuccess={handleSuccess}
      initialValues={preset}
    />
  )
}
