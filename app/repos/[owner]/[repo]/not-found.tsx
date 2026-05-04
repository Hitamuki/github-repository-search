/**
 * @file リポジトリ詳細ページ 404
 */
import Link from "next/link"

import { Button } from "@/shared/ui/button"

/**
 * リポジトリが見つからない場合の 404 ページ
 */
export default function RepoNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card px-6 py-16 text-center shadow-sm">
        <p className="text-5xl font-bold text-muted-foreground/30">404</p>
        <div>
          <h2 className="text-lg font-semibold">リポジトリが見つかりませんでした</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            リポジトリが削除されているか、非公開になっている可能性があります
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">検索に戻る</Link>
        </Button>
      </div>
    </div>
  )
}
