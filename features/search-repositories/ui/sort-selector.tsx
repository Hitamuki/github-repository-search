"use client"
/**
 * @file ソートセレクター（Client Component）
 */
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"

import { cn } from "@/lib/utils"

import { SORT_OPTIONS } from "../model/schema"

import type { SortOption } from "@/entities/repository"

interface SortSelectorProps {
  currentSort: SortOption
}

/**
 * 検索結果のソート順を切り替えるセレクター
 * @param props.currentSort - 現在のソートオプション
 * @param root0
 * @param root0.currentSort
 */
export function SortSelector({ currentSort }: SortSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSortChange = useCallback(
    (sort: SortOption) => {
      const params = new URLSearchParams(searchParams.toString())
      if (sort === "best match") {
        params.delete("sort")
      } else {
        params.set("sort", sort)
      }
      params.set("page", "1")

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="検索結果のソート順">
      {SORT_OPTIONS.map((opt) => {
        const isActive = currentSort === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => handleSortChange(opt.value)}
            disabled={isPending}
            aria-pressed={isActive}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:pointer-events-none disabled:opacity-60",
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-input bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
