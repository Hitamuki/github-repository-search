/**
 * @file MSW モックハンドラー定義
 */
import { http, HttpResponse } from "msw"

import { GITHUB_API_BASE } from "@/shared/config/github"

import type {
  SearchRepositoriesResponse,
  Repository,
} from "@/entities/repository"

// モック用のサンプルデータ
const mockRepo: Repository = {
  id: 1,
  full_name: "facebook/react",
  name: "react",
  description:
    "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
  html_url: "https://github.com/facebook/react",
  stargazers_count: 220000,
  watchers_count: 220000,
  subscribers_count: 15000,
  forks_count: 45000,
  open_issues_count: 1500,
  language: "JavaScript",
  topics: ["react", "frontend", "library"],
  private: false,
  archived: false,
  fork: false,
  default_branch: "main",
  license: { spdx_id: "MIT", name: "MIT License" },
  created_at: "2013-05-24T16:15:54Z",
  updated_at: "2024-05-05T00:00:00Z",
  pushed_at: "2024-05-05T00:00:00Z",
  owner: {
    login: "facebook",
    avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4",
    html_url: "https://github.com/facebook",
  },
}

export const handlers = [
  // リポジトリ検索
  http.get(`${GITHUB_API_BASE}/search/repositories`, ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get("q")
    const page = Number(url.searchParams.get("page") || "1")

    // エラーテスト用
    if (q === "error") {
      return new HttpResponse(null, { status: 500 })
    }
    if (q === "ratelimit") {
      return new HttpResponse(null, { status: 403 })
    }

    // 0件ヒットのテスト用
    if (q === "no-results") {
      return HttpResponse.json<SearchRepositoriesResponse>({
        total_count: 0,
        incomplete_results: false,
        items: [],
      })
    }

    // 正常系
    return HttpResponse.json<SearchRepositoriesResponse>({
      total_count: 100,
      incomplete_results: false,
      items: Array.from({ length: 30 }, (_, i) => ({
        ...mockRepo,
        id: (page - 1) * 30 + i + 1,
        full_name: `${q}/repo-${(page - 1) * 30 + i + 1}`,
      })),
    })
  }),

  // リポジトリ詳細
  http.get(`${GITHUB_API_BASE}/repos/:owner/:repo`, ({ params }) => {
    const { owner, repo } = params

    if (owner === "error") {
      return new HttpResponse(null, { status: 500 })
    }
    if (owner === "not-found") {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json<Repository>({
      ...mockRepo,
      full_name: `${owner}/${repo}`,
      name: repo as string,
      stargazers_count: 220000,
      watchers_count: 220000,
      subscribers_count: 15000,
      forks_count: 45000,
      owner: {
        ...mockRepo.owner,
        login: owner as string,
      },
    })
  }),
]
