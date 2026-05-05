# req-008-security: セキュリティ（非機能要件）

## 概要

API トークン管理、HTTP セキュリティヘッダー、サーバー専用モジュール隔離に関するセキュリティ要件。
AGENTS.md § 2.5「Security First」および § 8 に準拠する。

---

## 要件一覧

### 常時型 (Ubiquitous)

- **req-008-001**: システムは、すべての HTTP レスポンスに Content-Security-Policy ヘッダーを付与しなければならない（script-src / style-src / img-src / connect-src / object-src / frame-src / form-action を制限）
- **req-008-002**: システムは、すべての HTTP レスポンスに X-Frame-Options: DENY ヘッダーを付与しなければならない
- **req-008-003**: システムは、すべての HTTP レスポンスに X-Content-Type-Options: nosniff ヘッダーを付与しなければならない
- **req-008-004**: システムは、すべての HTTP レスポンスに Referrer-Policy: strict-origin-when-cross-origin ヘッダーを付与しなければならない
- **req-008-005**: システムは、すべての HTTP レスポンスに Strict-Transport-Security ヘッダー（max-age=31536000）を付与しなければならない
- **req-008-006**: システムは、すべての HTTP レスポンスに Permissions-Policy ヘッダー（camera・microphone・geolocation を無効化）を付与しなければならない
- **req-008-007**: システムは、GitHub API クライアントに `import 'server-only'` を付与し、クライアントバンドルへの混入を防がなければならない

### 望ましくない動作型 (Unwanted Behavior) — IF

- **req-008-008**: iframe に埋め込まれようとするなら、システムは `frame-ancestors 'none'` によりそれを拒否しなければならない
- **req-008-009**: `NEXT_PUBLIC_` 接頭辞で GitHub Token を定義しようとするなら、システムはビルドエラーまたはコードレビューで差し戻さなければならない
