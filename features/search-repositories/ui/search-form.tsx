"use client"
/**
 * @file 検索フォーム（Client Component）
 * @remarks URL クエリパラメータへの反映・ブラウザバック対応
 */
import { zodResolver } from "@hookform/resolvers/zod"
import { Search, Loader2 } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"

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
            placeholder="リポジトリ名を入力してください"
            className={cn(
              "pl-9",
              errors.q && "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={!!errors.q}
            aria-describedby={errors.q ? "search-error" : undefined}
          />
        </div>
        <Button
          type="submit"
          disabled={isPending || !qValue?.trim()}
          className="shrink-0"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              検索中
            </>
          ) : (
            "検索"
          )}
        </Button>
      </div>
      {errors.q && (
        <p id="search-error" className="text-xs text-destructive" role="alert">
          {errors.q.message}
        </p>
      )}
    </form>
  )
}
