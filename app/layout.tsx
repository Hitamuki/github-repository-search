/**
 * @file ルートレイアウト
 * @remarks アプリケーション全体に適用されるレイアウト。
 */
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { Noto_Sans_JP } from "next/font/google"
import Link from "next/link"

import type { Metadata, Viewport } from "next"
import "./globals.css"

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    template: "%s | GitHub リポジトリ検索",
    default: "GitHub リポジトリ検索",
  },
  description:
    "GitHub のリポジトリをキーワードで検索し、詳細情報を確認できるアプリです。",
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
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold tracking-tight text-foreground transition-colors hover:text-primary"
              >
                <GitHubLogoIcon className="h-5 w-5" />
                <span className="text-[15px]">GitHub リポジトリ検索</span>
              </Link>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
