/**
 * @file E2E テストフラグ
 * @remarks
 * 特定の前提条件（API モック、ネットワーク制御等）が必要なテストシナリオを
 * 環境変数でスキップ/実行切り替えするためのフラグ定義。
 */

/**
 * エラーシナリオテスト有効フラグ
 * @remarks
 * GitHub API の 403/422 エラー、レート制限超過、ネットワークエラー、
 * 予期しないサーバーエラー等を再現するには MSW によるモック設定が必要。
 * このフラグが `false`（デフォルト）の場合、対象テストはスキップされる。
 *
 * @example 有効化する場合
 * ```sh
 * ENABLE_ERROR_SCENARIO_TESTS=true pnpm test:e2e
 * ```
 */
export const ENABLE_ERROR_SCENARIO_TESTS =
  process.env.ENABLE_ERROR_SCENARIO_TESTS === "false"

/**
 * エラーシナリオテストのスキップ理由メッセージ
 */
export const ERROR_SCENARIO_SKIP_REASON =
  "API エラーの再現にはモック設定が必要なためデフォルトではスキップ。" +
  "実行する場合は ENABLE_ERROR_SCENARIO_TESTS=true を設定してください。"

/**
 * キーボード/フォーカステストをモバイル・タブレットでスキップする理由メッセージ
 */
export const KEYBOARD_SKIP_REASON =
  "モバイル・タブレットにはハードウェアキーボードがないためスキップ。" +
  "キーボード操作・フォーカス管理テストはデスクトップ環境のみで実行します。"

/** キーボードテストをスキップするプロジェクト名（モバイル・タブレット） */
export const KEYBOARD_SKIP_PROJECTS = ["chromium-mobile", "chromium-tablet"]
