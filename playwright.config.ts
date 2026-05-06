/**
 * @file Playwright E2E テスト設定
 * @see req-001-search, req-002-results, req-003-detail, req-006-a11y-responsive
 * @remarks
 * Testing Trophy 思想（AGENTS.md §7）に基づき、主要ユーザーフローのみを E2E でカバーする。
 * Gherkin シナリオと 1対1 対応させる。
 */
import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright 設定
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // テストディレクトリ
  testDir: "./tests/e2e",

  // テストファイルパターン
  testMatch: "**/*.spec.ts",

  // 並列実行
  fullyParallel: true,

  // CI での再試行
  retries: process.env.CI ? 2 : 0,

  // ワーカー数
  workers: process.env.CI ? 1 : undefined,

  // レポーター
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],

  // 共通設定
  use: {
    // ベース URL
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",

    // トレース（失敗時のみ）
    trace: "on-first-retry",

    // スクリーンショット（失敗時のみ）
    screenshot: "only-on-failure",

    // ビデオ（失敗時のみ）
    video: "retain-on-failure",

    // ロケール（日本語 UI のため）
    locale: "ja-JP",

    // タイムゾーン
    timezoneId: "Asia/Tokyo",
  },

  // プロジェクト（デバイス・ブラウザ）
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "chromium-tablet",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: "chromium-mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 667 },
      },
    },
  ],

  // 開発サーバー（テスト実行前に自動起動）
  webServer: {
    command: "pnpm run build && pnpm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
