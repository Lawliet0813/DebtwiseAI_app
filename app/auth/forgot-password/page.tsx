"use client"

import type React from "react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setError(null)

    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/reset-password`

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (error) throw error

      setMessage("已寄出密碼重設連結，請檢查您的電子郵件信箱。")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "寄送密碼重設連結時發生錯誤")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-lg bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">忘記密碼</CardTitle>
            <CardDescription className="text-gray-200">
              輸入您註冊的電子郵件，我們會寄送密碼重設連結給您
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  電子郵件
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
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
                {isLoading ? "寄送中..." : "寄送重設連結"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/auth/login" className="text-sm text-blue-300 hover:text-blue-200 underline">
                返回登入頁面
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
