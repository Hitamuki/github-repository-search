/**
 * @file Tailwind CSS クラス名ユーティリティ
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * clsx と tailwind-merge を組み合わせてクラス名を結合する
 * @param inputs - クラス値の可変長引数
 * @returns マージ済みクラス名文字列
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
