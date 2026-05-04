"use client"
/**
 * @file ページネーションナビゲーション
 */
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

import type { SortOption } from "@/entities/repository"

interface PaginationNavProps {
  currentPage: number
  totalPages: number
  q: string
  sort: SortOption
}

/**
 *
 * @param q
 * @param sort
 * @param page
 */
function buildHref(q: string, sort: SortOption, page: number) {
  const params = new URLSearchParams({ q })
  if (sort !== "best match") params.set("sort", sort)
  if (page !== 1) params.set("page", String(page))
  return `/?${params.toString()}`
}

/**
 * ページネーションナビゲーションコンポーネント
 * @param props.currentPage - 現在のページ番号
 * @param root0
 * @param root0.currentPage
 * @param props.totalPages - 総ページ数
 * @param root0.totalPages
 * @param props.q - 検索キーワード
 * @param root0.q
 * @param props.sort - ソートオプション
 * @param root0.sort
 */
export function PaginationNav({
  currentPage,
  totalPages,
  q,
  sort,
}: PaginationNavProps) {
  if (totalPages <= 1) return null

  const delta = 2
  const range: number[] = []
  for (
    let i = Math.max(1, currentPage - delta);
    i <= Math.min(totalPages, currentPage + delta);
    i++
  ) {
    range.push(i)
  }

  const btnBase =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <nav
      aria-label="ページネーション"
      className="flex items-center justify-center gap-1 pt-2"
    >
      {currentPage > 1 ? (
        <Link
          href={buildHref(q, sort, currentPage - 1)}
          className={cn(btnBase, "bg-background hover:bg-muted")}
          aria-label="前のページ"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(btnBase, "pointer-events-none opacity-40 bg-background")}>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {range[0] > 1 && (
        <>
          <Link href={buildHref(q, sort, 1)} className={cn(btnBase, "bg-background hover:bg-muted")}>1</Link>
          {range[0] > 2 && <span className="px-1 text-muted-foreground">…</span>}
        </>
      )}

      {range.map((p) =>
        p === currentPage ? (
          <span
            key={p}
            aria-current="page"
            className={cn(btnBase, "border-primary bg-primary text-primary-foreground")}
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(q, sort, p)}
            className={cn(btnBase, "bg-background hover:bg-muted")}
          >
            {p}
          </Link>
        )
      )}

      {range[range.length - 1] < totalPages && (
        <>
          {range[range.length - 1] < totalPages - 1 && (
            <span className="px-1 text-muted-foreground">…</span>
          )}
          <Link
            href={buildHref(q, sort, totalPages)}
            className={cn(btnBase, "bg-background hover:bg-muted")}
          >
            {totalPages}
          </Link>
        </>
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildHref(q, sort, currentPage + 1)}
          className={cn(btnBase, "bg-background hover:bg-muted")}
          aria-label="次のページ"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(btnBase, "pointer-events-none opacity-40 bg-background")}>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  )
}
