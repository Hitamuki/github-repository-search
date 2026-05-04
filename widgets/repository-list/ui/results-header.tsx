"use client"
/**
 * @file 検索結果ヘッダー（件数 + ソートセレクター）
 */
import { SortSelector } from "@/features/search-repositories"

import type { SortOption } from "@/entities/repository"

interface ResultsHeaderProps {
  totalCount: number
  currentPage: number
  totalPages: number
  currentSort: SortOption
}

/**
 * 検索結果ヘッダーコンポーネント
 * @param props.totalCount - 総件数
 * @param root0
 * @param root0.totalCount
 * @param props.currentPage - 現在のページ番号
 * @param root0.currentPage
 * @param props.totalPages - 総ページ数
 * @param root0.totalPages
 * @param props.currentSort - 現在のソートオプション
 * @param root0.currentSort
 */
export function ResultsHeader({
  totalCount,
  currentPage,
  totalPages,
  currentSort,
}: ResultsHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        約{" "}
        <strong className="font-semibold text-foreground">
          {totalCount.toLocaleString("ja-JP")}
        </strong>{" "}
        件のリポジトリが見つかりました
        <span className="ml-1.5 text-xs text-muted-foreground/70">
          ({currentPage}/{totalPages} ページ)
        </span>
      </p>
      <SortSelector currentSort={currentSort} />
    </div>
  )
}
