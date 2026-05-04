/**
 * @file GitHub Repository エンティティの型定義
 */

/** GitHub Search API レスポンスのリポジトリ型 */
export interface Repository {
  id: number
  full_name: string
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  watchers_count: number
  forks_count: number
  open_issues_count: number
  language: string | null
  topics: string[]
  private: boolean
  archived: boolean
  fork: boolean
  default_branch: string
  license: { spdx_id: string; name: string } | null
  created_at: string
  updated_at: string
  pushed_at: string
  owner: RepositoryOwner
}

export interface RepositoryOwner {
  login: string
  avatar_url: string
  html_url: string
}

/** GitHub Search Repositories API レスポンス */
export interface SearchRepositoriesResponse {
  total_count: number
  incomplete_results: boolean
  items: Repository[]
}

/** ソートオプション */
export type SortOption = "best match" | "stars" | "forks" | "updated"

/** 検索パラメータ */
export interface SearchParams {
  q: string
  sort: SortOption
  page: number
}
