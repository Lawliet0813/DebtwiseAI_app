import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { GlobalAddDebtDialog } from "@/components/debts/global-add-debt-dialog"
import TopNav from "@/components/TopNav"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono", 
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "DebtWise AI - 智慧債務管理",
  description: "專業的債務管理與財務規劃應用程式",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.variable} ${jetbrainsMono.variable} bg-slate-950 font-sans antialiased text-white`}>
        <TopNav notificationCount={0} />
        <Suspense fallback={null}>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%)] pt-20">
            {children}
          </div>
          <GlobalAddDebtDialog />
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
