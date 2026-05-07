# セキュリティスキャンレポート

## 概要

| 項目 | 内容 |
|---|---|
| スキャンツール | OWASP ZAP (Automation Framework) |
| スキャン対象 | https://github-repository-search-cyan.vercel.app/ |
| スキャン種別 | フルスキャン（Spider + AJAX Spider + Passive Scan + Active Scan） |
| 実施日 | 2026-05-07 |
| アラート総数 | 9件（Medium 3件 / Low 2件 / Informational 4件） |

---

## アラート一覧

| # | リスク | アラート名 | CWE | 検出数 | 対応状況 |
|---|---|---|---|---|---|
| 1 | Medium | CSP: `script-src` に `unsafe-inline` | CWE-693 | 1,045 | 保留（Next.js の制約） |
| 2 | Medium | CSP: `style-src` に `unsafe-inline` | CWE-693 | 1,045 | 保留（Tailwind CSS の制約） |
| 3 | Medium | Cross-Domain Misconfiguration (CORS) | CWE-264 | 697 | 対応不要（Vercel CDN の仕様） |
| 4 | Low | `X-Powered-By` ヘッダーによる情報漏洩 | CWE-497 | 351 | **対応済み** |
| 5 | Low | ZAP バージョンが古い | CWE-1104 | 1 | 対応不要（ツール側の問題） |
| 6 | Informational | 疑わしいコメントによる情報開示 | CWE-615 | 57 | 対応不要（誤検知） |
| 7 | Informational | キャッシュからのレスポンス取得 | CWE-525 | 1,048 | 対応不要（Vercel CDN の正常動作） |
| 8 | Informational | User-Agent フジング | — | 1 | 対応不要（差異なし） |
| 9 | Informational | ユーザー操作可能な HTML 属性（XSS 候補） | CWE-20 | 159 | 対応不要（React による自動エスケープ） |

---

## 各アラートの詳細

### 1. CSP: `script-src` に `unsafe-inline` ［Medium / 保留］

**リスク:** Content Security Policy に `'unsafe-inline'` が含まれており、インライン JavaScript の実行を許可しています。XSS 攻撃が成功した場合の被害拡大につながります。

**検出証拠:**
```
Content-Security-Policy: ...; script-src 'self' 'unsafe-inline'; ...
```

**なぜ保留か:** Next.js 16 の App Router は、React Server Components のハイドレーションおよびチャンクローダーにインラインスクリプトを使用します。`'unsafe-inline'` を除去するには、サーバーサイドで動的に `nonce` を生成し、`next.config.mjs` の CSP に `'nonce-{値}'` を設定する必要があります。実装コストが高く、Next.js のバージョンアップに追従し続ける必要があるため、現時点では保留としています。

**将来的な対策:** Next.js の nonce ベース CSP を実装する。

---

### 2. CSP: `style-src` に `unsafe-inline` ［Medium / 保留］

**リスク:** インライン CSS の実行を許可しており、CSS インジェクション攻撃のリスクがあります。

**検出証拠:**
```
Content-Security-Policy: ...; style-src 'self' 'unsafe-inline'; ...
```

**なぜ保留か:** Tailwind CSS v4 はビルド時にスタイルを生成しますが、Next.js の ShadCN/UI コンポーネントや `next-themes` がインラインスタイルを使用するため、`'unsafe-inline'` が必要です。`style-src` の nonce 対応は `script-src` と比較してもさらに複雑であるため、現時点では保留としています。

**将来的な対策:** CSS-in-JS をやめてクラスベースのスタイリングに統一し、`'unsafe-inline'` を除去する。

---

### 3. Cross-Domain Misconfiguration（CORS 過剰許可）［Medium / 対応不要］

**リスク:** `_next/static/` 配下の静的アセットに `Access-Control-Allow-Origin: *` が設定されており、任意のドメインからのデータ読み込みが可能です。

**検出証拠:**
```
URL: /_next/static/chunks/xxx.js
Access-Control-Allow-Origin: *
```

**なぜ対応不要か:** これは Vercel CDN が静的アセット配信に自動付与するヘッダーです。対象は JS/CSS ファイルのみで、個人情報・認証情報・API レスポンスは含まれません。このアプリは GET のみの読み取り専用であり、認証セッションも存在しないため、CORS ワイルドカードによる実被害はありません。Vercel プロジェクトの設定でも変更できません。

---

### 4. `X-Powered-By` ヘッダーによるフレームワーク情報漏洩 ［Low / **対応済み**］

**リスク:** `X-Powered-By: Next.js` レスポンスヘッダーにより、使用フレームワークが攻撃者に判明します。Next.js 固有の既知脆弱性を狙った攻撃の足がかりになります。

**検出証拠:**
```
X-Powered-By: Next.js
```

**対応内容:** `next.config.mjs` に `poweredByHeader: false` を追加し、ヘッダーを無効化しました。

```js
// next.config.mjs
const nextConfig = {
  poweredByHeader: false, // X-Powered-By ヘッダーを削除
  ...
}
```

---

### 5. ZAP バージョンが古い ［Low / 対応不要］

**リスク:** スキャンに使用した ZAP のバージョンが古く、最新の脆弱性ルールが適用されていない可能性があります。

**なぜ対応不要か:** アプリケーション自体の脆弱性ではなく、スキャンツールのバージョン問題です。Docker イメージ `ghcr.io/zaproxy/zaproxy:stable` を定期的に `docker pull` することで最新版を維持できます。

---

### 6. 疑わしいコメントによる情報開示 ［Informational / 対応不要（誤検知）］

**リスク:** レスポンスに `user`、`db`、`from` 等の文字列が含まれており、内部構造を示すコメントの可能性があるとして検出されました。

**検出証拠:**
```
URL: /?page=1&q=ZAP&sort=best+match
証拠: user / db / from
```

**なぜ対応不要か:** これらはミニファイされた JavaScript バンドル（`_next/static/chunks/`）内の変数名・プロパティ名です。ソースコードにデバッグコメントや機密情報は含まれていません。ZAP がミニファイ済みコードに含まれる一般的な英単語を誤検知したものです。

---

### 7. キャッシュからのレスポンス取得 ［Informational / 対応不要］

**リスク:** Vercel CDN の共有キャッシュからレスポンスが返されており、ユーザー固有の機密情報がキャッシュに載る可能性があるとして検出されました。

**検出証拠:**
```
Age: 0
```

**なぜ対応不要か:** このアプリは GitHub Search API の公開情報を表示するのみで、ユーザー認証・個人情報・セッション情報を一切持ちません。Vercel の ISR（Incremental Static Regeneration）によるキャッシュは設計上の意図した動作です。

---

### 8. User-Agent フジング ［Informational / 対応不要］

**リスク:** 異なる User-Agent でリクエストした場合にレスポンスの内容が変わるかをチェックするテストです。

**なぜ対応不要か:** 検査の結果、User-Agent によるレスポンスの差異は検出されませんでした。アプリは User-Agent に基づく処理分岐を持っていません。

---

### 9. ユーザー操作可能な HTML 属性（Potential XSS）［Informational / 対応不要］

**リスク:** URL クエリパラメータ `?q=` の値が HTML 属性に反映されており、XSS の可能性があるとして検出されました。

**検出証拠:**
```
URL: /?page=1&q=ZAP&sort=best+match
```

**なぜ対応不要か:** React は JSX でレンダリングする全ての値を自動的に HTML エスケープします。`dangerouslySetInnerHTML` は使用していません（AGENTS.md §11 で禁止）。また、`?q=` の値は Zod スキーマで検証済みです。ZAP が静的解析ベースで検出しているもので、実際に XSS が成立するコードパスは存在しません。

---

## 対応状況サマリー

| 対応状況 | 件数 | 内容 |
|---|---|---|
| 対応済み | 1件 | `X-Powered-By` ヘッダー削除 |
| 保留（将来対応） | 2件 | CSP `unsafe-inline`（nonce 化が必要） |
| 対応不要 | 6件 | Vercel の仕様・誤検知・ツール側の問題 |

## 残存リスクの受け入れ判断

CSP の `unsafe-inline` については、以下の多層防御が機能しているため現時点での残存リスクを受け入れます。

- `default-src 'self'` により外部リソースの読み込みをブロック
- `connect-src 'self'` により外部への通信を禁止
- `frame-ancestors 'none'` / `X-Frame-Options: DENY` でクリックジャッキングを防止
- React の自動エスケープにより DOM ベース XSS を防止
- Zod による入力バリデーションで不正な値の混入を防止
- `server-only` によりトークン・機密情報がクライアントに漏洩しない設計

これらの多層防御により、仮に XSS ペイロードが挿入されても `unsafe-inline` による被害拡大は限定的です。

---

## 総括

OWASP ZAP フルスキャン（Active Scan を含む最も厳格なスキャン）の結果、**High リスクのアラートは 0 件**でした。検出された 9 件のうち、実際にアプリケーションの設計変更が必要なアラートは存在しません。

### セキュリティが問題ない根拠

**アーキテクチャによる構造的な安全性**

このアプリは GitHub Search API の公開情報を表示する読み取り専用のアプリケーションです。ユーザー認証・セッション管理・個人情報の保存を一切持たないため、攻撃者が得られる最大の成果は「公開リポジトリの検索結果を見ること」に限られます。これは未認証でも GitHub.com 上で誰でも行える操作です。

**多層防御の実装**

| 防御層 | 実装内容 |
|---|---|
| 入力検証 | Zod スキーマによる全入力値の型・範囲検証 |
| サーバー隔離 | `import 'server-only'` により GitHub Token がクライアントに漏洩しない |
| セキュリティヘッダー | CSP・HSTS・X-Frame-Options・X-Content-Type-Options・Referrer-Policy・Permissions-Policy |
| XSS 対策 | React の自動エスケープ・`dangerouslySetInnerHTML` 不使用 |
| フレームワーク情報秘匿 | `poweredByHeader: false` による `X-Powered-By` 削除（本スキャン後に対応済み） |
| 依存関係管理 | `pnpm audit` + Dependabot による継続的な脆弱性監視 |
| 静的解析 | ESLint `eslint-plugin-security` による開発時のセキュリティチェック |

**検出アラートの性質**

| 分類 | 件数 | 理由 |
|---|---|---|
| 対応済み | 1件 | `X-Powered-By` ヘッダー（本スキャンを受けて修正） |
| 技術的制約による保留 | 2件 | Next.js/Tailwind CSS が必要とする CSP `unsafe-inline`（他の防御層でリスクを低減） |
| プラットフォーム仕様 | 1件 | Vercel CDN の静的アセットへの `Access-Control-Allow-Origin: *`（機密情報なし） |
| ツール側の問題 | 1件 | ZAP バージョン警告（アプリの脆弱性ではない） |
| 誤検知 | 4件 | React の自動エスケープ・Vercel CDN の正常動作・ミニファイ済みコードの変数名 |

**結論として、このアプリケーションは現時点でプロダクション運用に支障のないセキュリティ水準を満たしています。** 残存する CSP `unsafe-inline` は Next.js の nonce ベース CSP 移行によって将来的に解消できますが、現在の多層防御により実被害のリスクは十分に低減されています。
