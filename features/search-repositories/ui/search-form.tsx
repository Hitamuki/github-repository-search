"use client"
/**
 * @file 検索フォーム（Client Component）
 * @remarks URL クエリパラメータへの反映・ブラウザバック対応
 * @see req-001-004, req-001-005, req-001-007, req-001-009, req-001-010, req-006-001, req-006-003
 * @see uc-001-001, uc-001-002, uc-001-004, uc-001-005, uc-001-006, uc-001-007, uc-006-001, uc-006-002
 */
import { zodResolver } from "@hookform/resolvers/zod"
import { Search, Loader2 } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"

import { LBL } from "@/shared/config/labels"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"

import { searchQuerySchema, type SearchQueryInput } from "../model/schema"

interface SearchFormProps {
  defaultValue?: string
  className?: string
}

/**
 * 検索フォームコンポーネント
 * @param props.defaultValue - 初期入力値（URL クエリから）
 * @param root0
 * @param root0.defaultValue
 * @param props.className - 追加 CSS クラス
 * @param root0.className
 * @returns レンダリングされる JSX 要素
 */
export function SearchForm({ defaultValue = "", className }: SearchFormProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // uc-006-009 — 検索完了後にフォーカスを検索結果一覧の先頭へ移動する
  const prevPendingRef = useRef(false)
  useEffect(() => {
    if (prevPendingRef.current && !isPending) {
      const list = document.querySelector<HTMLElement>(
        '[aria-label="検索結果"]'
      )
      list?.focus()
    }
    prevPendingRef.current = isPending
  }, [isPending])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SearchQueryInput>({
    resolver: zodResolver(searchQuerySchema),
    defaultValues: { q: defaultValue },
  })

  const qValue = useWatch({ control, name: "q" })

  const onSubmit = useCallback(
    (data: SearchQueryInput) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("q", data.q)
      params.set("page", "1")

      // req-001-005, req-001-007 — submit 時にのみ URL を更新し、SSR 結果を再描画
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-1.5", className)}
    >
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            {...register("q")}
            placeholder={LBL["LBL-001"]}
            aria-label={LBL["LBL-001"]}
            className={cn(
              "pl-9",
              errors.q &&
                qValue?.trim() &&
                "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={!!(errors.q && qValue?.trim())} // req-006-001, req-006-003
            aria-describedby={errors.q ? "search-error" : undefined}
          />
        </div>
        <Button
          type="submit"
          disabled={isPending || !qValue?.trim()} // req-001-009, req-001-010
          className="shrink-0"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {LBL["LBL-003"]}
            </>
          ) : (
            LBL["LBL-002"]
          )}
        </Button>
      </div>
      {errors.q && qValue?.trim() && (
        // req-006-001 — スクリーンリーダーへエラーを即座に通知
        <p id="search-error" className="text-xs text-destructive" role="alert">
          {errors.q.message}
        </p>
      )}
    </form>
  )
}
