/**
 * @file トップ（検索）ページ — async Server Component
 * @remarks URL クエリパラメータ: q, sort, page
 */
import { Suspense } from "react"

import { SearchForm, searchParamsSchema } from "@/features/search-repositories"
import {
  RepositoryList,
  RepositoryListSkeleton,
} from "@/widgets/repository-list"

import type { Metadata } from "next"

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * 動的メタデータ生成
 * @param root0.searchParams - URL クエリパラメータ
 * @param root0
 * @returns メタデータオブジェクト
 */
export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const params = await searchParams
  const q = typeof params.q === "string" ? params.q : ""
  return {
    title: q ? `「${q}」の検索結果` : "GitHub リポジトリ検索",
  }
}

/**
 * トップページコンポーネント
 * @param root0.searchParams - URL クエリパラメータ（Next.js 15+ では Promise）
 * @param root0
 * @returns レンダリングされる JSX 要素
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const rawParams = await searchParams
  const validated = searchParamsSchema.parse({
    q: typeof rawParams.q === "string" ? rawParams.q : "",
    sort: typeof rawParams.sort === "string" ? rawParams.sort : "best match",
    page: typeof rawParams.page === "string" ? rawParams.page : "1",
  })

  const { q, sort, page } = validated

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      {!q && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <svg
              viewBox="0 0 24 24"
              className="h-10 w-10 fill-primary"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-balance">
              GitHub リポジトリ検索
            </h1>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">
              キーワードを入力して、GitHub 上のリポジトリを探しましょう
            </p>
          </div>
        </div>
      )}

      <SearchForm defaultValue={q} />

      {q && (
        <Suspense
          key={`${q}-${sort}-${page}`}
          fallback={<RepositoryListSkeleton />}
        >
          <RepositoryList q={q} sort={sort} page={page} />
        </Suspense>
      )}
    </div>
  )
}
