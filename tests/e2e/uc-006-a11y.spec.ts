/**
 * @file E2E テスト: アクセシビリティ・レスポンシブ
 * @see req-006-a11y-responsive
 * @see uc-006-a11y
 */
import { test, expect } from "./fixtures"
import {
  ENABLE_ERROR_SCENARIO_TESTS,
  ERROR_SCENARIO_SKIP_REASON,
  KEYBOARD_SKIP_PROJECTS,
  KEYBOARD_SKIP_REASON,
} from "./test-flags"

test.describe("Feature: アクセシビリティ・レスポンシブ (req-006-a11y-responsive)", () => {
  // ── キーボード操作 ──────────────────────────────────────────────────────
  // 以下のキーボード/フォーカステストはデスクトップ環境でのみ実行する。
  // モバイル・タブレットにはハードウェアキーボードがないためスキップ。

  test("uc-006-001: キーボードのみで検索が完結できる", async ({
    page,
  }, testInfo) => {
    test.skip(
      KEYBOARD_SKIP_PROJECTS.includes(testInfo.project.name),
      KEYBOARD_SKIP_REASON
    )

    // Arrange
    await page.goto("/")

    // Act: Tab キーで検索フォームにフォーカスする
    // SiteHeader に <Link href="/"> が存在するため、Tab 1回目はヘッダーリンクにフォーカスが移る。
    // 検索入力にフォーカスが当たるまで Tab を押し続ける（最大 5 回）。
    const searchInput = page.getByPlaceholder(/リポジトリ名を入力してください/i)
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab")
      if (await searchInput.evaluate((el) => document.activeElement === el))
        break
    }
    await expect(searchInput).toBeFocused()

    // Act: キーワードを入力して Enter キーを押下する
    await page.keyboard.type("react")
    await page.keyboard.press("Enter")

    // Assert: 検索が実行される
    await expect(page).toHaveURL(/\/\?q=react/)
    await expect(page.getByRole("list")).toBeVisible()

    // Assert: Tab キーでリポジトリカードにフォーカスできる
    // リスト内の最初のリンクにたどり着くまで Tab を押す（最大 15 回）
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Tab")
      const focusedTag = await page.evaluate(
        () => document.activeElement?.tagName
      )
      if (focusedTag === "A") break
    }
    const focusedTag = await page.evaluate(
      () => document.activeElement?.tagName
    )
    expect(focusedTag).toBe("A")

    // Assert: Enter キーでリポジトリ詳細へ遷移できる
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(/\/repos\//)
  })

  test("uc-006-002: フォーカス可能な要素にフォーカスインジケータが表示される", async ({
    page,
  }, testInfo) => {
    test.skip(
      KEYBOARD_SKIP_PROJECTS.includes(testInfo.project.name),
      KEYBOARD_SKIP_REASON
    )

    // Arrange
    await page.goto("/")

    // Act: Tab キーで検索フォームにフォーカスする
    // SiteHeader リンクを経由するため、検索入力に到達するまでループする（最大 5 回）
    const searchInput = page.getByPlaceholder(/リポジトリ名を入力してください/i)
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab")
      if (await searchInput.evaluate((el) => document.activeElement === el))
        break
    }
    await expect(searchInput).toBeFocused()

    // Assert: フォーカスされた要素に視覚的なアウトライン（ring / outline）が表示される
    // Tailwind の focus-visible:ring-2 は box-shadow として適用される
    const hasFocusIndicator = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      if (!el) return false
      const styles = window.getComputedStyle(el)
      const hasBoxShadow = styles.boxShadow !== "none"
      const hasOutline =
        styles.outlineStyle !== "none" && styles.outlineWidth !== "0px"
      return hasBoxShadow || hasOutline
    })
    expect(hasFocusIndicator).toBeTruthy()
  })

  // ── スクリーンリーダー ──────────────────────────────────────────────────

  test("uc-006-003: ローディング中に aria-busy が付与される", async ({
    page,
  }) => {
    // Arrange: ページ遷移を開始するが完全に読み込まれる前にスケルトンを確認
    const navigation = page.goto("/?q=react")

    // Assert: ローディング要素に aria-busy="true" が付与されている
    const skeleton = page.getByTestId("repository-list-skeleton")
    await expect(skeleton).toBeVisible()
    await expect(skeleton).toHaveAttribute("aria-busy", "true")

    // Act: レスポンス受信を待つ
    await navigation
    await expect(page.getByRole("list")).toBeVisible()
  })

  test("uc-006-004: エラー発生時に role='alert' でエラーが通知される", async ({
    page,
  }) => {
    // req-006-004 — API エラーを発生させるにはモック設定が必要なためデフォルトスキップ
    test.skip(!ENABLE_ERROR_SCENARIO_TESTS, ERROR_SCENARIO_SKIP_REASON)

    // Arrange: GitHub API がエラーを返すクエリを使用（MSW でモック設定済みの場合）
    await page.goto("/?q=error")

    // Assert: エラーメッセージ要素に role="alert" が付与されている
    const alertElement = page.getByRole("alert")
    await expect(alertElement).toBeVisible()
  })

  test("uc-006-005: 検索結果にアクセシブルなラベルが付与されている", async ({
    page,
  }) => {
    // Arrange / Act
    await page.goto("/?q=react")
    await expect(page.getByRole("list")).toBeVisible()

    // Assert: 検索結果リストに適切な aria-label が付与されている
    const list = page.getByRole("list", { name: /検索結果/i })
    await expect(list).toBeVisible()

    // Assert: 各リポジトリカードにアクセシブルな名前が設定されている
    const firstCard = page.getByRole("listitem").first()
    const link = firstCard.getByRole("link")
    await expect(link).toBeVisible()
    // アクセシブルな名前はリンクのテキストコンテンツから自動設定される
    const accessibleName = await link.textContent()
    expect(accessibleName?.trim()).toBeTruthy()
  })

  // ── レスポンシブ ────────────────────────────────────────────────────────

  test("uc-006-006: モバイル幅 (375px) でレイアウトが崩れない", async ({
    page,
  }) => {
    // Arrange: ブラウザ幅を 375px に設定
    await page.setViewportSize({ width: 375, height: 667 })

    // Act
    await page.goto("/?q=react")
    await expect(page.getByRole("list")).toBeVisible()

    // Assert: 検索フォームが正常に表示される
    await expect(
      page.getByPlaceholder(/リポジトリ名を入力してください/i)
    ).toBeVisible()

    // Assert: リポジトリ一覧が正常に表示される
    await expect(page.getByRole("listitem").first()).toBeVisible()

    // Assert: 横スクロールが発生しない
    const hasHorizontalScroll = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
    )
    expect(hasHorizontalScroll).toBeFalsy()
  })

  test("uc-006-007: タブレット幅 (768px) でレイアウトが最適化される", async ({
    page,
  }) => {
    // Arrange: ブラウザ幅を 768px に設定
    await page.setViewportSize({ width: 768, height: 1024 })

    // Act
    await page.goto("/?q=react")
    await expect(page.getByRole("list")).toBeVisible()

    // Assert: 検索フォームが正常に表示される
    await expect(
      page.getByPlaceholder(/リポジトリ名を入力してください/i)
    ).toBeVisible()

    // Assert: リポジトリ一覧が最適なグリッドで表示される
    await expect(page.getByRole("listitem").first()).toBeVisible()
  })

  test("uc-006-008: PC 幅 (1280px) でレイアウトが最適化される", async ({
    page,
  }) => {
    // Arrange: ブラウザ幅を 1280px に設定
    await page.setViewportSize({ width: 1280, height: 800 })

    // Act
    await page.goto("/?q=react")
    await expect(page.getByRole("list")).toBeVisible()

    // Assert: 検索フォームが正常に表示される
    await expect(
      page.getByPlaceholder(/リポジトリ名を入力してください/i)
    ).toBeVisible()

    // Assert: リポジトリ一覧が最適なグリッドで表示される
    await expect(page.getByRole("listitem").first()).toBeVisible()
  })

  // ── フォーカス管理 ──────────────────────────────────────────────────────

  test("uc-006-009: 検索後にフォーカスが検索結果一覧の先頭へ移動する", async ({
    page,
  }, testInfo) => {
    test.skip(
      KEYBOARD_SKIP_PROJECTS.includes(testInfo.project.name),
      KEYBOARD_SKIP_REASON
    )

    // Arrange
    await page.goto("/")
    const searchInput = page.getByPlaceholder(/リポジトリ名を入力してください/i)
    const searchButton = page.getByRole("button", { name: "検索", exact: true })

    // Act: "react" と入力し検索を実行する
    await searchInput.fill("react")
    await expect(searchButton).toBeEnabled()
    await searchButton.click()

    // Assert: 検索結果が表示される
    await expect(page.getByRole("list")).toBeVisible()

    // Assert: フォーカスが検索結果一覧の先頭要素またはリスト自体に移動している
    // スクリーンリーダーが検索結果を読み上げ可能な状態になる
    const resultsList = page.getByRole("list", { name: /検索結果/i })
    const focusedInResults = await page.evaluate(() => {
      const el = document.activeElement
      const list = document.querySelector('[aria-label="検索結果"]')
      return list?.contains(el) ?? false
    })
    expect(focusedInResults).toBeTruthy()
    await expect(resultsList).toBeVisible()
  })
})
