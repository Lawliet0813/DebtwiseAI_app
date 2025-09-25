"use client"

import type React from "react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [canReset, setCanReset] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const hash = window.location.hash
    if (!hash) {
      setError("無效的重設連結，請重新請求重設密碼。")
      return
    }

    const params = new URLSearchParams(hash.substring(1))
    const type = params.get("type")
    const accessToken = params.get("access_token")

    if (type === "recovery" && accessToken) {
      setCanReset(true)
    } else {
      setError("重設連結已失效或資訊不足，請重新請求重設密碼。")
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canReset) return

    if (password !== confirmPassword) {
      setError("兩次輸入的密碼不一致")
      return
    }

    setIsLoading(true)
    setMessage(null)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      setMessage("密碼已成功更新，請使用新密碼登入。")
      setTimeout(() => {
        router.push("/auth/login")
      }, 1500)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "更新密碼時發生錯誤")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-lg bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">重設密碼</CardTitle>
            <CardDescription className="text-gray-200">
              {canReset ? "請輸入您的新密碼" : "密碼重設連結可能無效，您可以重新請求重設密碼"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canReset ? (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    新密碼
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-white">
                    確認新密碼
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                  />
                </div>
                {message && <p className="text-sm text-green-200 bg-green-500/10 p-3 rounded-lg">{message}</p>}
                {error && <p className="text-sm text-red-300 bg-red-500/20 p-3 rounded-lg">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "更新中..." : "更新密碼"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                {error && <p className="text-sm text-red-300 bg-red-500/20 p-3 rounded-lg">{error}</p>}
                <Link href="/auth/forgot-password" className="text-sm text-blue-300 hover:text-blue-200 underline">
                  重新寄送密碼重設連結
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
