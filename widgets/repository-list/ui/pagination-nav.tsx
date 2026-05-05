"use client"
/**
 * @file ページネーションナビゲーション
 * @see req-004-001, req-004-002, req-004-003, req-004-005, req-004-006, req-004-007
 * @see req-004-009, req-004-010, req-006-003, req-006-006
 * @see uc-004-001, uc-004-002, uc-004-003, uc-004-004, uc-004-005, uc-004-006, uc-004-007, uc-004-008, uc-004-009, uc-004-010, uc-004-011
 */
import { range } from "es-toolkit"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

import { LBL } from "@/shared/config/labels"
import { cn } from "@/shared/lib/utils"

import type { SortOption } from "@/entities/repository"

interface PaginationNavProps {
  currentPage: number
  totalPages: number
  q: string
  sort: SortOption
}

/**
 * ページネーション用 URL を生成する
 * @param q - 検索キーワード
 * @param sort - ソートオプション
 * @param page - ページ番号
 * @returns ページネーション用 URL 文字列
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
 * @returns レンダリングされる JSX 要素、またはページが1以下の場合は null
 */
export function PaginationNav({
  currentPage,
  totalPages,
  q,
  sort,
}: PaginationNavProps) {
  if (totalPages <= 1) return null

  const delta = 2
  const start = Math.max(1, currentPage - delta)
  const end = Math.min(totalPages, currentPage + delta)
  const pages = range(start, end + 1)

  // req-006-006 — focus-visible:ring でキーボードフォーカスインジケータを確保
  const btnBase =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <nav
      aria-label={LBL["LBL-008"]}
      className="flex items-center justify-center gap-1 pt-2"
    >
      {currentPage > 1 ? (
        <Link
          href={buildHref(q, sort, currentPage - 1)}
          className={cn(btnBase, "bg-background hover:bg-muted")}
          aria-label={LBL["LBL-006"]}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className={cn(
            btnBase,
            "pointer-events-none bg-background opacity-40"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages[0] > 1 && (
        <>
          <Link
            href={buildHref(q, sort, 1)}
            className={cn(btnBase, "bg-background hover:bg-muted")}
          >
            1
          </Link>
          {pages[0] > 2 && (
            <span className="px-1 text-muted-foreground">…</span>
          )}
        </>
      )}

      {pages.map((p) =>
        p === currentPage ? (
          <span
            key={p}
            aria-current="page"
            className={cn(
              btnBase,
              "border-primary bg-primary text-primary-foreground"
            )}
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

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
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
          aria-label={LBL["LBL-007"]}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className={cn(
            btnBase,
            "pointer-events-none bg-background opacity-40"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  )
}
