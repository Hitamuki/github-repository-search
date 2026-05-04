/**
 * @file リポジトリ詳細ページ — async Server Component（SSR）
 */
import { ExternalLink, Star, Eye, GitFork, AlertCircle } from "lucide-react"
import Image from "next/image"
import { notFound } from "next/navigation"

import { getRepository, GitHubApiError } from "@/entities/repository"
import { cn } from "@/lib/utils"
import { formatCount, formatDate } from "@/shared/lib/format"
import { Badge } from "@/shared/ui/badge"

import type { Metadata } from "next"

interface RepoPageProps {
  params: Promise<{ owner: string; repo: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * 動的メタデータ生成
 * @param root0.params - ルートパラメータ
 * @param root0
 */
export async function generateMetadata({ params }: RepoPageProps): Promise<Metadata> {
  const { owner, repo } = await params
  return { title: `${owner}/${repo}` }
}

/**
 * リポジトリ詳細ページコンポーネント
 * @param root0.params - ルートパラメータ（owner, repo）
 * @param root0
 * @param root0.searchParams - URL クエリパラメータ（戻り先リンク用）
 */
export default async function RepoPage({ params, searchParams }: RepoPageProps) {
  const { owner, repo: repoName } = await params
  const rawSearch = await searchParams

  const backParams = new URLSearchParams()
  if (typeof rawSearch.q    === "string") backParams.set("q",    rawSearch.q)
  if (typeof rawSearch.sort === "string") backParams.set("sort", rawSearch.sort)
  if (typeof rawSearch.page === "string") backParams.set("page", rawSearch.page)
  const backHref = backParams.toString() ? `/?${backParams.toString()}` : "/"

  let repoData
  try {
    repoData = await getRepository(owner, repoName)
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) {
      notFound()
    }
    throw error
  }

  const stats = [
    { label: "Star 数",    value: repoData.stargazers_count,  icon: Star },
    { label: "Watcher 数", value: repoData.watchers_count,    icon: Eye },
    { label: "Fork 数",    value: repoData.forks_count,       icon: GitFork },
    { label: "Issue 数",   value: repoData.open_issues_count, icon: AlertCircle },
  ]

  const meta = [
    { label: "オーナー",          value: repoData.owner.login },
    { label: "デフォルトブランチ", value: repoData.default_branch },
    { label: "作成日",            value: formatDate(repoData.created_at) },
    { label: "最終更新日",        value: formatDate(repoData.updated_at) },
    repoData.license && { label: "ライセンス", value: repoData.license.spdx_id },
    { label: "可視性",            value: repoData.private ? "Private" : "Public" },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">

      {/* ヒーローカード */}
      <div className="flex flex-wrap items-start gap-4 rounded-xl border bg-card p-5 shadow-sm">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border">
          <Image
            src={repoData.owner.avatar_url}
            alt={repoData.owner.login}
            fill
            className="object-cover"
            sizes="64px"
            priority
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">{repoData.full_name}</h1>
            {repoData.private  && <Badge variant="outline">Private</Badge>}
            {repoData.archived && <Badge variant="outline">Archived</Badge>}
            {repoData.fork     && <Badge variant="outline">Fork</Badge>}
          </div>
          {repoData.language && (
            <div className="mt-1">
              <Badge variant="primary">{repoData.language}</Badge>
            </div>
          )}
          {repoData.description && (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed text-pretty">
              {repoData.description}
            </p>
          )}
        </div>

        <a
          href={repoData.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          GitHub で開く
        </a>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 rounded-xl border bg-card p-4 text-center shadow-sm"
          >
            <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <span className="text-2xl font-bold tracking-tight tabular-nums">
              {formatCount(value)}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* メタ情報グリッド */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3">
          {meta.map((item, i) => (
            <div
              key={item.label}
              className={cn(
                "border-b border-r p-3",
                i % 2 === 1 && "sm:border-r",
                i % 3 === 2 && "sm:border-r-0"
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-0.5 text-sm font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* トピック */}
      {repoData.topics && repoData.topics.length > 0 && (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            トピック
          </p>
          <div className="flex flex-wrap gap-1.5">
            {repoData.topics.map((topic) => (
              <Badge key={topic} variant="success">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 戻るリンク */}
      <a
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← 検索結果に戻る
      </a>
    </div>
  )
}
