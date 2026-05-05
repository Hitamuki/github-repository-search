/**
 * @file リポジトリ詳細 結合テスト
 * @see req-003-detail
 * @see uc-003-001, uc-003-002, uc-003-006
 */
import { render, screen, waitFor } from "@testing-library/react"
import { describe, test, expect, vi } from "vitest"

import RepoPage from "@/app/repos/[owner]/[repo]/page"

describe("リポジトリ詳細 結合テスト", () => {
  test("uc-003-001: リポジトリの詳細情報が表示される", async () => {
    // Act
    render(
      await RepoPage({
        params: Promise.resolve({ owner: "facebook", repo: "react" }),
        searchParams: Promise.resolve({}),
      })
    )

    // Assert
    // MSW により "facebook/react" が表示されるはず
    await waitFor(() => {
      expect(screen.getByText("facebook/react")).toBeInTheDocument()
    })
    
    // 統計情報の確認
    expect(screen.getByText(/220.0k/)).toBeInTheDocument() // Star 数
    expect(screen.getByText(/15.0k/)).toBeInTheDocument()  // Watcher 数
    expect(screen.getByText(/45.0k/)).toBeInTheDocument()  // Fork 数
    
    // メタ情報の確認
    expect(screen.getByText("MIT")).toBeInTheDocument() // ライセンス
    expect(screen.getByText("JavaScript")).toBeInTheDocument() // 言語
  })

  test("uc-003-002: 検索結果に戻るリンクが正しいクエリを含んでいる", async () => {
    // Act
    render(
      await RepoPage({
        params: Promise.resolve({ owner: "facebook", repo: "react" }),
        searchParams: Promise.resolve({ q: "react hooks", sort: "stars", page: "2" }),
      })
    )

    // Assert
    const backLink = screen.getByRole("link", { name: /検索結果に戻る/i })
    expect(backLink).toHaveAttribute("href", "/?q=react+hooks&sort=stars&page=2")
  })

  test("uc-003-006: 存在しないリポジトリの場合は notFound が呼ばれる", async () => {
    // Arrange
    // next/navigation の notFound をスパイ
    const { notFound } = await import("next/navigation")
    const notFoundSpy = vi.mocked(notFound)

    // Act
    try {
      await RepoPage({
        params: Promise.resolve({ owner: "not-found", repo: "repo" }),
        searchParams: Promise.resolve({}),
      })
    } catch (e) {
      // notFound は内部でエラーを投げるのでキャッチする
    }

    // Assert
    expect(notFoundSpy).toHaveBeenCalled()
  })
})
