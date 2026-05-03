/**
 * @file ESLint 設定
 * @remarks
 * AGENTS.md §3 技術スタック・§6 コード規約 に基づく構成。
 * 各ブロックのコメントで対応する要件を明示する。
 */

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import importX from "eslint-plugin-import-x";
import jsDoc from "eslint-plugin-jsdoc";
import security from "eslint-plugin-security";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  // ─── Next.js 推奨設定 ────────────────────────────────────────────────────
  // @typescript-eslint（型安全）・jsx-a11y（アクセシビリティ）を内包
  // req: AGENTS.md §3 静的解析（eslint-config-next + @typescript-eslint + jsx-a11y）
  ...nextVitals,
  ...nextTs,

  // ─── import 順序 ─────────────────────────────────────────────────────────
  // req: AGENTS.md §6.3「外部ライブラリ → @/ → 相対 → type のみ」を自動整列
  {
    plugins: { "import-x": importX },
    settings: {
      "import-x/resolver": {
        // @/ エイリアスを tsconfig.json の paths から解決
        typescript: { project: "./tsconfig.json" },
      },
    },
    rules: {
      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "type",
          ],
          pathGroups: [{ pattern: "@/**", group: "internal" }],
          pathGroupsExcludedImportTypes: ["type"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import-x/no-duplicates": "error",
    },
  },

  // ─── JSDoc ───────────────────────────────────────────────────────────────
  // req: AGENTS.md §6.1「すべての .ts/.tsx に JSDoc を記述する」
  {
    plugins: { jsdoc: jsDoc },
    rules: {
      // 関数宣言への JSDoc を必須（アロー関数は warn のみ）
      "jsdoc/require-jsdoc": [
        "warn",
        {
          require: {
            FunctionDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
          checkConstructors: false,
        },
      ],
      // @param / @returns の存在を確認（説明文は任意）
      "jsdoc/require-param": "warn",
      "jsdoc/require-returns": "warn",
      "jsdoc/require-param-description": "off",
      "jsdoc/require-returns-description": "off",
    },
  },

  // ─── shadcn/ui 自動生成ファイルの除外 ───────────────────────────────────
  // components/ui/ と lib/utils.ts は shadcn CLI が生成するため JSDoc を強制しない
  {
    files: ["components/ui/**", "lib/utils.ts"],
    rules: {
      "jsdoc/require-jsdoc": "off",
      "jsdoc/require-param": "off",
      "jsdoc/require-returns": "off",
    },
  },

  // ─── 未使用 import ───────────────────────────────────────────────────────
  // @typescript-eslint の no-unused-vars と競合するため両方を無効化してから有効化
  {
    plugins: { "unused-imports": unusedImports },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },

  // ─── セキュリティ ────────────────────────────────────────────────────────
  // req: AGENTS.md §2.5 Security First・§8 セキュリティ（静的検出層）
  {
    plugins: { security },
    rules: { ...security.configs.recommended.rules },
  },

  // ─── Prettier 競合解消 ───────────────────────────────────────────────────
  // req: AGENTS.md §3「eslint-config-prettier で競合回避」
  // prettier は必ず最後に置き、書式ルールを上書きして無効化する
  prettier,

  // ─── 除外パターン ────────────────────────────────────────────────────────
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
