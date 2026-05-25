# コードベース理解ガイド（技術面接準備）

## FSD（Feature-Sliced Design）の構成と責務

```
app/          ← ルーティング。ページ・レイアウト・エラーバウンダリのみ
widgets/      ← 複数の entities/features を組み合わせた表示単位
features/     ← ユーザー操作（検索フォーム、ソート選択）
entities/     ← ドメインモデル（Repository）とAPIクライアント
shared/       ← 全層で使える汎用品（UI部品・定数・ロガー）
```

**依存の方向は上から下のみ**。例えば `entities` が `features` を import することは禁止。

---

## Server Components と Client Components

| コンポーネント | 種別 | 理由 |
|---|---|---|
| `app/page.tsx` | **Server** | `searchParams` を受け取り SSR でレンダリング |
| `widgets/repository-list/ui/repository-list.tsx` | **Server** | GitHub API を直接 fetch する async コンポーネント |
| `entities/repository/ui/repository-card.tsx` | **Server** | インタラクションなし、データ表示のみ |
| `features/search-repositories/ui/search-form.tsx` | **Client** | `useRouter`, `useState` が必要 |
| `features/search-repositories/ui/sort-selector.tsx` | **Client** | URL更新のため `useRouter` が必要 |
| `app/error.tsx` | **Client** | `reset()` コールバックを受け取る必要があるため |

Suspense のキーに `key={`${q}-${sort}-${page}`}` を使っており、URLが変わるたびに Server Component を再レンダリングさせています。

---

## GitHub Search API の処理フロー

```
URL変更 → page.tsx が searchParams を解析（Zod検証）
        → <Suspense fallback={<Skeleton/>}>
            → <RepositoryList> (async Server Component)
              → searchRepositories() in github-api.ts
                → fetch("https://api.github.com/search/repositories", {
                    next: { revalidate: 30 }  // ISRキャッシュ30秒
                  })
```

`entities/repository/api/github-api.ts` に2つのAPI関数があります：

- `searchRepositories()` → 検索（ISR 30秒）
- `getRepository(owner, repo)` → 詳細取得（ISR 60秒）

---

## エラーハンドリング（3層構造）

| 層 | 実装 | 対象エラー |
|---|---|---|
| API層 | `GitHubApiError` カスタム例外 | 403・404・422・5xx |
| Server Component層 | try-catch → エラーUI返却 | APIエラー（画面にメッセージ表示） |
| React Error Boundary | `app/error.tsx` | 予期しない例外（リトライボタン表示） |

404専用として `notFound()` を使い、`app/repos/[owner]/[repo]/not-found.tsx` に誘導するパターンも使っています。

---

## テスト構成（Testing Trophy）

```
E2E（8本）        : uc-001〜uc-010 / Playwright / Gherkinシナリオと1対1対応
Integration（2本） : search.test.tsx, detail.test.tsx / MSWでAPIモック
Unit（3本）       : URL構築・Zodスキーマ・フォーマット関数
```

MSWでモックするのは「テスト中にGitHub APIのレート制限に引っかかること」と「テストの不安定化」を防ぐためです。

---

## pino について

`shared/lib/logger.ts` で定義されています。

### 何をやっているか

- `logger`（グローバル）と `createRequestLogger()`（リクエストID付き子ロガー）の2つを提供
- `entities/repository/api/github-api.ts` のAPIエラー時（403・404・5xx）に `log.warn()` / `log.error()` を呼ぶ
- `app/actions.ts` の `reportClientError()` Server Action でクライアントエラーをサーバーログに記録

### ログの記録先

- ローカル開発時 → `pnpm dev 2>&1 | pino-pretty` で整形表示
- Vercel デプロイ時 → Vercel Function Logs に JSON 形式で出力
- **現状は外部ログ基盤（Datadog等）への転送はなし**。`LOG_LEVEL` 環境変数で verbosity 制御のみ

---

## FSD についての面接回答（想定）

> **「FSDとはどんな特徴があるのか」**

FSDは機能単位ではなくスライス（ドメインの切り口）でコードを分割するアーキテクチャです。最大の特徴は**依存の方向が上位層から下位層への一方向のみ**というルールです。これにより同じ層のコードが互いに参照し合うスパゲッティ状態を防ぎます。テストとの関係では、entities層の純粋な関数はUnit Testで、features・widgets層の統合はIntegration Testで検証するという対応関係が自然に生まれます。

---

## 想定される技術面接質問

### FSD・アーキテクチャ

1. **「widgets と features の違いを教えてください」**
   - widgets は複数の features/entities を組み合わせた表示単位（例：一覧＋ページネーション）、features はユーザー操作に対応する単一ユースケース

2. **「同じ entities 層同士でインポートしたい場合どうしますか？」**
   - shared 層に切り出すか、設計を見直す。クロスインポートは禁止

3. **「FSDをこのプロジェクト規模で選んだ理由は？」**
   - コーディングテストのため将来の拡張性より設計の明確さを優先した

### Server Components

4. **「なぜ検索フォームだけ Client Component にしたのですか？」**
   - `useState` と `useRouter` が必要なため。できるだけ末端に配置してバンドルサイズを抑えた

5. **「Suspense のキーを `q-sort-page` にしている理由は？」**
   - URLが変わるたびに Suspense をリセットし、前の結果のフラッシュなしにスケルトンを再表示させるため

6. **「ISR（revalidate）を使う理由は？」**
   - GitHub API のレート制限対策と UX 向上（同じクエリなら再フェッチしない）

### テスト

7. **「なぜ Unit Test より Integration Test を多く書いているのですか？」**
   - Server Component 中心の構成では単体テストの対象が少ない。Integration が「フォーム→URL更新→SSR」というユーザー体験に最も近い

8. **「MSWを使う理由は？」**
   - テスト中に本物のGitHub APIを叩くとレート制限・ネット依存・テスト不安定の3つの問題がある

9. **「アクセシビリティテストを E2E に組み込んだ理由は？」**
   - 実際のブラウザでレンダリングされた DOM に対して axe-core が検証するため、本番に近い精度が出る

### エラーハンドリング

10. **「404 と 5xx でなぜハンドリング方法が違うのですか？」**
    - 404 は想定内の「存在しない」ケースなので `notFound()` でユーザーフレンドリーなページへ。5xx は予期しないサーバー障害なのでエラーバウンダリに投げてリトライUIを提供

### セキュリティ

11. **「GITHUB_TOKEN をどこで使っていますか？クライアントに漏れませんか？」**
    - `entities/repository/api/github-api.ts` に `import 'server-only'` を付与しているため、クライアントバンドルに混入するとビルドエラーになる

---

## 特に深掘りされそうなポイント

- Suspense のキー設計
- Server/Client の境界判断
- MSWのモック戦略
- Testing Trophy の採用理由

根拠を話せるようにしておくと印象が良い。
