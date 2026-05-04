/**
 * @file 詳細ページのローディング UI（Route-level Suspense）
 */
import { Skeleton } from "@/shared/ui/skeleton"

/**
 * リポジトリ詳細ページのローディングスケルトン
 */
export default function RepoLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
      <div className="flex gap-4 rounded-xl border bg-card p-5">
        <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-32 rounded-xl" />
    </div>
  )
}
