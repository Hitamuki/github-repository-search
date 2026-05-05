/**
 * @file ルートレイアウト
 * @remarks アプリケーション全体に適用されるレイアウト。
 */
import { Noto_Sans_JP } from "next/font/google"

import { APP_DESCRIPTION, APP_NAME } from "@/shared/config/app"
import { SiteHeader } from "@/widgets/site-header"

import type { Metadata, Viewport } from "next"
import "@/shared/styles/globals.css"

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
  description: APP_DESCRIPTION,
  robots: { index: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

/**
 * ルートレイアウトコンポーネント
 * @param root0 - コンポーネント props
 * @param root0.children - 各ページのコンテンツ
 * @returns レンダリングされる JSX 要素
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
