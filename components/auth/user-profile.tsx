"use client"

import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function UserProfile() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (isLoading) {
    return <div className="h-8 w-8 rounded-full bg-white/20 animate-pulse" />
  }

  if (!user) {
    return (
      <Button onClick={() => router.push("/auth/login")} variant="ghost" className="text-white hover:bg-white/20">
        登入
      </Button>
    )
  }

  const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "用戶"
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="flex items-center gap-3 text-white">
      <div className="flex items-center gap-2 min-w-0">
        <Avatar className="h-9 w-9 border border-white/30">
          <AvatarFallback className="bg-white/20 text-white text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-sm font-semibold truncate max-w-[160px]" title={displayName}>
            {displayName}
          </span>
          {user.email && (
            <span className="text-xs text-white/70 truncate max-w-[160px]" title={user.email || undefined}>
              {user.email}
            </span>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        <span>登出</span>
      </Button>
    </div>
  )
}
