/**
 * @file アプリケーション共通 Server Actions
 * @see req-005-009, req-010-008
 */
"use server"

import { logger } from "@/shared/lib/logger"

/**
 * クライアントサイドのエラーをサーバーログに記録する
 * @remarks
 * error.tsx（Client Component）から呼び出し、Vercel Function Logs に出力する。
 * Sentry 等の外部サービスなしでエラーを追跡するための代替手段。
 * @param message - エラーメッセージ
 * @param digest - Next.js が付与するサーバーエラーの識別子
 */
export async function reportClientError(
  message: string,
  digest?: string
): Promise<void> {
  logger.error({ digest }, `クライアントエラー: ${message}`)
}
