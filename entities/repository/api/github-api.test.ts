/**
 * @file GitHub API クライアント URL 構築 Unit テスト
 * @remarks API リクエスト自体は Integration テストでカバーする。
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest"

import { buildRepoUrl, buildSearchUrl } from "./github-api"

describe("buildSearchUrl", () => {
  it("buildSearchUrl_bestMatch_excludesSortParam", () => {
    // Arrange
    const params = { q: "next.js", sort: "best match" as const, page: 1 }

    // Act
    const url = buildSearchUrl(params)

    // Assert
    expect(url).toContain("q=next.js")
    expect(url).not.toContain("sort=")
  })

  it("buildSearchUrl_withSort_includesSortAndOrder", () => {
    // Arrange
    const params = { q: "next.js", sort: "stars" as const, page: 1 }

    // Act
    const url = buildSearchUrl(params)

    // Assert
    expect(url).toContain("sort=stars")
    expect(url).toContain("order=desc")
  })

  it("buildSearchUrl_specialCharacters_encodesQuery", () => {
    // Arrange
    const params = { q: "react & vite", sort: "best match" as const, page: 1 }

    // Act
    const url = buildSearchUrl(params)

    // Assert
    expect(url).toContain("q=react%20%26%20vite")
  })
})

describe("buildRepoUrl", () => {
  it("buildRepoUrl_validInputs_constructsCorrectUrl", () => {
    // Act
    const url = buildRepoUrl("vercel", "next.js")

    // Assert
    expect(url).toContain("/repos/vercel/next.js")
  })
})
