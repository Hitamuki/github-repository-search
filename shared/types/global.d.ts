/**
 * @file グローバル型宣言
 * @remarks
 * TypeScript が認識しない拡張子のモジュール宣言を補完する。
 * CSS は Next.js のバンドラーが処理するため、型としては副作用のみ許可する。
 */

/** CSS ファイルの副作用インポートを許可 */
declare module "*.css"
