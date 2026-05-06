/**
 * @file E2E テスト: ページネーション
 * @see req-004-pagination
 * @see uc-004-pagination
 */
import { test, expect } from "./fixtures"

test.describe("Feature: ページネーション (req-004-pagination)", () => {
  test("uc-004-001: 次のページへ遷移できる", async ({ page }) => {
    // Arrange: ユーザーが 1 ページ目を表示している
    await page.goto("/?q=react")
    await expect(page.getByRole("list")).toBeVisible()

    // Act: ユーザーが「次のページ」をクリックする（有効時は Link 要素）
    const nextLink = page.getByRole("link", { name: /次のページ/ })
    await nextLink.click()

    // Assert: URL が "/?q=react&page=2" に変わる
    await expect(page).toHaveURL("/?q=react&page=2")

    // Assert: 2 ページ目のリポジトリ一覧が表示される
    await expect(page.getByRole("list")).toBeVisible()
  })

  test("uc-004-002: 前のページへ遷移できる", async ({ page }) => {
    // Arrange: ユーザーが "/?q=react&page=3" にいる
    await page.goto("/?q=react&page=3")
    await expect(page.getByRole("list")).toBeVisible()

    // Act: ユーザーが「前のページ」をクリックする（有効時は Link 要素）
    const prevLink = page.getByRole("link", { name: /前のページ/ })
    await prevLink.click()

    // Assert: URL が "/?q=react&page=2" に変わる
    await expect(page).toHaveURL("/?q=react&page=2")

    // Assert: 2 ページ目のリポジトリ一覧が表示される
    await expect(page.getByRole("list")).toBeVisible()
  })

  test("uc-004-003: 特定のページ番号へ遷移できる", async ({ page }) => {
    // Arrange: ユーザーが 1 ページ目を表示している
    await page.goto("/?q=react")
    await expect(page.getByRole("list")).toBeVisible()

    // Act: ユーザーがページネーションの "3" をクリックする（有効時は Link 要素）
    // 注: page 1 表示時の pagination は delta=2 により 1, 2, 3 のみ表示。
    // "5" は表示されないため、直接リンクが存在する "3" を使用する。
    const page3Link = page.getByRole("link", { name: "3", exact: true })
    await page3Link.click()

    // Assert: URL が "/?q=react&page=3" に変わる
    await expect(page).toHaveURL("/?q=react&page=3")

    // Assert: 3 ページ目のリポジトリ一覧が表示される
    await expect(page.getByRole("list")).toBeVisible()
  })

  test("uc-004-004: 検索クエリ変更時に page が 1 にリセットされる", async ({ page }) => {
    // Arrange: ユーザーが "/?q=react&page=3" にいる
    await page.goto("/?q=react&page=3")
    await expect(page.getByRole("list")).toBeVisible()

    // Act: ユーザーが検索フォームに "vue" と入力して検索する
    const searchInput = page.getByPlaceholder(/リポジトリ名を入力してください/i)
    const searchButton = page.getByRole("button", { name: "検索", exact: true })

    await searchInput.clear()
    await searchInput.fill("vue")
    await expect(searchButton).toBeEnabled()
    await searchButton.click()

    // Assert: URL が "/?q=vue" または "/?q=vue&page=1" に変わる（page パラメータなし）
    await expect(page).toHaveURL(/\/\?q=vue(&page=1)?$/)

    // Assert: 1 ページ目のリポジトリ一覧が表示される
    await expect(page.getByRole("list")).toBeVisible()
  })

  test("uc-004-005: page パラメータなしは 1 ページ目として扱われる", async ({ page }) => {
    // Act: ユーザーが "/?q=react" にアクセスする
    await page.goto("/?q=react")

    // Assert: 1 ページ目のリポジトリ一覧が表示される
    await expect(page.getByRole("list")).toBeVisible()
    // URL に page パラメータがないことを確認
    await expect(page).toHaveURL("/?q=react")
  })

  test("uc-004-006: 1 ページ目では「前のページ」が無効", async ({ page }) => {
    // Arrange: ユーザーが "/?q=react" の 1 ページ目にいる
    await page.goto("/?q=react")
    await expect(page.getByRole("list")).toBeVisible()

    // Assert: 「前のページ」ボタンが無効化されている（disabled 時は button 要素）
    const prevButton = page.getByRole("button", { name: /前のページ/ })
    await expect(prevButton).toBeDisabled()

    // Assert: 「次のページ」リンクが存在する（有効時は Link 要素）
    const nextLink = page.getByRole("link", { name: /次のページ/ })
    await expect(nextLink).toBeVisible()
  })

  test("uc-004-007: 最終ページでは「次のページ」が無効", async ({ page }) => {
    // Arrange: 最終ページ（20ページ目）にアクセスする
    await page.goto("/?q=react&page=20")
    await expect(page.getByRole("list")).toBeVisible()

    // Assert: 「次のページ」ボタンが無効化されている（disabled 時は button 要素）
    const nextButton = page.getByRole("button", { name: /次のページ/ })
    await expect(nextButton).toBeDisabled()

    // Assert: 「前のページ」リンクが存在する（有効時は Link 要素）
    const prevLink = page.getByRole("link", { name: /前のページ/ })
    await expect(prevLink).toBeVisible()
  })

  test("uc-004-008: page パラメータが不正な値のとき 1 ページ目を表示する", async ({
    page,
  }) => {
    // Act: ユーザーが "/?q=react&page=abc" にアクセスする
    await page.goto("/?q=react&page=abc")

    // Assert: 1 ページ目のリポジトリ一覧が表示される
    await expect(page.getByRole("list")).toBeVisible()
    // URL が正規化されることを確認（実装依存）
    await expect(page).toHaveURL(/q=react/)
  })

  test("uc-004-009: page パラメータが 0 以下のとき 1 ページ目を表示する", async ({
    page,
  }) => {
    // Act: ユーザーが "/?q=react&page=0" にアクセスする
    await page.goto("/?q=react&page=0")

    // Assert: 1 ページ目のリポジトリ一覧が表示される
    await expect(page.getByRole("list")).toBeVisible()
  })

  test("uc-004-010: 総件数が1000件超のとき上限注記が表示される", async ({ page }) => {
    // Arrange: react は総件数が1000件を超える検索結果を返す
    await page.goto("/?q=react")

    // Assert: "GitHub API の制約により、表示できるのは上位1000件までです" という注記が表示される
    await expect(
      page.getByText(/GitHub API の制約により、表示できるのは上位1000件までです/),
    ).toBeVisible()
  })

  test("uc-004-011: page パラメータが 20 を超えるとき 20 ページ目にリダイレクトされる", async ({
    page,
  }) => {
    // Act: ユーザーが "/?q=react&page=25" に直接アクセスする
    await page.goto("/?q=react&page=25")

    // Assert: URL が "/?q=react&page=20" にリダイレクトされる
    await expect(page).toHaveURL("/?q=react&page=20")

    // Assert: 20 ページ目のリポジトリ一覧が表示される
    await expect(page.getByRole("list")).toBeVisible()
  })
})
