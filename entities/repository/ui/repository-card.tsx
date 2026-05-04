/**
 * @file リポジトリカード UI コンポーネント
 */
import { ChevronRight, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { formatCount } from "@/shared/lib/format"
import { Badge } from "@/shared/ui/badge"

import type { Repository } from "../model/types"

interface RepositoryCardProps {
  repo: Repository
  searchParams: { q: string; sort: string; page: string }
}

/**
 * リポジトリカードコンポーネント
 * @param props.repo - リポジトリデータ
 * @param root0
 * @param root0.repo
 * @param props.searchParams - 検索パラメータ（詳細ページからの戻り先用）
 * @param root0.searchParams
 */
export function RepositoryCard({ repo, searchParams }: RepositoryCardProps) {
  return (
    <Link
      href={`/repos/${repo.full_name}?q=${encodeURIComponent(searchParams.q)}&sort=${searchParams.sort}&page=${searchParams.page}`}
      className="group flex items-center gap-3.5 rounded-xl border bg-card px-4 py-3.5 shadow-sm transition-all hover:border-primary hover:shadow-md"
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border">
        <Image
          src={repo.owner.avatar_url}
          alt={repo.owner.login}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-semibold text-sm text-foreground transition-colors group-hover:text-primary">
            {repo.full_name}
          </span>
          {repo.archived && (
            <Badge variant="outline" className="text-[10px]">Archived</Badge>
          )}
          {repo.fork && (
            <Badge variant="outline" className="text-[10px]">Fork</Badge>
          )}
        </div>
        {repo.description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {repo.description}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {repo.language && (
          <Badge variant="primary" className="text-[10px]">
            {repo.language}
          </Badge>
        )}
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Star className="h-3 w-3" />
          {formatCount(repo.stargazers_count)}
        </span>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
