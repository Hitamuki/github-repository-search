/**
 * @file Playwright テストフィクスチャ
 * @remarks
 * アクセシビリティテスト（axe-core）を全テストで自動実行するための共通フィクスチャ。
 */
import AxeBuilder from "@axe-core/playwright"
import { test as base } from "@playwright/test"

/**
 * 拡張テストフィクスチャ
 * @remarks
 * axe-core を使ったアクセシビリティテストを簡単に実行できるようにする。
 */
export const test = base.extend<{
  /**
   * アクセシビリティテストを実行する
   * @example
   * await makeAxeBuilder(page)
   *   .analyze()
   *   .then((results) => {
   *     expect(results.violations).toEqual([])
   *   })
   */
  makeAxeBuilder: () => AxeBuilder
}>({
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () =>
      new AxeBuilder({ page })
        // WCAG 2.1 Level AA を基準とする（req-006-a11y-responsive）
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(makeAxeBuilder)
  },
})

export { expect } from "@playwright/test"
