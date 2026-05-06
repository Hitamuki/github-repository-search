# E2E テスト

## 概要

Playwright を使用した E2E（End-to-End）テストです。Testing Trophy 思想（AGENTS.md §7）に基づき、主要なユーザーフローのみをカバーします。

## テスト方針

- **Gherkin シナリオと 1対1 対応**: `specs/gherkin/` の各シナリオに対応するテストを作成
- **主要フローのみ**: 検索・結果表示・詳細表示・ページネーション・エラーハンドリングの 5 つの主要フロー
- **アクセシビリティテスト**: `@axe-core/playwright` を使用して WCAG 2.1 Level AA を検証
- **レスポンシブ対応**: デスクトップ・タブレット・モバイルの 3 つのビューポートでテスト

## テストフラグ

`tests/e2e/test-flags.ts` で環境変数によるテストの ON/OFF 切り替えを管理しています。

### ENABLE_ERROR_SCENARIO_TESTS

GitHub API の 403/422 エラー、レート制限超過、ネットワークエラー等を再現するには MSW によるモック設定が必要です。デフォルトではこれらのテストはスキップされます。

**対象テスト**: `uc-005-001` 〜 `uc-005-006`、`uc-006-004`

```bash
# エラーシナリオテストを有効化して実行
ENABLE_ERROR_SCENARIO_TESTS=true pnpm test:e2e
```

### キーボード/フォーカステストのデバイス制限

以下のテストはデスクトップ (`chromium-desktop`) でのみ実行されます。モバイル・タブレットにはハードウェアキーボードがないため、これらのデバイスでは自動スキップされます。

**対象テスト**: `uc-006-001`、`uc-006-002`、`uc-006-009`

```bash
# デスクトップのみで実行
pnpm exec playwright test --project=chromium-desktop
```

## テストファイル構成

```
tests/e2e/
├── README.md                    # このファイル
├── fixtures.ts                  # テストフィクスチャ（axe-core 統合）
├── uc-001-search.spec.ts        # リポジトリ検索
├── uc-002-results.spec.ts       # 検索結果一覧
├── uc-003-detail.spec.ts        # リポジトリ詳細
├── uc-004-pagination.spec.ts    # ページネーション
└── uc-005-error.spec.ts         # エラーハンドリング
```

## 実行方法

### 前提条件

```bash
# Playwright ブラウザのインストール（初回のみ）
pnpm exec playwright install chromium
```

### テスト実行

```bash
# すべてのE2Eテストを実行
pnpm run test:e2e

# UI モードで実行（インタラクティブ）
pnpm run test:e2e:ui

# ヘッドモードで実行（ブラウザを表示）
pnpm run test:e2e:headed

# デバッグモードで実行
pnpm run test:e2e:debug

# 特定のテストファイルのみ実行
pnpm exec playwright test uc-001-search.spec.ts

# 特定のプロジェクト（デバイス）のみ実行
pnpm exec playwright test --project=chromium-mobile

# レポートを表示
pnpm run test:e2e:report
```

### CI での実行

CI 環境では、以下のコマンドで実行されます：

```bash
pnpm run build
pnpm run test:e2e
```

## テストの書き方

### 基本構造

```typescript
/**
 * @file E2E テスト: 機能名
 * @see req-XXX-YYY
 * @see uc-XXX-YYY
 */
import { test, expect } from "./fixtures"

test.describe("Feature: 機能名 (req-XXX-YYY)", () => {
  test("uc-XXX-YYY: シナリオ名", async ({ page, makeAxeBuilder }) => {
    // Arrange: 前提条件の設定
    await page.goto("/")

    // Act: ユーザー操作
    await page.getByRole("button", { name: /検索/i }).click()

    // Assert: 期待される結果の検証
    await expect(page).toHaveURL("/?q=test")

    // アクセシビリティテスト（主要なページのみ）
    const accessibilityScanResults = await makeAxeBuilder().analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })
})
```

### AAA 原則

テストは **Arrange → Act → Assert** の 3 フェーズで構成します：

- **Arrange**: テストの前提条件を設定（ページ遷移、モック設定等）
- **Act**: ユーザー操作を実行（クリック、入力等）
- **Assert**: 期待される結果を検証（URL、表示内容等）

### セレクタの優先順位

Playwright のベストプラクティスに従い、以下の優先順位でセレクタを使用します：

1. **Role セレクタ**: `page.getByRole("button", { name: /検索/i })`
2. **Label セレクタ**: `page.getByLabel("検索キーワード")`
3. **Text セレクタ**: `page.getByText("検索結果")`
4. **Test ID セレクタ**: `page.getByTestId("search-form")`（最終手段）

### アクセシビリティテスト

主要なページ（検索結果、詳細ページ等）では、`makeAxeBuilder()` を使用してアクセシビリティテストを実行します：

```typescript
const accessibilityScanResults = await makeAxeBuilder().analyze()
expect(accessibilityScanResults.violations).toEqual([])
```

## モック戦略

E2E テストでは、実際の GitHub API を叩かず、MSW（Mock Service Worker）を使用してモックします。これにより：

- **Rate Limit 回避**: GitHub API のレート制限に引っかからない
- **安定性向上**: ネットワーク状態に依存しない
- **高速化**: 実際の API 呼び出しより高速

### モック設定（TODO）

現在、E2E テスト用の MSW 設定は未実装です。以下の対応が必要です：

1. `tests/mocks/handlers.ts` を E2E テストでも使用できるように拡張
2. Playwright の `page.route()` または MSW の Service Worker を使用してモックを設定
3. 各テストシナリオに応じたモックデータを準備

## トラブルシューティング

### テストが失敗する場合

1. **スクリーンショットを確認**: `test-results/` ディレクトリに失敗時のスクリーンショットが保存されます
2. **トレースを確認**: `playwright show-trace trace.zip` でトレースを表示
3. **UI モードで実行**: `pnpm run test:e2e:ui` でインタラクティブにデバッグ

### タイムアウトエラー

デフォルトのタイムアウトは 30 秒です。遅い環境では、`playwright.config.ts` で調整できます：

```typescript
export default defineConfig({
  timeout: 60 * 1000, // 60秒
})
```

### CI での失敗

CI 環境では、以下の設定が有効です：

- **再試行**: 2 回まで自動再試行
- **並列実行**: 1 ワーカーのみ（安定性優先）
- **トレース**: 失敗時のみ保存

## 参考資料

- [Playwright 公式ドキュメント](https://playwright.dev/)
- [axe-core Playwright 統合](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
