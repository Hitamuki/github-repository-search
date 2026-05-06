/**
 * @file アプリケーション設定定数
 * @remarks 将来の変更可能性がある固定値を一元管理する
 * @see req-001-002, req-001-012
 */

/** アプリケーション名（UI・メタデータで使用） */
export const APP_NAME = "GitHub リポジトリ検索" as const

/** アプリケーション説明文（メタデータで使用） */
export const APP_DESCRIPTION =
  "GitHub のリポジトリをキーワードで検索し、詳細情報を確認できるアプリです。" as const

/** 検索クエリの最大文字数 */
export const QUERY_MAX_LENGTH = 256
