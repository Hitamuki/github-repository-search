/**
 * @file リポジトリ詳細ページ 404
 */
import Link from "next/link"

import { LBL } from "@/shared/config/labels"
import { MSG } from "@/shared/config/messages"
import { Button } from "@/shared/ui/button"

/**
 * リポジトリが見つからない場合の 404 ページ
 * @returns レンダリングされる JSX 要素
 */
export default function RepoNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card px-6 py-16 text-center shadow-sm">
        <p className="text-5xl font-bold text-muted-foreground/30">404</p>
        <div>
          <h2 className="text-lg font-semibold">{MSG["MSG-102"]}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{MSG["MSG-103"]}</p>
        </div>
        <Button
          variant="outline"
          render={<Link href="/">{LBL["LBL-C003"]}</Link>}
        />
      </div>
    </div>
  )
}
