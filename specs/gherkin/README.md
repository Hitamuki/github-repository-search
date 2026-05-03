# Gherkin シナリオ

Given-When-Then 形式で受け入れ基準を記述したシナリオ群。Playwright E2E テストと 1対1 対応する。

## 記述形式

```gherkin
Feature: {機能名} ({req-ID})
  Scenario: {uc-ID} {シナリオ名}
    Given {前提条件}
    When  {操作}
    Then  {期待結果}
```

## ID 体系

`uc-{nnn}-{domain}` 形式。各ファイル内の個別シナリオは `uc-{nnn}-{seq}` で識別する。

例: `uc-001-003`（検索機能の3番目のシナリオ）

## E2E テストとの対応

各シナリオは `tests/e2e/` の Playwright テストと 1対1 対応させる。
