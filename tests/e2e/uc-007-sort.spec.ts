/**
 * @file E2E テスト: 検索結果のソート
 * @see req-007-sort
 * @see uc-007-sort
 */
import { test, expect } from "./fixtures"

test.describe("Feature: 検索結果のソート (req-007-sort)", () => {
  test.beforeEach(async ({ page }) => {
    // Background: ユーザーが "/?q=react" にアクセスし検索結果が表示されている
    await page.goto("/?q=react")
    await expect(page.getByRole("list")).toBeVisible()
  })

  // ── 正常系 ──────────────────────────────────────────────────────────────

  test("uc-007-001: デフォルトのソートは「関連度」である", async ({ page }) => {
    // Assert: ソートセレクタに「関連度」が選択されている（aria-pressed="true"）
    const defaultSortButton = page.getByRole("button", { name: "関連度" })
    await expect(defaultSortButton).toHaveAttribute("aria-pressed", "true")

    // Assert: URL の sort パラメータは存在しない
    const url = page.url()
    expect(url).not.toContain("sort=")
  })

  test("uc-007-002: Star数でソートできる", async ({ page }) => {
    // Act: ユーザーがソートセレクタで「Star数」を選択する
    await page.getByRole("button", { name: "Star数" }).click()

    // Assert: URL が "/?q=react&sort=stars" に変わる（page=1 は許容）
    await expect(page).toHaveURL(/q=react.*sort=stars|sort=stars.*q=react/)
    expect(page.url()).not.toContain("sort=forks")
    expect(page.url()).not.toContain("sort=updated")

    // Assert: 検索結果が表示される
    await expect(page.getByRole("list")).toBeVisible()
  })

  test("uc-007-003: Fork数でソートできる", async ({ page }) => {
    // Act: ユーザーがソートセレクタで「Fork数」を選択する
    await page.getByRole("button", { name: "Fork数" }).click()

    // Assert: URL が "/?q=react&sort=forks" に変わる
    await expect(page).toHaveURL(/sort=forks/)
  })

  test("uc-007-004: 更新日でソートできる", async ({ page }) => {
    // Act: ユーザーがソートセレクタで「更新日」を選択する
    await page.getByRole("button", { name: "更新日" }).click()

    // Assert: URL が "/?q=react&sort=updated" に変わる
    await expect(page).toHaveURL(/sort=updated/)
  })

  test("uc-007-005: ソート変更時に page が 1 にリセットされる", async ({
    page,
  }) => {
    // Arrange: ユーザーが "/?q=react&page=3" にいる
    await page.goto("/?q=react&page=3")
    await expect(page.getByRole("list")).toBeVisible()

    // Act: ユーザーがソートセレクタで「Star数」を選択する
    await page.getByRole("button", { name: "Star数" }).click()

    // Assert: URL の page パラメータが 3 でないこと（1 にリセット、または省略）
    await expect(page).not.toHaveURL(/page=3/)
    await expect(page).toHaveURL(/sort=stars/)
  })

  test("uc-007-006: URL の sort パラメータで初期ソートが反映される", async ({
    page,
  }) => {
    // Arrange / Act: ユーザーが "/?q=react&sort=stars" に直接アクセスする
    await page.goto("/?q=react&sort=stars")
    await expect(page.getByRole("list")).toBeVisible()

    // Assert: ソートセレクタに「Star数」が選択された状態で表示される
    const starsButton = page.getByRole("button", { name: "Star数" })
    await expect(starsButton).toHaveAttribute("aria-pressed", "true")

    // Assert: 「関連度」は非選択
    const defaultButton = page.getByRole("button", { name: "関連度" })
    await expect(defaultButton).toHaveAttribute("aria-pressed", "false")
  })

  // ── 異常系 ──────────────────────────────────────────────────────────────

  test("uc-007-007: sort パラメータが不正な値のとき「関連度」にフォールバックする", async ({
    page,
  }) => {
    // Arrange / Act: ユーザーが "/?q=react&sort=invalid" に直接アクセスする
    await page.goto("/?q=react&sort=invalid")
    await expect(page.getByRole("list")).toBeVisible()

    // Assert: ソートセレクタに「関連度」が選択されている
    const defaultButton = page.getByRole("button", { name: "関連度" })
    await expect(defaultButton).toHaveAttribute("aria-pressed", "true")
  })
})
