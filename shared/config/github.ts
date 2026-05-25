/**
 * @file GitHub API 設定定数
 */

/** GitHub REST API のベース URL */
export const GITHUB_API_BASE = "https://api.github.com"

/** 1 ページあたりの最大件数（GitHub API 上限: 100、UX 上限: 50） */
export const PER_PAGE = 50

/** ページネーションの最大ページ数（GitHub API 制限: 1000件 / per_page） */
export const MAX_PAGES = 20

/** GitHub API リクエスト共通ヘッダー（バージョン固定 + 認証トークン） */
export const GITHUB_API_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
} as const
