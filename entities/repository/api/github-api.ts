/**
 * @file GitHub API クライアント（entities 層）
 * @remarks サーバーサイド専用。fetch with Next.js cache を活用。
 */
import "server-only"

import {
  GITHUB_API_BASE,
  GITHUB_API_HEADERS,
  PER_PAGE,
} from "@/shared/config/github"
import { logger } from "@/shared/lib/logger"

import type {
  SearchRepositoriesResponse,
  Repository,
  SortOption,
} from "../model/types"

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = "GitHubApiError"
  }
}

/**
 * リポジトリを検索する（Server Component 用）
 * @param params
 * @param params.q - 検索キーワード
 * @param params.sort - ソートオプション
 * @param params.page - ページ番号（1始まり）
 * @returns 検索結果（リポジトリ配列 + 総件数）
 * @throws {GitHubApiError} GitHub API エラー時
 */
export async function searchRepositories(params: {
  q: string
  sort: SortOption
  page: number
}): Promise<SearchRepositoriesResponse> {
  const { q, sort, page } = params
  const sortParam = sort === "best match" ? "" : `&sort=${sort}&order=desc`
  const url = `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(q)}&per_page=${PER_PAGE}&page=${page}${sortParam}`

  const res = await fetch(url, {
    headers: GITHUB_API_HEADERS,
    next: { revalidate: 30 },
  })

  if (res.status === 403) {
    logger.warn({ url, status: 403 }, "GitHub API レート制限")
    throw new GitHubApiError(
      "APIレート制限に達しました。しばらくしてからお試しください。",
      403
    )
  }
  if (res.status === 422) {
    logger.warn({ url, status: 422 }, "GitHub API 無効なクエリ")
    throw new GitHubApiError(
      "検索クエリが無効です。別のキーワードをお試しください。",
      422
    )
  }
  if (!res.ok) {
    logger.error({ url, status: res.status }, "GitHub API エラー")
    throw new GitHubApiError(
      `GitHub APIエラーが発生しました（${res.status}）`,
      res.status
    )
  }

  return res.json() as Promise<SearchRepositoriesResponse>
}

/**
 * リポジトリ詳細を取得する（Server Component 用）
 * @param owner - リポジトリオーナー名
 * @param repo - リポジトリ名
 * @returns リポジトリ詳細情報
 * @throws {GitHubApiError} GitHub API エラー時
 */
export async function getRepository(
  owner: string,
  repo: string
): Promise<Repository> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`

  const res = await fetch(url, {
    headers: GITHUB_API_HEADERS,
    next: { revalidate: 60 },
  })

  if (res.status === 404) {
    logger.info({ url, status: 404 }, "リポジトリが見つかりません")
    throw new GitHubApiError("リポジトリが見つかりませんでした。", 404)
  }
  if (!res.ok) {
    logger.error({ url, status: res.status }, "リポジトリ取得エラー")
    throw new GitHubApiError(
      `リポジトリ情報の取得に失敗しました（${res.status}）`,
      res.status
    )
  }

  return res.json() as Promise<Repository>
}
