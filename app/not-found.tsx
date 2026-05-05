/**
 * @file グローバル 404 ページ
 */
import Link from "next/link"

import { LBL } from "@/shared/config/labels"
import { MSG } from "@/shared/config/messages"

/**
 * グローバル 404 ページコンポーネント
 * @returns レンダリングされる JSX 要素
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-bold text-muted-foreground/20">404</p>
      <h1 className="text-xl font-semibold">{MSG["MSG-301"]}</h1>
      <Link
        href="/"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        {LBL["LBL-C002"]}
      </Link>
    </div>
  )
}
