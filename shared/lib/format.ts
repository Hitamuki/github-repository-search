/**
 * @file 数値・日付フォーマットユーティリティ
 */

/**
 * 数値を k 単位で短縮表示する
 * @param n - フォーマット対象の数値
 * @returns フォーマット済み文字列（例: 1234 → "1.2k"）
 */
export function formatCount(n: number | null | undefined): string {
  if (n === null || n === undefined) return "−"
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

/**
 * ISO 8601 日付文字列を日本語ロケールでフォーマットする
 * @param dateString - ISO 8601 形式の日付文字列
 * @returns フォーマット済み文字列（例: "2023年4月1日"）
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "−"
  return new Date(dateString).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
