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
    <div className="space-y-4">
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
