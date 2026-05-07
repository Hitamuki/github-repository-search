/**
 * @file E2E テスト: エラーハンドリング
 * @see req-005-error
 * @see uc-005-error
 */
import { test, expect } from "./fixtures"
import {
  ENABLE_ERROR_SCENARIO_TESTS,
  ERROR_SCENARIO_SKIP_REASON,
} from "./test-flags"

test.describe("Feature: エラーハンドリング (req-005-error)", () => {
  test("uc-005-001: GitHub API が 403 を返したときレート制限メッセージが表示される", async ({
    page,
  }) => {
    // req-005-001 — MSW によるモック設定が必要なためデフォルトスキップ
    test.skip(!ENABLE_ERROR_SCENARIO_TESTS, ERROR_SCENARIO_SKIP_REASON)

    // Arrange: GitHub API が 403 レスポンスを返すモックが設定されている
    await page.goto("/?q=ratelimit")

    // Assert: レート制限メッセージが表示される
    await expect(
      page.getByText(
        /API レート制限に達しました。しばらく待ってから再試行してください。/
      )
    ).toBeVisible()

    // Assert: スタックトレースは表示されない
    await expect(page.getByText(/stack trace|エラー詳細/i)).not.toBeVisible()
  })

  test("uc-005-002: X-RateLimit-Remaining が 0 のときリセット時刻が表示される", async ({
    page,
  }) => {
    // req-005-002 — MSW によるモック設定が必要なためデフォルトスキップ
    test.skip(!ENABLE_ERROR_SCENARIO_TESTS, ERROR_SCENARIO_SKIP_REASON)

    // Arrange: GitHub API が X-RateLimit-Remaining: 0 ヘッダーを返すモックが設定されている
    await page.goto("/?q=ratelimit-reset")

    // Assert: レート制限リセット時刻が表示される
    await expect(page.getByText(/リセット時刻|reset/i)).toBeVisible()
  })

  test("uc-005-003: GitHub API が 422（クエリ無効）を返したときバリデーションエラーメッセージが表示される", async ({
    page,
  }) => {
    // req-005-003 — MSW によるモック設定が必要なためデフォルトスキップ
    test.skip(!ENABLE_ERROR_SCENARIO_TESTS, ERROR_SCENARIO_SKIP_REASON)

    // Arrange: GitHub API が 422 レスポンス（クエリ無効）を返すモックが設定されている
    await page.goto("/?q=invalid-query-422")

    // Assert: バリデーションエラーメッセージが表示される
    await expect(
      page.getByText(/検索クエリが無効です。別のキーワードをお試しください。/)
    ).toBeVisible()
  })

  test("uc-005-004: ネットワークエラー時にエラーメッセージが表示される", async ({
    page,
    context,
  }) => {
    // req-005-004 — SSR はサーバー側で fetch するためブラウザオフラインでは再現不可
    test.skip(!ENABLE_ERROR_SCENARIO_TESTS, ERROR_SCENARIO_SKIP_REASON)

    // Arrange: ネットワーク接続が切断されているモックが設定されている
    await context.setOffline(true)

    // Act: ユーザーが検索を実行する
    await page.goto("/?q=react")

    // Assert: エラーメッセージが表示される
    await expect(
      page.getByText(
        /ネットワークエラーが発生しました。接続を確認してください。/
      )
    ).toBeVisible()

    // Cleanup
    await context.setOffline(false)
  })

  test("uc-005-005: 予期しないエラー時に汎用エラーメッセージが表示される", async ({
    page,
  }) => {
    // req-005-005 — MSW によるモック設定が必要なためデフォルトスキップ
    test.skip(!ENABLE_ERROR_SCENARIO_TESTS, ERROR_SCENARIO_SKIP_REASON)

    // Arrange: GitHub API が 500 レスポンスを返すモックが設定されている
    await page.goto("/?q=error")

    // Assert: 汎用エラーメッセージが表示される
    await expect(
      page.getByText(/予期しないエラーが発生しました。/)
    ).toBeVisible()

    // Assert: スタックトレースは表示されない
    await expect(page.getByText(/stack trace|エラー詳細/i)).not.toBeVisible()
  })

  test("uc-005-006: GitHub API が 422（ページ上限超過）を返したとき上限メッセージが表示される", async ({
    page,
  }) => {
    // req-005-006 — page=25 は page.tsx でリダイレクト済みのため MSW モック設定が必要
    test.skip(!ENABLE_ERROR_SCENARIO_TESTS, ERROR_SCENARIO_SKIP_REASON)

    // Arrange: GitHub API が 422（"Only the first 1000 search results are available"）を返すモックが設定されている
    await page.goto("/?q=react&page=25")

    // Assert: 上限メッセージが表示される
    await expect(
      page.getByText(/表示できるのは上位1000件（20ページ）までです。/)
    ).toBeVisible()
  })

  test("uc-005-007: 存在しないページへのアクセスでグローバル 404 ページが表示される", async ({
    page,
  }) => {
    // Act: ユーザーが存在しないパス "/unknown/path" にアクセスする
    await page.goto("/unknown/path")

    // Assert: 404 テキストが表示される（<p> 要素）
    await expect(page.getByText("404")).toBeVisible()

    // Assert: "ページが見つかりませんでした" というメッセージが表示される（<h1> 要素）
    await expect(
      page.getByRole("heading", { name: /ページが見つかりませんでした/ })
    ).toBeVisible()

    // Assert: トップページへ戻るリンクが表示される
    await expect(page.getByRole("link", { name: /トップへ戻る/ })).toBeVisible()
  })
})
