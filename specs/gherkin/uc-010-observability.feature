# uc-010-observability: オブザーバビリティ
# ref: req-010-observability

Feature: オブザーバビリティ (req-010-observability)
  すべてのリクエストに requestId を付与し、サーバーサイドログで追跡できる

  # -------------------------
  # x-request-id ヘッダー付与
  # -------------------------

  Scenario: uc-010-001 トップページのレスポンスに x-request-id ヘッダーが付与される
    When ユーザーがトップページ "/" にアクセスする
    Then レスポンスヘッダーに "x-request-id" が存在する
    And "x-request-id" の値が UUID v4 形式（xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx）である

  Scenario: uc-010-002 検索ページのレスポンスに x-request-id ヘッダーが付与される
    When ユーザーが "/?q=react" にアクセスする
    Then レスポンスヘッダーに "x-request-id" が存在する
    And "x-request-id" の値が UUID v4 形式である

  Scenario: uc-010-003 詳細ページのレスポンスに x-request-id ヘッダーが付与される
    When ユーザーが "/repos/vercel/next.js" にアクセスする
    Then レスポンスヘッダーに "x-request-id" が存在する
    And "x-request-id" の値が UUID v4 形式である

  Scenario: uc-010-004 リクエストごとに x-request-id が一意になる
    When ユーザーが "/" に連続して 2 回アクセスする
    Then 1 回目と 2 回目の "x-request-id" の値が異なる
