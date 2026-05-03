/**
 * @file ルートレイアウト
 * @remarks
 * アプリケーション全体に適用されるレイアウト。
 * Next.js App Router の規約により `layout.tsx` に配置する。
 */

import type { ReactNode } from "react"

import "./globals.css"

/**
 * ルートレイアウトコンポーネント
 * @param root0 - コンポーネント props
 * @param root0.children - 各ページのコンテンツ
 * @returns ルート HTML ドキュメント
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
