/**
 * @file E2E テスト: リポジトリ検索
 * @see req-001-search
 * @see uc-001-search
 */
import { test, expect } from "./fixtures"

test.describe("Feature: リポジトリ検索 (req-001-search)", () => {
  test.beforeEach(async ({ page }) => {
    // Background: ユーザーがトップページ "/" にいる
    await page.goto("/")
  })

  test("uc-001-001: キーワードで検索できる", async ({
    page,
    makeAxeBuilder,
  }) => {
    // Arrange
    const searchInput = page.getByPlaceholder(/リポジトリ名を入力してください/i)
    const searchButton = page.getByRole("button", { name: "検索", exact: true })

    // Act: ユーザーが検索フォームに "next.js" と入力する
    await searchInput.fill("next.js")

    // React の再レンダリングでボタンが有効になるまで待機
    await expect(searchButton).toBeEnabled()

    // Act: 検索ボタンを押下する
    await searchButton.click()

    // Assert: URL が "/?q=next.js" または "/?q=next.js&page=1" に変わる
    await expect(page).toHaveURL(/\/\?q=next\.js(&page=1)?$/)

    // Assert: リポジトリ一覧が表示される
    await expect(page.getByRole("list")).toBeVisible()

    // Assert: 検索結果の総件数が表示される
    await expect(page.getByText(/件のリポジトリが見つかりました/)).toBeVisible()

    // アクセシビリティテスト（req-006-a11y-responsive）
    const accessibilityScanResults = await makeAxeBuilder().analyze()

    // 色のコントラスト問題を確認するため、violations を出力
    if (accessibilityScanResults.violations.length > 0) {
      console.log("Accessibility violations found:")
      accessibilityScanResults.violations.forEach((violation) => {
        console.log(`- ${violation.id}: ${violation.description}`)
        console.log(`  Impact: ${violation.impact}`)
        console.log(`  Help: ${violation.help}`)
        violation.nodes.forEach((node) => {
          console.log(`  Element: ${node.html}`)
          console.log(`  Message: ${node.failureSummary}`)
        })
      })
    }

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test("uc-001-002: Enter キーで検索できる", async ({ page }) => {
    // Arrange
    const searchInput = page.getByPlaceholder(/リポジトリ名を入力してください/i)
    const searchButton = page.getByRole("button", { name: "検索", exact: true })

    // Act: ユーザーが検索フォームに "react" と入力する
    await searchInput.fill("react")

    // React の再レンダリングでボタンが有効になるまで待機（Enter キー押下時のフォーム送信に必要）
    await expect(searchButton).toBeEnabled()

    // Act: Enter キーを押下する
    await searchInput.press("Enter")

    // Assert: URL が "/?q=react" または "/?q=react&page=1" に変わる
    await expect(page).toHaveURL(/\/\?q=react(&page=1)?$/)

    // Assert: リポジトリ一覧が表示される
    await expect(page.getByRole("list")).toBeVisible()
  })

  test("uc-001-003: URL の q パラメータで初期検索が実行される", async ({
    page,
  }) => {
    // Act: ユーザーが "/?q=typescript" に直接アクセスする
    await page.goto("/?q=typescript")

    // Assert: 検索フォームに "typescript" が入力された状態で表示される
    const searchInput = page.getByPlaceholder(/リポジトリ名を入力してください/i)
    await expect(searchInput).toHaveValue("typescript")

    // Assert: リポジトリ一覧が表示される
    await expect(page.getByRole("list")).toBeVisible()
  })

  test("uc-001-004: スペースを含むキーワードがエンコードされる", async ({
    page,
  }) => {
    // Arrange
    const searchInput = page.getByPlaceholder(/リポジトリ名を入力してください/i)
    const searchButton = page.getByRole("button", { name: "検索", exact: true })

    // Act: ユーザーが検索フォームに "react hooks" と入力する
    await searchInput.fill("react hooks")

    // React の再レンダリングでボタンが有効になるまで待機
    await expect(searchButton).toBeEnabled()

    // Act: 検索ボタンを押下する
    await searchButton.click()

    // Assert: URL が "/?q=react%20hooks" または "/?q=react+hooks" に変わる（スペースのエンコード）
    await expect(page).toHaveURL(/\/\?q=react(%20|\+)hooks(&page=1)?$/)
  })

  test("uc-001-005: 空の検索クエリでは検索ボタンが無効", async ({ page }) => {
    // Arrange: 検索フォームが空の状態
    const searchButton = page.getByRole("button", { name: "検索", exact: true })

    // Assert: 検索ボタンが無効化されている
    await expect(searchButton).toBeDisabled()
  })

  test("uc-001-007: 256文字超のクエリでバリデーションエラーが表示される", async ({
    page,
  }) => {
    // Arrange
    const searchInput = page.getByPlaceholder(/リポジトリ名を入力してください/i)
    const searchButton = page.getByRole("button", { name: "検索", exact: true })

    // Act: ユーザーが検索フォームに 257 文字のキーワードを入力する
    const longQuery = "a".repeat(257)
    await searchInput.fill(longQuery)

    // Act: 検索ボタンを押下する
    await searchButton.click()

    // Assert: バリデーションエラー "検索キーワードは256文字以内で入力してください" が表示される
    await expect(
      page.getByText(/検索キーワードは256文字以内で入力してください/)
    ).toBeVisible()

    // Assert: URL は変更されない
    await expect(page).toHaveURL("/")
  })
})
