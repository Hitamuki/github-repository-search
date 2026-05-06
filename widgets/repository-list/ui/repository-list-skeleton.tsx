/**
 * @file RepositoryList のローディングスケルトン
 */
import { RepositoryCardSkeleton } from "@/entities/repository"
import { Skeleton } from "@/shared/ui/skeleton"

/**
 * リポジトリ一覧のローディングスケルトン
 * @returns レンダリングされる JSX 要素
 */
export function RepositoryListSkeleton() {
  return (
    // req-006-003 — aria-busy でスクリーンリーダーに読み込み中を通知
    <div
      data-testid="repository-list-skeleton"
      aria-busy="true"
      aria-label="読み込み中"
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-5 w-60" />
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-7 w-14 rounded-full" />
          ))}
        </div>
      </div>

      <ul className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i}>
            <RepositoryCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  )
}
