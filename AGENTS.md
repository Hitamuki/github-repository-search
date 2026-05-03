# AGENTS.md

> プロジェクトの仕様・方針・制約を一元管理するドキュメント。
> AI エージェントおよび開発者は、コード生成・修正の前に必ず本ファイルを参照すること。

---

## 1. プロジェクト概要

コーディングテスト課題。
GitHub Search API でリポジトリ検索・詳細表示を行う Web アプリ。モバイル・タブレット・PC のレスポンシブ対応、UI は日本語。**プロダクションを想定した実装**を最優先とする。

---

## 2. コア原則

### 2.1 Specs First（仕様駆動開発）

`specs/` で振る舞いを先に定義する。**仕様未定義の設計、設計未定義の実装を禁止する**。

### 2.2 Single Source of Truth

機能仕様 → `specs/` (EARS + Gherkin) / 意思決定 → `docs/adr/` / アプリケーション状態 → URL（`searchParams` 中心） / 型 → Zod スキーマからの推論。

### 2.3 URL 駆動の真 SSR

検索状態は URL に乗せ、検索結果は async Server Component で SSR する。クライアント側のグローバルストアは持たない。

### 2.4 Server First

Server Component をデフォルト、`"use client"` は必要箇所に最小限付与する。

### 2.5 Security First

セキュリティは後付けしない。API トークン隔離、入力検証、セキュリティヘッダーは Day 1 から組み込む。

### 2.6 Traceability

すべての設計・実装・テストは Spec ID と相互参照可能にする。

- 要件: `req-{nnn}-{domain}`（例: `req-001-search`）
- Gherkin: `uc-{nnn}-{domain}`（例: `uc-001-search-success`）
- ADR: `adr-{nnnn}-{title}`（例: `adr-0001-rendering-strategy`）

### 2.7 言語規約

ドキュメント・コミットメッセージ・UI・JSDoc は **日本語**。
変数・関数・型名は **英語**。

---

## 3. 技術スタック

| 用途                 | 採用                                                              |
| -------------------- | ----------------------------------------------------------------- |
| ランタイム           | Node.js v22 (LTS)                                                 |
| パッケージマネージャ | pnpm                                                              |
| フレームワーク       | Next.js v16+ (App Router)                                         |
| 言語                 | TypeScript v5.x                                                   |
| UI                   | shadcn/ui + Tailwind CSS                                          |
| バリデーション       | Zod                                                               |
| HTTP                 | fetch (native)                                                    |
| ロガー               | pino                                                              |
| Unit / Integration   | Vitest + Testing Library                                          |
| E2E                  | Playwright                                                        |
| API モック           | MSW                                                               |
| 静的解析             | ESLint (`eslint-config-next` + `@typescript-eslint` + `jsx-a11y`) |
| フォーマット         | Prettier (`eslint-config-prettier` で競合回避)                    |
| 型検査               | `tsc --noEmit`                                                    |

### アーキテクチャ：FSD

`app` / `features` / `entities` / `shared` の4層。**上位→下位の一方向依存のみ**。同レイヤー間のクロスインポートは禁止。

### ディレクトリ構成

> shadcn/ui スキャフォールド段階。FSD 層は機能実装に合わせて順次導入する。

```txt
.
├── app/                        # Next.js App Router（ルーティング・レイアウト）
├── components/                 # shadcn/ui コンポーネント置き場
├── hooks/                      # React カスタムフック
├── lib/                        # 汎用ユーティリティ
├── public/                     # 静的ファイル（robots.txt 等）
├── tests/
│   ├── e2e/                    # Playwright E2E テスト（*.spec.ts）
│   └── integration/            # Vitest Integration テスト（*.test.tsx）
├── docs/
│   └── adr/                    # 意思決定
├── specs/
│   ├── ears/                   # EARS 要件定義（*.md）
│   └── gherkin/                # Gherkin シナリオ（*.feature）
└── assets/
    ├── generated/              # AI生成物
    └── images/                 # 静的画像
```

---

## 4. レンダリング戦略

検索ページのシェルは Server Component（静的）、検索フォームは Client Component。**検索結果一覧と詳細は async Server Component で真の SSR**。

- 検索状態（`q`, `page`）は **必ず URL に乗せる**
- フォーム入力は `useState` でローカル管理、submit 時のみ `router.push`

### 実装時の注意点

- `searchParams` は Promise (Next.js 15+)、`await searchParams` を徹底
- Suspense は `<Suspense key={`${q}-${page}`}>` でキーを変える
- ボタンの loading 状態は `useTransition` の `isPending`

---

## 5. 仕様駆動開発（EARS + Gherkin）

### EARS（要件）：5パターン

- **ユビキタス**: システムは {動作} なければならない
- **イベント駆動**: {トリガー} のとき、システムは {動作} なければならない
- **状態駆動**: {状態} の間、システムは {動作} なければならない
- **オプション**: {条件} の場合、システムは {動作} なければならない
- **不要**: システムは {禁止事項} してはならない

### Gherkin（受け入れ基準）

Given-When-Then で記述し、**E2E テストと 1対1 対応** させる。

```gherkin
Feature: リポジトリ検索 (req-001-search)
  Scenario: uc-001-search-success キーワード検索
    Given ユーザーがトップページにいる
    When "next.js" と入力し検索ボタンを押下する
    Then URL が "/?q=next.js" に変わる
    And リポジトリの一覧が表示される
```

---

## 6. コード規約

### 6.1 JSDoc コメント（必須）

**すべての `.ts` / `.tsx`** に JSDoc を記述する。

```typescript
/**
 * @file GitHub API クライアント
 * @see docs/adr/0003-libraries.md
 */

/**
 * リポジトリを検索する
 * @param params.query - 検索キーワード（1〜256文字）
 * @param params.page - ページ番号（1始まり）
 * @returns 検索結果（リポジトリ配列 + 総件数）
 * @throws {GitHubApiError} GitHub API エラー時
 * @throws {RateLimitError} レート制限到達時
 */
```

型は Zod から推論し（`z.infer<typeof Schema>`）、`@remarks` でドメイン上の意味を記述する。

### 6.2 命名

- React コンポーネント: `PascalCase.tsx`
- ロジック・型定義: `kebab-case.ts`
- Unit / Integration: `*.test.ts(x)` / E2E: `*.spec.ts`
- ディレクトリ: `kebab-case`

### 6.3 import 順序

外部ライブラリ → エイリアス（`@/`）→ 相対パス → 型のみ。ESLint `import/order` で自動整列。

### 6.4 Server / Client 境界

- Server Component がデフォルト
- Client Component は **葉っぱの近くに最小粒度** で配置
- サーバー専用モジュールには `import 'server-only'` を付与

### 6.5 型安全性

- `any` 禁止（やむを得ない場合は eslint-disable + 理由）
- 外部 API レスポンスは **Zod で検証** してから内部で使う

---

## 7. テスト戦略（Testing Trophy）

### 7.1 思想

Kent C. Dodds の Testing Trophy を採用。**Integration テストを最厚にする**。

```txt
E2E（少：主要ユーザーフロー）
Integration（厚：コンポーネント+依存の結合）
Unit（中：純粋関数・スキーマのみ）
Static（広：ESLint + TypeScript）
```

### 7.2 各層の方針

| 層          | ツール                         | 対象                               | 比重         |
| ----------- | ------------------------------ | ---------------------------------- | ------------ |
| Static      | ESLint + TS + Prettier         | 型・構文・規約違反                 | 全コード     |
| Unit        | Vitest                         | 純粋関数、Zod スキーマ、URL パース | **最小限**   |
| Integration | Vitest + Testing Library + MSW | コンポーネント+依存の結合          | **最厚**     |
| E2E         | Playwright                     | Gherkin シナリオに 1対1 対応       | 主要 3〜5 本 |

### 7.3 なぜ Integration が最厚か

ユーザー視点の振る舞い（フォーム送信→URL変更→SSR結果表示）を最も忠実に検証できる。Server Component 中心の構成では Unit Test の対象が少なく、E2E は遅くて壊れやすい。

### 7.4 命名・モック

- 仕様 ID で命名: `test("uc-001-search-success: ...", ...)`
- Integration / E2E は **MSW で実 API を叩かない**（Rate Limit + flaky 防止）
- アクセシビリティテストは `@axe-core/playwright` を E2E に組み込む

### 7.5 単体テスト規約

- **co-location**: テストファイルはテスト対象のソースファイルと同じディレクトリに配置する
- **AAA 原則**: テストは Arrange（準備）→ Act（実行）→ Assert（検証）の3フェーズで構成する
- **メソッド名**: `メソッド名_テスト条件_期待する振る舞い` 形式で命名する（例: `searchRepositories_emptyQuery_throwsValidationError`）

---

## 8. セキュリティ

- `GITHUB_TOKEN` は環境変数、Server 側でのみ使用。`NEXT_PUBLIC_` 接頭辞禁止
- API クライアントには `import 'server-only'` を付与
- 検索クエリ・`searchParams` は Zod でバリデーション、URL は `encodeURIComponent`
- `next.config.ts` で CSP / X-Frame-Options / Referrer-Policy / X-Content-Type-Options / HSTS を設定
- 多層防御：入力（Zod）→ サーバー（`server-only`）→ ヘッダー → 依存（`pnpm audit` + Dependabot）
- やらないこと：OAuth、CSRF 対策（GET のみのため不要）

---

## 9. 開発フロー

### ブランチ戦略（GitHub Flow）

`main` は常にデプロイ可能。トピックブランチ命名: `feature/issue-id`、`fix/issue-id`、`docs/issue-id`。

### コミットメッセージ（Conventional Commits）

`<type>(<scope>): <subject> #<issue>`、type は `feat` / `fix` / `docs` / `style` / `refactor` / `perf` / `test` / `chore`。subject は日本語可。issueはGitHub Projectのイシュー番号。

例: `feat(search): URL クエリ駆動の検索実装 (req-001-search)`

## 10. 完了の定義（DoD）

### 機能の完了

- [ ] EARS 要件と Gherkin シナリオが存在する
- [ ] Integration / E2E Test が書かれ、パスしている
- [ ] JSDoc がすべての関数・型・コンポーネントに付与されている
- [ ] ESLint / Prettier / TypeScript の警告・エラーがない
- [ ] アクセシビリティ要件を満たしている（axe で検証）
- [ ] 関連する ADR が存在する（必要な場合）

### プロジェクトの完了

- [ ] CI がグリーン
- [ ] Vercel にデプロイされ本番動作確認済み
- [ ] README に Trade-offs セクションがある
- [ ] AI プロンプト記録が残っている

---

## 11. アンチパターン

| アンチパターン                          | なぜダメか                         |
| --------------------------------------- | ---------------------------------- |
| 仕様を更新せずにコードを変更する        | Single Source of Truth が崩れる    |
| ID が紐付かない実装                     | トレーサビリティが断絶する         |
| API トークンをクライアント側で扱う      | セキュリティ事故の原因             |
| `useState` でグローバル状態を管理       | URL 駆動の原則に反する             |
| `dangerouslySetInnerHTML` を使う        | XSS の温床                         |
| `any` 型を許容する                      | 型安全性が崩れる                   |
| AI 生成コードを未レビューでコミット     | 意図しない挙動が紛れ込む           |
| ADR を書かずにアーキテクチャ判断        | 「なぜ？」が後で誰にも答えられない |
| JSDoc なしの関数                        | 意図と契約が読み取れない           |
| `"use client"` を最上位に付ける         | バンドルサイズと SSR 効果を損なう  |
| Unit Test を Integration の代わりに使う | Testing Trophy 思想に反する        |

---

## 12. 哲学

> **やらないことを宣言せよ。**
> 「やったこと」より「やらなかったこと」の方が、設計の質を語る。
> **AI と協働し、AI に隷属するな。**
> AI は強力な道具だが、判断の主体は人間である。AI の出力をレビューしないコードは、自分のコードではない。
