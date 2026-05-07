/**
 * @file リポジトリ検索 結合テスト
 * @see req-001-search, req-002-results, req-004-pagination, req-005-error
 * @see uc-001-001, uc-001-003, uc-004-001, uc-005-001
 */
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, test, expect, vi } from "vitest"

import HomePage from "@/app/page"
import { APP_NAME } from "@/shared/config/app"
import { LBL } from "@/shared/config/labels"

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

describe("リポジトリ検索 結合テスト", () => {
  test("uc-001-001: キーワードで検索できる（初期表示から検索実行）", async () => {
    // Arrange
    const user = userEvent.setup()
    const mockPush = vi.fn()
    const { useRouter } = await import("next/navigation")
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as unknown as AppRouterInstance)

    // 1. 初期表示（クエリなし）
    const { rerender } = render(
      await HomePage({ searchParams: Promise.resolve({}) })
    )

    expect(screen.getByRole("heading", { name: APP_NAME })).toBeInTheDocument()
    const input = screen.getByPlaceholderText(LBL["LBL-001"])

    // Act
    // 2. 検索実行（フォーム入力 -> 送信）
    await user.type(input, "react")
    await user.click(screen.getByRole("button", { name: LBL["LBL-002"] }))

    // Assert
    // URL 遷移が試みられたことを確認 (q=react&page=1)
    expect(mockPush).toHaveBeenCalledWith("/?q=react&page=1")

    // Act - 検索結果の擬似表示
    // 3. 検索結果表示
    const { RepositoryList } = await import("@/widgets/repository-list")
    rerender(await RepositoryList({ q: "react", sort: "best match", page: 1 }))

    // Assert
    await waitFor(
      () => {
        expect(screen.getByText("react/repo-1")).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
    expect(screen.getByText(/100/)).toBeInTheDocument()
  })

  test("uc-001-003: URL の q パラメータで初期検索が実行される", async () => {
    // Arrange
    const { useRouter } = await import("next/navigation")
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
    } as unknown as AppRouterInstance)
    const { RepositoryList } = await import("@/widgets/repository-list")

    // Act
    render(
      await HomePage({ searchParams: Promise.resolve({ q: "typescript" }) })
    )

    // Assert
    const input = screen.getByPlaceholderText(
      LBL["LBL-001"]
    ) as HTMLInputElement
    expect(input.value).toBe("typescript")

    // Act - 検索結果のレンダリング
    render(
      await RepositoryList({ q: "typescript", sort: "best match", page: 1 })
    )

    // Assert
    await waitFor(() => {
      expect(screen.getByText("typescript/repo-1")).toBeInTheDocument()
    })
  })

  test("uc-005-001: API エラー時にエラーメッセージが表示される", async () => {
    // Arrange
    const { RepositoryList } = await import("@/widgets/repository-list")

    // Act
    render(await RepositoryList({ q: "error", sort: "best match", page: 1 }))

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument()
    })
  })

  test("uc-004-001: ページネーションで次のページに遷移できる", async () => {
    // Arrange
    const { RepositoryList } = await import("@/widgets/repository-list")

    // Act
    render(await RepositoryList({ q: "react", sort: "best match", page: 1 }))

    // Assert
    await waitFor(() => {
      expect(screen.getByText("react/repo-1")).toBeInTheDocument()
    })

    const nextButton = screen.getByRole("link", { name: LBL["LBL-007"] })
    expect(nextButton).toHaveAttribute("href", "/?q=react&page=2")
  })
})
