/**
 * @file リポジトリ一覧 async Server Component（SSR）
 */
import { searchRepositories, RepositoryCard, type SortOption } from "@/entities/repository"
import { GitHubApiError } from "@/entities/repository"
import { MAX_PAGES, PER_PAGE } from "@/shared/config/github"

import { PaginationNav } from "./pagination-nav"
import { ResultsHeader } from "./results-header"

interface RepositoryListProps {
  q: string
  sort: SortOption
  page: number
}

/**
 * リポジトリ検索結果一覧（async Server Component）
 * @param root0 - コンポーネント props
 * @param root0.q - 検索キーワード
 * @param root0.sort - ソートオプション
 * @param root0.page - ページ番号
 * @returns 検索結果の JSX
 */
export async function RepositoryList({ q, sort, page }: RepositoryListProps) {
  if (!q.trim()) return null

  type FetchResult =
    | { ok: true; data: Awaited<ReturnType<typeof searchRepositories>> }
    | { ok: false; message: string }

  let result: FetchResult
  try {
    const data = await searchRepositories({ q, sort, page })
    result = { ok: true, data }
  } catch (error) {
    const message =
      error instanceof GitHubApiError
        ? error.message
        : "予期しないエラーが発生しました"
    result = { ok: false, message }
  }

  if (!result.ok) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="font-semibold text-destructive">{result.message}</p>
      </div>
    )
  }

  const { data } = result
  const totalPages = Math.min(Math.ceil(data.total_count / PER_PAGE), MAX_PAGES)
  const searchParamsObj = { q, sort, page: String(page) }

  if (data.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="font-semibold text-foreground">
          「{q}」に一致するリポジトリが見つかりませんでした
        </p>
        <p className="text-sm text-muted-foreground">
          別のキーワードで検索してみてください
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ResultsHeader
        totalCount={data.total_count}
        currentPage={page}
        totalPages={totalPages}
        currentSort={sort}
      />

      <ul className="space-y-2" aria-label="検索結果">
        {data.items.map((repo) => (
          <li key={repo.id}>
            <RepositoryCard repo={repo} searchParams={searchParamsObj} />
          </li>
        ))}
      </ul>

      <PaginationNav
        currentPage={page}
        totalPages={totalPages}
        q={q}
        sort={sort}
      />
    </div>
  )
}
