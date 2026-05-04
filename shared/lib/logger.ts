/**
 * @file サーバーサイドロガー
 * @remarks pino による構造化ロギング。Server Component / API 専用。
 * @see {@link https://github.com/pinojs/pino} pino
 */
import "server-only"

import pino from "pino"

/**
 * アプリケーション全体で使用するロガーインスタンス
 * @remarks
 * - LOG_LEVEL 環境変数でログレベルを制御（デフォルト: "info"）
 * - 開発時は `pnpm dev 2>&1 | pino-pretty` でターミナルに整形出力
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: { service: "github-repository-search" },
})
