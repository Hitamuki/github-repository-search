/**
 * @file features/search-repositories Zod バリデーションスキーマ Unit テスト
 * @see req-001-002, req-001-012, req-004-001, req-007-001, req-007-007
 * @see uc-001-005, uc-001-007
 */
import { describe, expect, it } from "vitest"

import { MSG } from "@/shared/config/messages"

import { searchParamsSchema, searchQuerySchema } from "./schema"

describe("searchQuerySchema", () => {
  it("searchQuerySchema_validInput_passes", () => {
    // Arrange
    const input = { q: "next.js" }

    // Act
    const result = searchQuerySchema.safeParse(input)

    // Assert
    expect(result.success).toBe(true)
  })

  it("searchQuerySchema_tooLongInput_failsWithMaxLengthMessage", () => {
    // Arrange
    const input = { q: "a".repeat(257) }

    // Act
    const result = searchQuerySchema.safeParse(input)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(MSG["MSG-002"])
    }
  })
})

describe("searchParamsSchema", () => {
  it("searchParamsSchema_emptyParams_returnsDefaults", () => {
    // Arrange
    const params = {}

    // Act
    const result = searchParamsSchema.parse(params)

    // Assert
    expect(result).toEqual({
      q: "",
      sort: "best match",
      page: 1,
    })
  })

  it("searchParamsSchema_validParams_returnsParsedValues", () => {
    // Arrange
    const params = { q: "react", sort: "stars", page: "2" }

    // Act
    const result = searchParamsSchema.parse(params)

    // Assert
    expect(result).toEqual({
      q: "react",
      sort: "stars",
      page: 2,
    })
  })

  it("searchParamsSchema_invalidSort_returnsDefaultSort", () => {
    // Arrange
    const params = { sort: "invalid" }

    // Act
    const result = searchParamsSchema.parse(params)

    // Assert
    expect(result.sort).toBe("best match")
  })

  it("searchParamsSchema_negativePage_returnsMinPage", () => {
    // Arrange
    const params = { page: "-1" }

    // Act
    const result = searchParamsSchema.parse(params)

    // Assert
    expect(result.page).toBe(1)
  })

  it("searchParamsSchema_tooLargePage_returnsMinPage", () => {
    // Arrange
    const params = { page: "1001" }

    // Act
    const result = searchParamsSchema.parse(params)

    // Assert
    expect(result.page).toBe(1)
  })
})
