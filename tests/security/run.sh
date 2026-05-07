#!/usr/bin/env sh
# @file ZAP セキュリティスキャン エントリポイント
# @remarks
#   docker compose run --rm で ZAP コンテナを起動し、スキャン結果に基づいて
#   適切な終了コードを返す。
#   終了コードの意味:
#     0: アラートなし（クリーン）または Medium/Low アラートのみ（非ブロッキング）
#     2: High アラートあり（ブロッキング）
# @see req-008-001, req-008-002, req-008-003, req-008-004, req-008-005, req-008-006

set -eu

# スクリプトのディレクトリを基準にパスを解決（呼び出し元の cwd に依存しない）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPORTS_DIR="$SCRIPT_DIR/reports"

# 初回実行時にレポートディレクトリがない場合は作成する
mkdir -p "$REPORTS_DIR"

echo "=== OWASP ZAP セキュリティスキャン開始 ==="
echo "スキャン対象: https://github-repository-search-cyan.vercel.app/"
echo "レポート出力先: $REPORTS_DIR"
echo ""

# docker compose run --rm: 実行完了後にコンテナを自動削除する
ZAP_EXIT_CODE=0
docker compose \
  -f "$SCRIPT_DIR/docker-compose.yml" \
  run --rm zap \
  || ZAP_EXIT_CODE=$?

echo ""
echo "=== スキャン完了 (ZAP 終了コード: $ZAP_EXIT_CODE) ==="

case "$ZAP_EXIT_CODE" in
  0)
    # クリーン: アラートなし
    echo "結果: クリーン - セキュリティアラートは検出されませんでした"
    echo "レポート: $REPORTS_DIR/zap-report.html"
    exit 0
    ;;
  1)
    # Medium/Low アラートあり（非ブロッキング）
    # CI でブロックしたい場合は exit 1 に変更する
    echo "警告: Medium または Low セキュリティアラートが検出されました"
    echo "レポートを確認してください: $REPORTS_DIR/zap-report.html"
    exit 0
    ;;
  2)
    # High アラートあり（ブロッキング）
    echo "エラー: High セキュリティアラートが検出されました"
    echo "レポートを確認してください: $REPORTS_DIR/zap-report.html"
    exit 2
    ;;
  *)
    # Docker 起動失敗など予期しないエラー
    echo "エラー: 予期しない終了コード ($ZAP_EXIT_CODE)"
    echo "Docker が起動しているか確認してください"
    exit "$ZAP_EXIT_CODE"
    ;;
esac
