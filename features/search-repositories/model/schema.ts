/**
 * @file features/search-repositories Zod バリデーションスキーマ
 */
import { z } from "zod"

import type { SortOption } from "@/entities/repository"

export const SORT_OPTIONS = [
  { value: "best match" as SortOption, label: "関連度" },
  { value: "stars" as SortOption, label: "Star数" },
  { value: "forks" as SortOption, label: "Fork数" },
  { value: "updated" as SortOption, label: "更新日" },
] as const

/** 検索フォームの入力バリデーションスキーマ */
export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, "検索キーワードを入力してください")
    .max(256, "キーワードは256文字以内で入力してください")
    .trim(),
})

/** URL クエリパラメータのバリデーションスキーマ */
export const searchParamsSchema = z.object({
  q: z.string().trim().default(""),
  sort: z
    .enum(["best match", "stars", "forks", "updated"])
    .default("best match"),
  page: z.coerce.number().int().min(1).max(20).default(1),
})

export type SearchQueryInput = z.infer<typeof searchQuerySchema>
export type ValidatedSearchParams = z.infer<typeof searchParamsSchema>
