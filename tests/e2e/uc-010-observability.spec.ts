/**
 * @file E2E テスト: オブザーバビリティ
 * @see req-010-observability
 * @see uc-010-observability
 */
import { test, expect } from "./fixtures"

/** UUID v4 形式の正規表現 */
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

test.describe("Feature: オブザーバビリティ (req-010-observability)", () => {
  // ── x-request-id ヘッダー付与 ────────────────────────────────────────────

  test("uc-010-001: トップページのレスポンスに x-request-id ヘッダーが付与される", async ({
    page,
  }) => {
    // Act: ユーザーがトップページ "/" にアクセスする
    const response = await page.goto("/")

    // Assert: レスポンスヘッダーに "x-request-id" が存在する
    const requestId = response?.headers()["x-request-id"]
    expect(requestId).toBeTruthy()

    // Assert: "x-request-id" の値が UUID v4 形式である
    expect(requestId).toMatch(UUID_V4_PATTERN)
  })

  test("uc-010-002: 検索ページのレスポンスに x-request-id ヘッダーが付与される", async ({
    page,
  }) => {
    // Act: ユーザーが "/?q=react" にアクセスする
    const response = await page.goto("/?q=react")

    // Assert: レスポンスヘッダーに "x-request-id" が存在する
    const requestId = response?.headers()["x-request-id"]
    expect(requestId).toBeTruthy()

    // Assert: "x-request-id" の値が UUID v4 形式である
    expect(requestId).toMatch(UUID_V4_PATTERN)
  })

  test("uc-010-003: 詳細ページのレスポンスに x-request-id ヘッダーが付与される", async ({
    page,
  }) => {
    // Act: ユーザーが "/repos/vercel/next.js" にアクセスする
    const response = await page.goto("/repos/vercel/next.js")

    // Assert: レスポンスヘッダーに "x-request-id" が存在する
    const requestId = response?.headers()["x-request-id"]
    expect(requestId).toBeTruthy()

    // Assert: "x-request-id" の値が UUID v4 形式である
    expect(requestId).toMatch(UUID_V4_PATTERN)
  })

  test("uc-010-004: リクエストごとに x-request-id が一意になる", async ({
    page,
  }) => {
    // Act: ユーザーが "/" に連続して 2 回アクセスする
    const response1 = await page.goto("/")
    const id1 = response1?.headers()["x-request-id"]

    const response2 = await page.goto("/")
    const id2 = response2?.headers()["x-request-id"]

    // Assert: 1 回目と 2 回目の "x-request-id" の値が異なる
    expect(id1).toBeTruthy()
    expect(id2).toBeTruthy()
    expect(id1).not.toBe(id2)
  })
})
