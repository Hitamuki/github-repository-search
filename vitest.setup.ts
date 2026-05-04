/**
 * @file Vitest グローバルセットアップ
 * @remarks
 * - jest-dom カスタムマッチャー（toBeInTheDocument 等）を全テストで有効化
 * - server-only モジュールをモックしてサーバー専用コードをテスト可能にする
 */
import "@testing-library/jest-dom"
import { vi } from "vitest"

vi.mock("server-only", () => ({}))
