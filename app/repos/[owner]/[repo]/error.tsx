"use client"
/**
 * @file 詳細ページのエラー UI（Client Component）
 */
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

import { Button } from "@/shared/ui/button"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * リポジトリ詳細ページのエラーバウンダリコンポーネント
 * @param props.error - エラーオブジェクト
 * @param root0
 * @param root0.error
 * @param props.reset - 再試行ハンドラ
 * @param root0.reset
 */
export default function RepoError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[RepoError]", error)
  }, [error])

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <div>
          <h2 className="text-lg font-semibold text-destructive">
            リポジトリの取得に失敗しました
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {error.message || "予期しないエラーが発生しました"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={reset}>
            再試行
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">検索に戻る</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
