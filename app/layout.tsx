import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono, Noto_Sans_TC } from "next/font/google"
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

// Use the officially supported latin subset for Noto Sans TC to avoid unsupported
// zh-TW subset configuration issues in Next.js.
const notoSansTc = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
    <html lang="zh-TW" className="dark">
      <body
        className={`${inter.variable} ${notoSansTc.variable} ${jetbrainsMono.variable} bg-background font-sans antialiased text-foreground`}
      >
        <TopNav notificationCount={0} />
        <Suspense fallback={null}>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_60%)] pt-20">
            {children}
          </div>
          <GlobalAddDebtDialog />
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
