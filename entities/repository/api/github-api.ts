/**
 * @file GitHub API クライアント（entities 層）
 * @remarks サーバーサイド専用。fetch with Next.js cache を活用。
 * @see req-001-006, req-001-015, req-005-003, req-005-004, req-005-005
 * @see req-008-007, req-009-001, req-009-002, req-010-005, req-010-006, req-010-007
 * @see uc-005-001, uc-005-003, uc-005-006
 */
import "server-only" // req-001-015, req-008-007 — クライアントバンドルへの混入を防ぐ

import {
  GITHUB_API_BASE,
  GITHUB_API_HEADERS,
  PER_PAGE,
} from "@/shared/config/github"
import { MSG, MSG_TPL } from "@/shared/config/messages"
import { createRequestLogger } from "@/shared/lib/logger"

import type {
  SearchRepositoriesResponse,
  Repository,
  SortOption,
} from "../model/types"

/**
 * @internal URL 構築ロジック（テスト用）
 * @param params - 検索パラメータ
 * @param params.q - 検索キーワード
 * @param params.sort - ソート順
 * @param params.page - ページ番号
 * @returns 構築された URL
 */
export function buildSearchUrl(params: {
  q: string
  sort: SortOption
  page: number
}): string {
  const { q, sort, page } = params
  const sortParam = sort === "best match" ? "" : `&sort=${sort}&order=desc`
  return `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(q)}&per_page=${PER_PAGE}&page=${page}${sortParam}`
}

/**
 * @internal URL 構築ロジック（テスト用）
 * @param owner - オーナー名
 * @param repo - リポジトリ名
 * @returns 構築された URL
 */
export function buildRepoUrl(owner: string, repo: string): string {
  return `${GITHUB_API_BASE}/repos/${owner}/${repo}`
}

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
  const log = await createRequestLogger()
  const url = buildSearchUrl(params)

  try {
    const res = await fetch(url, {
      headers: GITHUB_API_HEADERS,
      next: { revalidate: 30 }, // req-009-001 — ISR 30秒キャッシュ
    })

    if (res.status === 403) {
      log.warn({ url, status: 403 }, "GitHub API レート制限") // req-005-004, req-010-006
      throw new GitHubApiError(MSG["MSG-201"], 403)
    }
    if (res.status === 422) {
      log.warn({ url, status: 422 }, "GitHub API 無効なクエリ") // req-005-005, req-010-006
      throw new GitHubApiError(MSG["MSG-202"], 422)
    }
    if (!res.ok) {
      log.error({ url, status: res.status }, "GitHub API エラー") // req-005-003, req-010-005
      throw new GitHubApiError(MSG_TPL["MSG-203"](res.status), res.status)
    }

    const data = (await res.json()) as SearchRepositoriesResponse
    log.info({ url, status: res.status, totalCount: data.total_count }, "リポジトリ検索成功")
    return data
  } catch (error) {
    throw error
  }
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
  const log = await createRequestLogger()
  const url = buildRepoUrl(owner, repo)

  const res = await fetch(url, {
    headers: GITHUB_API_HEADERS,
    next: { revalidate: 60 }, // req-009-002 — ISR 60秒キャッシュ
  })

  if (res.status === 404) {
    log.info({ url, status: 404 }, "リポジトリが見つかりません")
    throw new GitHubApiError(MSG["MSG-102"], 404)
  }
  if (!res.ok) {
    log.error({ url, status: res.status }, "リポジトリ取得エラー")
    throw new GitHubApiError(MSG_TPL["MSG-204"](res.status), res.status)
  }

  const data = (await res.json()) as Repository
  log.info({ url, status: res.status, repo: `${owner}/${repo}` }, "リポジトリ詳細取得成功")
  return data
}
