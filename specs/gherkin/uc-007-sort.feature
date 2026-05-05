# uc-007-sort: 検索結果のソート
# ref: req-007-sort

Feature: 検索結果のソート (req-007-sort)
  検索結果を関連度・Star数・Fork数・更新日で並び替える

  Background:
    Given GitHub Search API のモックが設定されている
    And ユーザーが "/?q=react" にアクセスし検索結果が表示されている

  # -------------------------
  # 正常系
  # -------------------------

  Scenario: uc-007-001 デフォルトのソートは「関連度」である
    Then ソートセレクタに「関連度」が選択されている
    And URL の sort パラメータは存在しない

  Scenario: uc-007-002 Star数でソートできる
    When ユーザーがソートセレクタで「Star数」を選択する
    Then URL が "/?q=react&sort=stars" に変わる
    And Star数降順の検索結果が表示される

  Scenario: uc-007-003 Fork数でソートできる
    When ユーザーがソートセレクタで「Fork数」を選択する
    Then URL が "/?q=react&sort=forks" に変わる

  Scenario: uc-007-004 更新日でソートできる
    When ユーザーがソートセレクタで「更新日」を選択する
    Then URL が "/?q=react&sort=updated" に変わる

  Scenario: uc-007-005 ソート変更時に page が 1 にリセットされる
    Given ユーザーが "/?q=react&page=3" にいる
    When ユーザーがソートセレクタで「Star数」を選択する
    Then URL に page パラメータが含まれない

  Scenario: uc-007-006 URL の sort パラメータで初期ソートが反映される
    When ユーザーが "/?q=react&sort=stars" に直接アクセスする
    Then ソートセレクタに「Star数」が選択された状態で表示される
    And Star数降順の検索結果が表示される

  # -------------------------
  # 異常系
  # -------------------------

  Scenario: uc-007-007 sort パラメータが不正な値のとき「関連度」にフォールバックする
    When ユーザーが "/?q=react&sort=invalid" に直接アクセスする
    Then ソートセレクタに「関連度」が選択されている
    And 関連度順の検索結果が表示される
