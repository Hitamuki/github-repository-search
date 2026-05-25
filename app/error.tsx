"use client"
/**
 * @file グローバルエラーバウンダリ（Client Component）
 * @remarks app/layout.tsx 直下で発生した予期しないエラーをキャッチする
 * @see req-005-003, req-005-009
 * @see uc-005-001
 */
import Link from "next/link"
import { useEffect } from "react"

import { LBL } from "@/shared/config/labels"
import { MSG } from "@/shared/config/messages"

import { reportClientError } from "./actions"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * アプリケーション全体のエラーバウンダリコンポーネント
 * @param root0.error - エラーオブジェクト
 * @param root0
 * @param root0.reset - 再試行ハンドラ
 * @returns レンダリングされる JSX 要素
 */
export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    reportClientError(error.message, error.digest)
  }, [error])

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl font-bold text-muted-foreground/20">500</p>
      <div>
        <h1 className="text-xl font-semibold">{MSG["MSG-C001"]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.message || MSG["MSG-C002"]}
        </p>
      </div>
      <div className="flex gap-3 text-sm">
        <button
          onClick={reset}
          className="text-primary underline-offset-4 hover:underline"
        >
          {LBL["LBL-C001"]}
        </button>
        <span className="text-muted-foreground">/</span>
        <Link
          href="/"
          className="text-primary underline-offset-4 hover:underline"
        >
          {LBL["LBL-C002"]}
        </Link>
      </div>
    </div>
  )
}
