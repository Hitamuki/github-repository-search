/**
 * @file GitHub Repository エンティティの型定義
 * @remarks 型は Zod スキーマから推論する
 */
import type {
  RepositoryOwnerSchema,
  RepositorySchema,
  SearchRepositoriesResponseSchema,
} from "./schema"
import type { z } from "zod"

export type RepositoryOwner = z.infer<typeof RepositoryOwnerSchema>
export type Repository = z.infer<typeof RepositorySchema>
export type SearchRepositoriesResponse = z.infer<
  typeof SearchRepositoriesResponseSchema
>

/** ソートオプション */
export type SortOption = "best match" | "stars" | "forks" | "updated"

/** 検索パラメータ */
export interface SearchParams {
  q: string
  sort: SortOption
  page: number
}
