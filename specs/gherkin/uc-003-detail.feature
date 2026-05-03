# uc-003-detail: リポジトリ詳細
# ref: req-003-detail

Feature: リポジトリ詳細 (req-003-detail)
  選択したリポジトリの詳細情報を表示する

  Background:
    Given GitHub API のモックが設定されている

  # -------------------------
  # 正常系
  # -------------------------

  Scenario: uc-003-001 リポジトリ詳細情報が表示される
    Given ユーザーが "/repos/vercel/next.js" にアクセスする
    Then リポジトリ名 "next.js" が表示される
    And オーナー名 "vercel" が表示される
    And 説明文が表示される
    And スター数が表示される
    And フォーク数が表示される
    And オープンイシュー数が表示される
    And プログラミング言語が表示される
    And ライセンスが表示される
    And 最終更新日が表示される
    And "GitHubで見る" リンクが表示される

  Scenario: uc-003-002 「GitHubで見る」リンクが新しいタブで開く
    Given ユーザーが "/repos/vercel/next.js" にアクセスしている
    When ユーザーが "GitHubで見る" リンクをクリックする
    Then GitHub のリポジトリページが新しいタブで開く
    And リンクに rel="noopener noreferrer" が付与されている

  Scenario: uc-003-003 検索結果一覧へ戻るリンクが機能する
    Given ユーザーが "/?q=next.js" から "/repos/vercel/next.js" へ遷移した
    When ユーザーが "戻る" リンクをクリックする
    Then "/?q=next.js" へ遷移する

  # -------------------------
  # ローディング
  # -------------------------

  Scenario: uc-003-004 詳細取得中にスケルトン UI が表示される
    Given GitHub API レスポンスが遅延している
    When ユーザーが "/repos/vercel/next.js" にアクセスする
    Then スケルトン UI が表示される
    And レスポンス受信後に詳細情報が表示される

  # -------------------------
  # オプション項目の表示
  # -------------------------

  Scenario: uc-003-005 説明文がないリポジトリで「説明なし」と表示される
    Given GitHub API が説明文 null のリポジトリを返す
    When ユーザーが "/repos/owner/repo-no-desc" にアクセスする
    Then "説明なし" と表示される

  Scenario: uc-003-006 ライセンスがないリポジトリで「ライセンスなし」と表示される
    Given GitHub API がライセンス null のリポジトリを返す
    When ユーザーが "/repos/owner/repo-no-license" にアクセスする
    Then "ライセンスなし" と表示される

  # -------------------------
  # 異常系
  # -------------------------

  Scenario: uc-003-007 存在しないリポジトリで 404 ページが表示される
    Given GitHub API が 404 レスポンスを返す
    When ユーザーが "/repos/owner/nonexistent-repo" にアクセスする
    Then 404 エラーページが表示される
