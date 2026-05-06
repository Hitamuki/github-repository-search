/**
 * @file リポジトリ一覧 async Server Component（SSR）
 * @see req-002-001, req-002-002, req-002-003, req-002-004, req-002-005, req-002-008
 * @see req-004-002, req-004-013, req-005-003, req-005-004, req-006-004
 * @see uc-002-001, uc-002-002, uc-002-004, uc-002-005, uc-002-006, uc-004-010, uc-004-011
 */
import {
  searchRepositories,
  RepositoryCard,
  type SortOption,
} from "@/entities/repository"
import { GitHubApiError } from "@/entities/repository"
import { MAX_PAGES, PER_PAGE } from "@/shared/config/github"
import { LBL } from "@/shared/config/labels"
import { MSG, MSG_TPL } from "@/shared/config/messages"

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
      error instanceof GitHubApiError ? error.message : MSG["MSG-C001"]
    result = { ok: false, message }
  }

  if (!result.ok) {
    return (
      // req-006-004 — スクリーンリーダーへの即時通知
      <div
        role="alert"
        className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center"
      >
        <p className="font-semibold text-destructive">{result.message}</p>
      </div>
    )
  }

  const { data } = result
  // req-004-013 — MAX_PAGES 上限（20ページ）で表示ページ数を切り捨て
  const totalPages = Math.min(Math.ceil(data.total_count / PER_PAGE), MAX_PAGES)
  const searchParamsObj = { q, sort, page: String(page) }

  if (data.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="font-semibold text-foreground">{MSG_TPL["MSG-007"](q)}</p>
        <p className="text-sm text-muted-foreground">{MSG["MSG-008"]}</p>
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

      {/* tabIndex={-1}: プログラム的フォーカスを受け取れるようにする（uc-006-009） */}
      <ul tabIndex={-1} className="space-y-2 outline-none" aria-label={LBL["LBL-005"]}>
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
