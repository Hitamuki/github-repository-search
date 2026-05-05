/**
 * @file Vitest グローバルセットアップ
 * @remarks
 * - jest-dom カスタムマッチャー（toBeInTheDocument 等）を全テストで有効化
 * - server-only モジュールをモックしてサーバー専用コードをテスト可能にする
 * - MSW で API をモック
 * - Next.js 固有の機能をモック
 */
import "@testing-library/jest-dom"
import { vi, beforeAll, afterEach, afterAll } from "vitest"

import { server } from "./tests/mocks/server"

// server-only モジュールのモック（req-008-007）
vi.mock("server-only", () => ({}))

// MSW のライフサイクル設定
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Next.js コンポーネントとフックのモック
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => "/"),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
}))

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Map()),
  cookies: vi.fn(async () => new Map()),
}))

vi.mock("next/image", () => ({
  __esModule: true,
  default: vi.fn((props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} fill={undefined} alt={props.alt || ""} />
  }),
}))

// Link のモック
vi.mock("next/link", () => ({
  __esModule: true,
  default: vi.fn(({ children, href, ...props }: any) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }),
}))
