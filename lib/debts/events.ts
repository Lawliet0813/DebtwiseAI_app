import type { DebtFormData } from "@/lib/types/database"

export const OPEN_ADD_DEBT_EVENT = "open-add-debt"
export const DEBT_ADDED_EVENT = "debt-added"

export type OpenAddDebtEventDetail = {
  preset?: Partial<DebtFormData>
}

export function triggerOpenAddDebt(detail: OpenAddDebtEventDetail = {}) {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(
    new CustomEvent<OpenAddDebtEventDetail>(OPEN_ADD_DEBT_EVENT, {
      detail,
    }),
  )
}

export function emitDebtAdded() {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(new Event(DEBT_ADDED_EVENT))
}
