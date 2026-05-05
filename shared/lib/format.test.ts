/**
 * @file format ユーティリティ Unit テスト
 * @remarks uc-format-*: 純粋関数のため Unit テスト対象（AGENTS.md §7.2）
 */
import { describe, expect, it } from "vitest"

import { formatCount, formatDate } from "./format"

describe("formatCount", () => {
  it("formatCount_null_returnsHyphen", () => {
    // Act
    const result = formatCount(null)
    // Assert
    expect(result).toBe("−")
  })

  it("formatCount_undefined_returnsHyphen", () => {
    // Act
    const result = formatCount(undefined)
    // Assert
    expect(result).toBe("−")
  })

  it("formatCount_zero_returnsZero", () => {
    // Act
    const result = formatCount(0)
    // Assert
    expect(result).toBe("0")
  })

  it("formatCount_under1000_returnsAsString", () => {
    // Act
    const result = formatCount(999)
    // Assert
    expect(result).toBe("999")
  })

  it("formatCount_1000_returnsKNotation", () => {
    // Act
    const result = formatCount(1000)
    // Assert
    expect(result).toBe("1.0k")
  })

  it("formatCount_over1000_returnsKNotation", () => {
    // Act
    const result = formatCount(1234)
    // Assert
    expect(result).toBe("1.2k")
  })

  it("formatCount_veryLargeNumber_returnsKNotation", () => {
    // Act
    const result = formatCount(1000000)
    // Assert
    expect(result).toBe("1000.0k")
  })
})

describe("formatDate", () => {
  it("formatDate_null_returnsHyphen", () => {
    // Act
    const result = formatDate(null)
    // Assert
    expect(result).toBe("−")
  })

  it("formatDate_undefined_returnsHyphen", () => {
    // Act
    const result = formatDate(undefined)
    // Assert
    expect(result).toBe("−")
  })

  it("formatDate_emptyString_returnsHyphen", () => {
    // Act
    const result = formatDate("")
    // Assert
    expect(result).toBe("−")
  })

  it("formatDate_validIso8601_containsYear", () => {
    // Act
    const result = formatDate("2023-04-01T00:00:00Z")
    // Assert
    expect(result).toMatch(/2023/)
  })

  it("formatDate_invalidDate_returnsInvalidDateString", () => {
    // Act
    const result = formatDate("invalid")
    // Assert
    expect(result).not.toBe("−")
  })
})
