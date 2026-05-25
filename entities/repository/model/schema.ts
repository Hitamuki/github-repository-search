/**
 * @file GitHub Repository エンティティの Zod スキーマ
 * @remarks 外部 API レスポンスの実行時検証に使用する
 * @see req-001-006, req-008-007
 * @see uc-001-001, uc-005-001
 */
import { z } from "zod"

/** リポジトリオーナーの Zod スキーマ */
export const RepositoryOwnerSchema = z.object({
  login: z.string(),
  avatar_url: z.string(),
  html_url: z.string(),
})

/** GitHub リポジトリの Zod スキーマ */
export const RepositorySchema = z.object({
  id: z.number(),
  full_name: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  html_url: z.string(),
  stargazers_count: z.number(),
  watchers_count: z.number(),
  subscribers_count: z.number(),
  forks_count: z.number(),
  open_issues_count: z.number(),
  language: z.string().nullable(),
  topics: z.array(z.string()),
  private: z.boolean(),
  archived: z.boolean(),
  fork: z.boolean(),
  default_branch: z.string(),
  license: z.object({ spdx_id: z.string(), name: z.string() }).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  pushed_at: z.string(),
  owner: RepositoryOwnerSchema,
})

/** GitHub Search API レスポンスの Zod スキーマ */
export const SearchRepositoriesResponseSchema = z.object({
  total_count: z.number(),
  incomplete_results: z.boolean(),
  items: z.array(RepositorySchema),
})
