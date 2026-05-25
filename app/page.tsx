/**
 * @file トップ（検索）ページ — async Server Component
 * @remarks URL クエリパラメータ: q, sort, page
 * @see req-001-search, req-002-results, req-004-pagination, req-007-sort, req-009-performance
 * @see uc-001-search, uc-002-results, uc-004-pagination, uc-007-sort
 */
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { FaGithub } from "react-icons/fa"

import { SearchForm, searchParamsSchema } from "@/features/search-repositories"
import { APP_NAME } from "@/shared/config/app"
import { MAX_PAGES } from "@/shared/config/github"
import { LBL } from "@/shared/config/labels"
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
    title: q ? `「${q}」の検索結果` : APP_NAME,
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

  // req-004-011 — page が MAX_PAGES を超えるとき MAX_PAGES へリダイレクト
  const rawPage =
    typeof rawParams.page === "string" ? parseInt(rawParams.page, 10) : NaN
  if (!isNaN(rawPage) && rawPage > MAX_PAGES) {
    const q = typeof rawParams.q === "string" ? rawParams.q : ""
    const sort = typeof rawParams.sort === "string" ? rawParams.sort : ""
    const params = new URLSearchParams({ q, page: String(MAX_PAGES) })
    if (sort && sort !== "best match") params.set("sort", sort)
    redirect(`/?${params.toString()}`)
  }

  const parseResult = searchParamsSchema.safeParse({
    q: typeof rawParams.q === "string" ? rawParams.q : "",
    sort: typeof rawParams.sort === "string" ? rawParams.sort : "best match",
    page: typeof rawParams.page === "string" ? rawParams.page : "1",
  })
  // 不正なクエリパラメータはデフォルト値にフォールバック（ZodError を UI に露出させない）
  const { q, sort, page } = parseResult.success
    ? parseResult.data
    : { q: "", sort: "best match" as const, page: 1 }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      {!q && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <FaGithub className="h-10 w-10 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-balance">
              {APP_NAME}
            </h1>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">
              {LBL["LBL-004"]}
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
