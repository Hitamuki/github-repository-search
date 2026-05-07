/**
 * @file features/search-repositories Zod バリデーションスキーマ
 * @see req-001-002, req-001-012, req-004-001, req-007-001, req-007-007
 * @see uc-001-005, uc-001-007
 */
import { z } from "zod"

import { QUERY_MAX_LENGTH } from "@/shared/config/app"
import { MAX_PAGES } from "@/shared/config/github"
import { MSG } from "@/shared/config/messages"

import type { SortOption } from "@/entities/repository"

export const SORT_OPTIONS = [
  { value: "best match" as SortOption, label: "関連度" },
  { value: "stars" as SortOption, label: "Star数" },
  { value: "forks" as SortOption, label: "Fork数" },
  { value: "updated" as SortOption, label: "更新日" },
] as const

/**
 * 検索フォームの入力バリデーションスキーマ（req-001-002, req-001-012）
 * @remarks
 * 空文字のバリデーションは不要（req-001-010 でボタンが無効化されるため）
 */
export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(QUERY_MAX_LENGTH, MSG["MSG-002"]),
})

/** URL クエリパラメータのバリデーションスキーマ（req-004-001, req-007-001, req-007-007, req-004-011, req-004-014） */
export const searchParamsSchema = z.object({
  q: z.string().trim().catch(""),
  sort: z.enum(["best match", "stars", "forks", "updated"]).catch("best match"),
  page: z.coerce.number().int().min(1).max(MAX_PAGES).catch(1),
})

export type SearchQueryInput = z.infer<typeof searchQuerySchema>
export type ValidatedSearchParams = z.infer<typeof searchParamsSchema>
