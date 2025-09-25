import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Target,
  TrendingUp,
  Wrench,
} from "lucide-react"

export type NavBadgeVariant = "default" | "secondary" | "destructive" | "outline"

export interface AppNavItem {
  href: string
  label: string
  description: string
  icon: LucideIcon
  emoji: string
  badge?: {
    label: string
    variant?: NavBadgeVariant
  }
  hiddenOnMobile?: boolean
}

export const navItems: AppNavItem[] = [
  {
    href: "/",
    label: "總覽",
    description: "掌握財務概況",
    icon: LayoutDashboard,
    emoji: "📊",
  },
  {
    href: "/debts",
    label: "債務",
    description: "管理所有債務帳戶",
    icon: CreditCard,
    emoji: "💳",
  },
  {
    href: "/progress",
    label: "進度",
    description: "追蹤還款進度",
    icon: TrendingUp,
    emoji: "📈",
  },
  {
    href: "/strategy",
    label: "策略",
    description: "規劃還款方案",
    icon: Target,
    emoji: "🎯",
  },
  {
    href: "/reports",
    label: "報表",
    description: "分析財務趨勢",
    icon: BarChart3,
    emoji: "📑",
    badge: { label: "新功能", variant: "secondary" },
    hiddenOnMobile: true,
  },
  {
    href: "/tools",
    label: "工具",
    description: "AI 輔助決策",
    icon: Wrench,
    emoji: "🛠️",
    badge: { label: "AI", variant: "outline" },
  },
]
