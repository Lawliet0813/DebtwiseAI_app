"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, User2 } from "lucide-react"

import { navItems } from "@/components/navigation/nav-items"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/useAuth"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface TopNavProps {
  user?: User | null
  onSignOut?: () => Promise<void> | void
  notificationCount?: number
}

export default function TopNav({ user: providedUser, onSignOut, notificationCount = 0 }: TopNavProps) {
  const { user: authUser, loading } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])

  const user = providedUser ?? authUser

  if (loading) {
    return (
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="h-6 w-24 animate-pulse rounded-full bg-white/10" />
          <div className="h-10 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
        </div>
      </header>
    )
  }

  if (!user) {
    return null
  }

  const displayName =
    user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "使用者"
  const initials = displayName.slice(0, 2).toUpperCase()

  const handleSignOut = async () => {
    if (onSignOut) {
      await onSignOut()
      return
    }

    try {
      setIsSigningOut(true)
      await supabase.auth.signOut()
      router.replace("/auth/login")
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <div className="flex items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white/80 hover:text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-slate-950/95 text-white border-white/10">
              <div className="mt-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase text-white/50">導覽</p>
                  <div className="grid gap-2">
                    {navItems.map((item) => {
                      const isActive =
                        item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm transition-all",
                            isActive ? "border-white/30 bg-white/10 text-white" : "text-white/70 hover:text-white",
                          )}
                          onClick={() => setMobileOpen(false)}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-lg">{item.emoji}</span>
                            {item.label}
                          </span>
                          {item.badge ? (
                            <Badge variant={item.badge.variant ?? "secondary"}>{item.badge.label}</Badge>
                          ) : null}
                        </Link>
                      )
                    })}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/60">
                  <p className="font-semibold text-white">DebtWise Insights</p>
                  <p className="mt-1 text-xs">探索 AI 建議與財務優化策略，協助你更快速達成債務清償目標。</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="group flex items-center gap-3 text-white" aria-label="前往儀表板">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500 text-xl">
              💡
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight">DebtWise AI</p>
              <p className="text-xs text-white/60">智慧債務管理儀表板</p>
            </div>
          </Link>
        </div>

        <div className="hidden flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 md:flex">
          <Search className="h-4 w-4 text-white/50" />
          <Input
            placeholder="搜尋債務、還款記錄或 AI 策略..."
            className="h-8 border-0 bg-transparent text-sm text-white placeholder:text-white/50 focus-visible:ring-0"
          />
          <Badge className="ml-auto bg-white/10 text-xs text-white/70">Ctrl + K</Badge>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative hidden h-10 w-10 items-center justify-center rounded-full text-white/80 hover:text-white md:inline-flex"
            aria-label="查看通知"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-amber-400 px-1 text-[10px] font-semibold text-white">
                {notificationCount}
              </span>
            ) : null}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-white/80 hover:text-white"
              >
                <Avatar className="h-9 w-9 border border-white/20">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-left leading-tight md:block">
                  <span className="block text-sm font-semibold">{displayName}</span>
                  {user.email ? <span className="text-xs text-white/60">{user.email}</span> : null}
                </span>
                <ChevronDown className="hidden h-4 w-4 opacity-60 transition group-hover:opacity-100 md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 border-white/10 bg-slate-950/95 text-white">
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-white/60">帳戶資訊</DropdownMenuLabel>
              <div className="px-2 py-2 text-sm text-white/80">
                <p className="font-semibold">{displayName}</p>
                {user.email ? <p className="text-xs text-white/60">{user.email}</p> : null}
              </div>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <User2 className="h-4 w-4" />
                  個人設定
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  偏好設定
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="flex items-center gap-2 text-rose-300 focus:text-rose-200"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <LogOut className="h-4 w-4" />
                {isSigningOut ? "登出中..." : "登出"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
