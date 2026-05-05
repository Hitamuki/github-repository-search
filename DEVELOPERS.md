# 開発者ガイド

GitHub Search API を使ったリポジトリ検索アプリの開発者向けリファレンス。

---

## 技術スタック

| 用途                      | 採用                                                                    |
| ------------------------- | ----------------------------------------------------------------------- |
| ランタイム                | Node.js v22 (LTS)                                                       |
| パッケージマネージャ      | pnpm                                                                    |
| フレームワーク            | Next.js v16（App Router + Turbopack）                                   |
| 言語                      | TypeScript v5.x                                                         |
| UI コンポーネント         | shadcn/ui + Base UI                                                     |
| スタイリング              | Tailwind CSS v4                                                         |
| バリデーション            | Zod                                                                     |
| HTTP                      | fetch（native）                                                         |
| ロガー                    | pino / pino-pretty                                                      |
| フォーム                  | react-hook-form + @hookform/resolvers                                   |
| アイコン                  | lucide-react / react-icons                                              |
| ユーティリティ            | es-toolkit / radash                                                     |
| Unit / Integration テスト | Vitest + Testing Library                                                |
| E2E テスト                | Playwright                                                              |
| API モック                | MSW                                                                     |
| 静的解析                  | ESLint（eslint-config-next + @typescript-eslint + jsx-a11y + security） |
| フォーマット              | Prettier + prettier-plugin-tailwindcss                                  |
| 型検査                    | `tsc --noEmit`                                                          |

---

## アーキテクチャ

### Feature-Sliced Design（FSD）

5 層の一方向依存。**上位レイヤーは下位レイヤーを参照できるが、逆方向・同レイヤー間のクロスインポートは禁止。**

```txt
app → widgets → features → entities → shared
```

| 層          | 役割                                                                            |
| ----------- | ------------------------------------------------------------------------------- |
| `app/`      | Next.js App Router。ルーティング・レイアウト・ページ・Server Actions            |
| `widgets/`  | 複数の features / entities を組み合わせた表示単位（リスト＋ページネーション等） |
| `features/` | ユーザー操作・ユースケース（検索フォーム・ソートセレクタ等）                    |
| `entities/` | ドメインモデル・API クライアント・エンティティ UI                               |
| `shared/`   | 汎用ユーティリティ・UI 基盤（shadcn/ui コンポーネント、設定、型）               |

### レンダリング戦略

- **Server Component がデフォルト**。`"use client"` は必要箇所に最小限付与
- 検索結果一覧・リポジトリ詳細は async Server Component で **真の SSR**
- 検索状態（`q`, `page`）は **URL に乗せる**。クライアント側のグローバルストアは持たない
- フォーム入力は `useState` でローカル管理、submit 時のみ `router.push`

---

## ディレクトリ構成

```txt
.
├── app/                          # Next.js App Router
│   ├── layout.tsx                # ルートレイアウト
│   ├── page.tsx                  # トップページ（検索）
│   ├── actions.ts                # Server Actions（検索）
│   ├── error.tsx                 # エラーバウンダリ
│   ├── not-found.tsx             # 404 ページ
│   └── repos/[owner]/[repo]/     # リポジトリ詳細ページ
│       ├── page.tsx
│       ├── loading.tsx
│       ├── error.tsx
│       ├── not-found.tsx
│       └── actions.ts
├── widgets/                      # FSD: widgets 層
│   ├── repository-list/
│   │   └── ui/                   # リポジトリ一覧・ページネーション
│   └── site-header/
│       └── ui/                   # サイトヘッダー
├── features/                     # FSD: features 層
│   └── search-repositories/
│       ├── model/                # Zod スキーマ・型
│       └── ui/                   # 検索フォーム
├── entities/                     # FSD: entities 層
│   └── repository/
│       ├── api/                  # GitHub API クライアント（server-only）
│       ├── model/                # リポジトリ型定義
│       └── ui/                   # リポジトリカード等
├── shared/                       # FSD: shared 層
│   ├── config/                   # 定数・環境変数
│   ├── lib/                      # 汎用ユーティリティ・ロガー
│   ├── types/                    # 共有型定義
│   ├── styles/                   # グローバル CSS
│   └── ui/                       # shadcn/ui コンポーネント
├── tests/
│   ├── e2e/                      # Playwright E2E（*.spec.ts）
│   └── integration/              # Vitest Integration（*.test.tsx）
├── specs/
│   ├── ears/                     # EARS 要件定義（*.md）
│   └── gherkin/                  # Gherkin シナリオ（*.feature）
├── public/                       # 静的ファイル
├── assets/
│   ├── generated/                # AI 生成物
│   └── images/                   # 静的画像
├── proxy.ts                      # Middleware（x-request-id 付与）
├── next.config.mjs               # Next.js 設定（CSP・セキュリティヘッダー）
├── vitest.config.ts
├── vitest.setup.ts
├── tsconfig.json
└── eslint.config.mjs
```

---

## コマンド

### セットアップ

```bash
# パッケージのインストール
mise install

# 依存関係のインストール
pnpm install

# 環境変数を設定（.env.local を作成）
cp .env.example .env.local
# GITHUB_TOKEN=ghp_xxxxxxxxxxxx を記入
```

### 開発

```bash
# 開発サーバー起動（Turbopack）
pnpm dev

# 構造化ログを整形して表示
pnpm dev:log

# ビルド
pnpm build

# ビルド済みを本番モードで起動
pnpm start
```

### 静的解析・型検査・フォーマット

```bash
# ESLint（型チェック含む）
pnpm lint

# TypeScript 型検査
pnpm typecheck

# Prettier フォーマット適用
pnpm format
```

### テスト

```bash
# Unit / Integration テストを一括実行
pnpm test

# ウォッチモード（TDD 向け）
pnpm test:watch

# カバレッジレポート生成（coverage/ に HTML 出力）
pnpm test:coverage
```

---

## スマートフォンでの動作確認

開発サーバーをローカルネットワーク全体に公開することでスマートフォンから確認できます。

### 1. ネットワーク公開モードで起動

```bash
# セキュリティソフトのファイアウォールをOFFにする
# 全インターフェースにバインド（PC と同じ Wi-Fi であること）
pnpm dev:mobile
```

### 2. ローカル IP を確認

```bash
# macOS
ipconfig getifaddr en0

# または詳細表示
ifconfig | grep "inet " | grep -v 127.0.0.1
```

出力例: `192.168.1.10`

### 3. スマートフォンのブラウザで開く

PC と同じ Wi-Fi に接続した状態で、以下の URL にアクセス。

```txt
http://192.168.1.10:3000
```

> ポート番号は `pnpm dev` 起動時のコンソール出力で確認（デフォルト 3000）。

### 4. Chrome DevTools でリモートデバッグ（Android）

Android の場合、USB デバッグを有効にして Chrome の `chrome://inspect` からリモートデバッグが可能。

---

## 環境変数

| 変数名         | 必須 | 説明                                                                             |
| -------------- | ---- | -------------------------------------------------------------------------------- |
| `GITHUB_TOKEN` | 推奨 | GitHub Personal Access Token。未設定でも動作するが Rate Limit が低い（60 req/h） |

> `NEXT_PUBLIC_` 接頭辞は絶対に付けない（クライアントバンドルに露出するため）。

---

## 開発フロー

### ブランチ戦略（GitHub Flow）

`main` は常にデプロイ可能な状態を保つ。作業は必ずトピックブランチで行い、PR 経由でマージする。

| プレフィックス | 用途             | 例                          |
| -------------- | ---------------- | --------------------------- |
| `feature/`     | 新機能           | `feature/12-sort-selector`  |
| `fix/`         | バグ修正         | `fix/34-pagination-reset`   |
| `docs/`        | ドキュメントのみ | `docs/56-update-readme`     |
| `refactor/`    | リファクタリング | `refactor/78-extract-hooks` |

ブランチ名は `<プレフィックス>/<issue-id>-<概要>` の形式（概要はケバブケース・英語）。

### コミットメッセージ（Conventional Commits）

```txt
<type>(<scope>): <subject> #<issue>
```

- **type**: `feat` / `fix` / `docs` / `style` / `refactor` / `perf` / `test` / `chore`
- **scope**: 変更対象のモジュール（例: `docs`, `shared`）
- **subject**: 変更内容を簡潔に（日本語可）
- **issue**: GitHub Project のイシュー番号

```bash
# 例
feat(search): URL クエリ駆動の検索実装 #1
fix(pagination): ページリセットが発火しない問題を修正 #34
docs(agents): ブランチ戦略を DEVELOPERS.md に追記 #56
```

---

## コード規約

### JSDoc（必須）

すべての `.ts` / `.tsx` ファイルに JSDoc を記述する。

#### ファイルレベル

```typescript
/**
 * @file GitHub API クライアント
 * @see {@link https://github.com/[owner]/[repo]/discussions} ADR カテゴリ
 */
```

#### 関数・コンポーネントレベル

```typescript
/**
 * リポジトリを検索する
 * @param params.query - 検索キーワード（1〜256文字）
 * @param params.page - ページ番号（1始まり）
 * @returns 検索結果（リポジトリ配列 + 総件数）
 * @throws {GitHubApiError} GitHub API エラー時
 * @throws {RateLimitError} レート制限到達時
 */
export async function searchRepositories(params: SearchParams) { ... }
```

#### 型定義

型は Zod スキーマから `z.infer<typeof Schema>` で推論し、`@remarks` でドメイン上の意味を補足する。

```typescript
/**
 * リポジトリ検索結果
 * @remarks GitHub Search API の items 配列を正規化したもの
 */
export type Repository = z.infer<typeof RepositorySchema>;
```

#### チェックリスト

- [ ] ファイル先頭に `@file` タグ
- [ ] すべての公開関数・コンポーネントに概要 + `@param` / `@returns`
- [ ] エラーを throw する関数に `@throws`
- [ ] 型定義に `@remarks`（自明でない場合）

### 仕様 ID のトレーサビリティ

実装コードと `specs/` の EARS 要件・Gherkin シナリオを相互参照できるよう、以下の規則でコメントに ID を記載する。

#### 書き方の一覧

| 場所 | 書き方 | 目的 |
| --- | --- | --- |
| ファイル先頭 JSDoc | `@see req-XXX, uc-XXX` | そのファイルが実装する仕様の宣言 |
| 特定の実装行 | `// req-XXX — 理由` | 仕様上重要な1行を明示（検証ロジック・セキュリティ制約等） |
| テスト名 | `test("uc-XXX: ...")` | Gherkin シナリオと 1対1 対応 |

#### ファイル先頭 JSDoc に `@see` を付ける

```typescript
/**
 * @file GitHub API クライアント
 * @see req-001-006, req-001-015, req-008-007, req-009-001
 * @see uc-001-001, uc-005-001, uc-005-003
 */
import "server-only"
```

#### 特定の実装行にインライン ID を付ける

インライン `// req-XXX` は「なぜこう書くか」が仕様から自明でない行のみ付ける。自明な行（`aria-label` へのアクセシビリティ対応など）は過剰になるため省略してよい。

```typescript
import "server-only" // req-001-015, req-008-007 — クライアントバンドルへの混入を防ぐ

const res = await fetch(url, {
  next: { revalidate: 30 }, // req-009-001 — ISR 30秒キャッシュ
})

if (res.status === 403) {
  log.warn({ url, status: 403 }, "レート制限") // req-005-004, req-010-006
}
```

#### テストに Gherkin ID を付ける

```typescript
test("uc-001-001: キーワード検索でリポジトリ一覧が表示される", async () => {
  // ...
})

test("uc-005-003: GitHub API 403 エラー時にレート制限メッセージを表示する", async () => {
  // ...
})
```

---

## セキュリティヘッダー

`next.config.mjs` で全ルートに以下を設定済み。

| ヘッダー                  | 設定値                                               |
| ------------------------- | ---------------------------------------------------- |
| Content-Security-Policy   | default-src 'self'、img-src に GitHub アバターを許可 |
| X-Frame-Options           | DENY                                                 |
| X-Content-Type-Options    | nosniff                                              |
| Referrer-Policy           | strict-origin-when-cross-origin                      |
| Strict-Transport-Security | max-age=31536000                                     |
| Permissions-Policy        | camera / microphone / geolocation を無効             |
