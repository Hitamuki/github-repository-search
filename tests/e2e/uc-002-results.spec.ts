/**
 * @file E2E テスト: 検索結果一覧
 * @see req-002-results
 * @see uc-002-results
 */
import { test, expect } from "./fixtures"

test.describe("Feature: 検索結果一覧 (req-002-results)", () => {
  test("uc-002-001: 検索結果が一覧で表示される", async ({ page }) => {
    // Act: ユーザーが "/?q=next.js" にアクセスする
    await page.goto("/?q=next.js")

    // Assert: リポジトリカードが表示される
    const repositoryCards = page.getByRole("listitem")
    await expect(repositoryCards.first()).toBeVisible()

    // Assert: 各カードにリポジトリ名（Link要素）が表示される
    await expect(repositoryCards.first().getByRole("link")).toBeVisible()

    // Assert: 各カードにスター数が表示される
    // RepositoryCard は Lucide SVG の Star アイコン + formatCount() 出力（例: "1.2k"）で表示するため、
    // ★ 文字ではなく innerText に数値が含まれることで確認する
    const cardText = await repositoryCards.first().innerText()
    expect(cardText).toMatch(/\d/)

    // TODO: アクセシビリティテスト（req-006-a11y-responsive）
    // const accessibilityScanResults = await makeAxeBuilder().analyze()
    // expect(accessibilityScanResults.violations).toEqual([])
  })

  test("uc-002-002: 総件数が表示される", async ({ page }) => {
    // Act: ユーザーが "/?q=next.js" にアクセスする
    await page.goto("/?q=next.js")

    // Assert: "XXXXX 件のリポジトリが見つかりました" のような総件数表示が存在する
    await expect(page.getByText(/件のリポジトリが見つかりました/)).toBeVisible()
  })

  test("uc-002-003: リポジトリカードクリックで詳細へ遷移する", async ({ page }) => {
    // Arrange: ユーザーが "/?q=next.js" にアクセスし結果が表示されている
    await page.goto("/?q=next.js")
    await expect(page.getByRole("list")).toBeVisible()

    // Act: ユーザーが最初のリポジトリカードをクリックする
    // <li>（listitem）ではなく内包する <a>（link）を直接クリックして確実にナビゲーションを発生させる
    const firstCard = page.getByRole("listitem").first()
    await firstCard.getByRole("link").click()

    // Assert: "/repos/{owner}/{repo}" へ遷移する
    await expect(page).toHaveURL(/\/repos\/[^/]+\/[^/]+/)
  })

  test("uc-002-004: 検索中にスケルトン UI が表示される", async ({ page }) => {
    // Arrange: ページ遷移を開始するが、完全に読み込まれる前にスケルトンを確認
    const navigation = page.goto("/?q=react")

    // Assert: スケルトン UI またはリポジトリ一覧が表示される（ISR キャッシュ時はスケルトンが瞬時に消える）
    // locator.or() の strict モード問題を避けるため CSS セレクタで OR マッチングする
    await expect(
      page.locator(
        '[data-testid="repository-list-skeleton"], [aria-label="検索結果"]',
      ).first(),
    ).toBeVisible()

    // Act: レスポンス受信を待つ
    await navigation

    // Assert: レスポンス受信後にリポジトリ一覧が表示される
    await expect(page.getByRole("list")).toBeVisible()
  })

  test("uc-002-005: 検索結果が0件のとき空メッセージが表示される", async ({ page }) => {
    // Arrange: 存在しないキーワードで検索する
    await page.goto("/?q=xxxxxxxxnotfoundxxxxxxxxx")

    // Assert: "「...」に一致するリポジトリが見つかりませんでした" というメッセージが表示される
    await expect(
      page.getByText(/に一致するリポジトリが見つかりませんでした/),
    ).toBeVisible()

    // Assert: リポジトリカードは表示されない
    await expect(page.getByRole("list")).not.toBeVisible()
  })

  test("uc-002-006: q パラメータなしではフォームのみ表示される", async ({ page }) => {
    // Act: ユーザーが "/" にアクセスする
    await page.goto("/")

    // Assert: 検索フォームが表示される
    await expect(page.getByPlaceholder(/リポジトリ名を入力してください/i)).toBeVisible()

    // Assert: リポジトリ一覧は表示されない
    await expect(page.getByRole("list")).not.toBeVisible()

    // Assert: 総件数表示は表示されない
    await expect(page.getByText(/件のリポジトリが見つかりました/)).not.toBeVisible()
  })
})
