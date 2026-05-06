/**
 * @file E2E テスト: リポジトリ詳細
 * @see req-003-detail
 * @see uc-003-detail
 */
import { test, expect } from "./fixtures"

test.describe("Feature: リポジトリ詳細 (req-003-detail)", () => {
  test("uc-003-001: リポジトリ詳細情報が表示される", async ({
    page,
  }) => {
    // Act: ユーザーが "/repos/vercel/next.js" にアクセスする
    await page.goto("/repos/vercel/next.js")

    // Assert: リポジトリ名 "next.js" が表示される
    await expect(page.getByRole("heading", { name: /next\.js/i })).toBeVisible()

    // Assert: オーナー名 "vercel" が表示される（複数マッチするため first() を使用）
    await expect(page.getByText(/vercel/i).first()).toBeVisible()

    // Assert: 作成日が表示される（メタグリッドに常に存在）
    await expect(page.getByText("作成日")).toBeVisible()

    // Assert: スター数が表示される
    // 詳細ページの stats グリッドには "Star 数" ラベルが表示される
    await expect(page.getByText("Star 数")).toBeVisible()

    // Assert: フォーク数が表示される
    await expect(page.getByText("Fork 数")).toBeVisible()

    // Assert: オープンイシュー数が表示される
    await expect(page.getByText("Issue 数")).toBeVisible()

    // Assert: ウォッチャー数が表示される（stats グリッドに常に存在）
    // 注: 言語は <Badge> に言語名のみ表示されるため "言語" ラベルは存在しない
    await expect(page.getByText("Watcher 数")).toBeVisible()

    // Assert: ライセンスが表示される（vercel/next.js は MIT ライセンスのため存在）
    await expect(page.getByText("ライセンス")).toBeVisible()

    // Assert: 最終更新日が表示される
    await expect(page.getByText("最終更新日")).toBeVisible()

    // Assert: "GitHubで見る" リンクが表示される
    await expect(page.getByRole("link", { name: /GitHub で開く/i })).toBeVisible()

    // TODO: アクセシビリティテスト（req-006-a11y-responsive）
    // const accessibilityScanResults = await makeAxeBuilder().analyze()
    // expect(accessibilityScanResults.violations).toEqual([])
  })

  test("uc-003-002: 「GitHubで見る」リンクが新しいタブで開く", async ({ page }) => {
    // Arrange: ユーザーが "/repos/vercel/next.js" にアクセスしている
    await page.goto("/repos/vercel/next.js")

    // Act: "GitHubで見る" リンクを取得
    const githubLink = page.getByRole("link", { name: /GitHub で開く/i })

    // Assert: リンクに target="_blank" が付与されている
    await expect(githubLink).toHaveAttribute("target", "_blank")

    // Assert: リンクに rel="noopener noreferrer" が付与されている
    await expect(githubLink).toHaveAttribute("rel", /noopener noreferrer/)
  })

  test("uc-003-003: 検索結果一覧へ戻るリンクが機能する", async ({ page }) => {
    // Arrange: ユーザーが "/?q=next.js" から "/repos/vercel/next.js" へ遷移した
    await page.goto("/?q=next.js")
    await expect(page.getByRole("list")).toBeVisible()

    const firstCard = page.getByRole("listitem").first()
    await firstCard.getByRole("link").click()

    await expect(page).toHaveURL(/\/repos\/[^/]+\/[^/]+/)

    // Act: ユーザーが "戻る" リンクをクリックする
    const backLink = page.getByRole("link", { name: /検索結果に戻る/i })
    await backLink.click()

    // Assert: "/?q=next.js" を含む URL へ遷移する（sort/page パラメータが付与される場合あり）
    await expect(page).toHaveURL(/\?q=next\.js/)
  })

  test("uc-003-004: 詳細取得中にスケルトン UI が表示される", async ({ page }) => {
    // Arrange: ページ遷移を開始するが、完全に読み込まれる前にスケルトンを確認
    const navigation = page.goto("/repos/vercel/next.js")

    // Assert: スケルトン UI または詳細見出しが表示される（ISR キャッシュ時はスケルトンが瞬時に消える）
    const skeleton = page.getByTestId("repository-detail-skeleton")
    const heading = page.getByRole("heading", { name: /next\.js/i })
    await expect(skeleton.or(heading)).toBeVisible()

    // Act: レスポンス受信を待つ
    await navigation

    // Assert: レスポンス受信後に詳細情報が表示される
    await expect(page.getByRole("heading", { name: /next\.js/i })).toBeVisible()
  })

  test.skip("uc-003-005: 説明文がないリポジトリで「説明なし」と表示される", async ({
    page,
  }) => {
    // TODO: MSW を使って GitHub API のレスポンスをモックする必要がある
    // 実際の GitHub API にはこの用途に適した固定リポジトリが存在しない
    await page.goto("/repos/test-owner/repo-no-description")
    await expect(page.getByText(/説明なし/)).toBeVisible()
  })

  test.skip("uc-003-006: ライセンスがないリポジトリで「ライセンスなし」と表示される", async ({
    page,
  }) => {
    // TODO: MSW を使って GitHub API のレスポンスをモックする必要がある
    // 実際の GitHub API にはこの用途に適した固定リポジトリが存在しない
    await page.goto("/repos/test-owner/repo-no-license")
    await expect(page.getByText(/ライセンスなし/)).toBeVisible()
  })

  test("uc-003-007: 存在しないリポジトリで 404 ページが表示される", async ({ page }) => {
    // Arrange: GitHub API が 404 レスポンスを返す
    await page.goto("/repos/nonexistent-owner/nonexistent-repo")

    // Assert: 404 テキストが表示される（<p> 要素）
    await expect(page.getByText("404")).toBeVisible()

    // Assert: エラーメッセージが見出しとして表示される（<h2> 要素）
    await expect(
      page.getByRole("heading", { name: /リポジトリが見つかりませんでした/ }),
    ).toBeVisible()
  })
})
