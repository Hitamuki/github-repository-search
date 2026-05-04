/**
 * @file リポジトリカードのスケルトン UI
 */
import { Skeleton } from "@/shared/ui/skeleton"

/**
 * リポジトリカードのローディングスケルトン
 */
export function RepositoryCardSkeleton() {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border bg-card px-4 py-3.5 shadow-sm">
      <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="h-5 w-12 rounded-full" />
    </div>
  )
}
