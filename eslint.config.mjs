import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Disable ESLint rules that conflict with Prettier (keep last).
  prettier,
  // Import/export ordering — auto-fixable with `eslint --fix`.
  // Order (top → bottom): side-effects → node builtins → third-party libs
  // (react/next first) → @icons SVG assets → @/ internal alias → relative.
  {
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^\\u0000"],
            ["^node:"],
            // Third-party packages — react/next first, then the rest. The
            // `(?!icons)` lookahead keeps the `@icons/*` alias out of this group.
            ["^react", "^next", "^@(?!icons)\\w", "^\\w"],
            ["^@icons/"],
            ["^@/"],
            ["^\\."],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      // Defer ordering entirely to simple-import-sort.
      "sort-imports": "off",
      "import/order": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Takumi kit + generated assets — not our source to lint.
    ".claude/**",
    "public/**",
  ]),
]);

export default eslintConfig;
