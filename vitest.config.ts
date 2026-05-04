/**
 * @file Vitest 設定
 * @remarks
 * Testing Trophy 思想（AGENTS.md §7）に基づき Integration テストを最厚にする。
 * E2E（*.spec.ts）は Playwright が担当するため除外する。
 */
import { resolve } from "node:path"

import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // tsconfig.json の paths "@/*": ["./*"] に対応
      "@": resolve(import.meta.dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/.next/**",
      "**/tests/e2e/**",
      "**/*.spec.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["**/node_modules/**", "**/.next/**", "**/tests/e2e/**"],
    },
  },
})
