/**
 * @file format ユーティリティ Unit テスト
 * @remarks uc-format-*: 純粋関数のため Unit テスト対象（AGENTS.md §7.2）
 */
import { describe, expect, it } from "vitest"

import { formatCount, formatDate } from "./format"

describe("formatCount", () => {
  it("formatCount_null_returnsHyphen", () => {
    expect(formatCount(null)).toBe("−")
  })

  it("formatCount_undefined_returnsHyphen", () => {
    expect(formatCount(undefined)).toBe("−")
  })

  it("formatCount_zero_returnsZero", () => {
    expect(formatCount(0)).toBe("0")
  })

  it("formatCount_under1000_returnsAsString", () => {
    expect(formatCount(999)).toBe("999")
  })

  it("formatCount_1000_returnsKNotation", () => {
    expect(formatCount(1000)).toBe("1.0k")
  })

  it("formatCount_over1000_returnsKNotation", () => {
    expect(formatCount(1234)).toBe("1.2k")
  })
})

describe("formatDate", () => {
  it("formatDate_null_returnsHyphen", () => {
    expect(formatDate(null)).toBe("−")
  })

  it("formatDate_undefined_returnsHyphen", () => {
    expect(formatDate(undefined)).toBe("−")
  })

  it("formatDate_emptyString_returnsHyphen", () => {
    expect(formatDate("")).toBe("−")
  })

  it("formatDate_validIso8601_containsYear", () => {
    expect(formatDate("2023-04-01T00:00:00Z")).toMatch(/2023/)
  })
})
