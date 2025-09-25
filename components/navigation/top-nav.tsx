"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { UserProfile } from "@/components/auth/user-profile"

import { navItems } from "./nav-items"

export function TopNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/20 px-4 py-3 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          aria-label="返回首頁"
          className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/50 rounded-full px-1"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
            <span className="text-white font-bold text-lg">💰</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg gradient-text">DebtWise AI</h1>
            <p className="text-xs text-muted-foreground">智慧債務管理</p>
          </div>
        </Link>

        {/* Navigation */}
        <NavigationMenu className="hidden md:flex flex-1 justify-center">
          <NavigationMenuList className="glass rounded-full border border-white/15 bg-white/5 px-1 py-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              const Icon = item.icon
              const badge = item.badge

              return (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    asChild
                    active={isActive}
                    className={cn(
                      "flex items-center gap-3 rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-all duration-200",
                      "focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                      isActive
                        ? "bg-white/20 text-white shadow-lg shadow-purple-500/20"
                        : "hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Link href={item.href} aria-current={isActive ? "page" : undefined}>
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="flex flex-col text-left">
                          <span className="leading-tight">{item.label}</span>
                          <span className="text-[11px] text-white/60 hidden xl:block">
                            {item.description}
                          </span>
                        </div>
                        {badge ? (
                          <Badge
                            variant={badge.variant}
                            className="ml-1 hidden lg:inline-flex border-white/30 bg-white/15 text-[10px] uppercase tracking-wide text-white/90"
                          >
                            {badge.label}
                          </Badge>
                        ) : null}
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            })}
          </NavigationMenuList>
        </NavigationMenu>

        {/* User Actions */}
        <div className="flex items-center gap-3 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-white hover:bg-white/10 hover:text-white"
            aria-label="查看通知"
          >
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-orange-400 to-yellow-400 text-xs">
              3
            </Badge>
          </Button>
          <UserProfile />
        </div>
      </div>
    </header>
  )
}
