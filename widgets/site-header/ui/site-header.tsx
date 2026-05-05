/**
 * @file サイト共通ヘッダー
 */
import Link from "next/link"
import { FaGithub } from "react-icons/fa"

import { APP_NAME } from "@/shared/config/app"

/**
 * サイト全体で使用するスティッキーヘッダー
 * @returns レンダリングされる JSX 要素
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          <FaGithub className="h-5 w-5" />
          <span className="text-[15px]">{APP_NAME}</span>
        </Link>
      </div>
    </header>
  )
}
