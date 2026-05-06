/**
 * @file Proxy — リクエストに x-request-id を付与する
 */
import { NextRequest, NextResponse } from "next/server"

/**
 * すべてのリクエストに一意の requestId をヘッダーとして付与する
 * @param request - Next.js リクエストオブジェクト
 * @returns x-request-id ヘッダーを追加したレスポンス
 */
export function proxy(request: NextRequest): NextResponse {
  const requestId = crypto.randomUUID()
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-request-id", requestId)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  // uc-010-001〜003 — レスポンスヘッダーにも付与してクライアントから検証可能にする
  response.headers.set("x-request-id", requestId)
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
}
