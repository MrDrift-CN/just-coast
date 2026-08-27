import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import { defineConfig, globalIgnores } from "eslint/config"

const classStringScope =
  ":matches(JSXAttribute[name.name='className'], CallExpression[callee.name=/^(cn|cva)$/])"

const restrictedStyleSyntax = [
  {
    selector: `${classStringScope} Literal[value=/\\b(?:bg|text|border|ring|outline|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00)\\b/]`,
    message:
      "使用主题语义颜色（如 bg-primary、text-muted-foreground），不要使用原始 Tailwind 色板。",
  },
  {
    selector: `${classStringScope} TemplateElement[value.raw=/\\b(?:bg|text|border|ring|outline|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00)\\b/]`,
    message:
      "使用主题语义颜色（如 bg-primary、text-muted-foreground），不要使用原始 Tailwind 色板。",
  },
  {
    selector: `${classStringScope} Literal[value=/\\b(?:bg|text|border|ring|outline|fill|stroke)-\\[(?:#|rgb|hsl|oklch|oklab|color:)/]`,
    message: "不要在组件类名中硬编码颜色；请先定义主题语义令牌。",
  },
  {
    selector: `${classStringScope} TemplateElement[value.raw=/\\b(?:bg|text|border|ring|outline|fill|stroke)-\\[(?:#|rgb|hsl|oklch|oklab|color:)/]`,
    message: "不要在组件类名中硬编码颜色；请先定义主题语义令牌。",
  },
  {
    selector: `${classStringScope} Literal[value=/\\bdark:(?:bg|text|border|ring|outline|fill|stroke)-/]`,
    message: "不要手写 dark: 颜色覆盖；浅色和深色模式应由主题变量切换。",
  },
  {
    selector: `${classStringScope} TemplateElement[value.raw=/\\bdark:(?:bg|text|border|ring|outline|fill|stroke)-/]`,
    message: "不要手写 dark: 颜色覆盖；浅色和深色模式应由主题变量切换。",
  },
  {
    selector: `${classStringScope} Literal[value=/\\bspace-[xy]-/]`,
    message:
      "使用 flex/grid 的 gap-* 控制间距，不要使用 space-x-* 或 space-y-*。",
  },
  {
    selector: `${classStringScope} TemplateElement[value.raw=/\\bspace-[xy]-/]`,
    message:
      "使用 flex/grid 的 gap-* 控制间距，不要使用 space-x-* 或 space-y-*。",
  },
]

export default defineConfig([
  globalIgnores(["dist", "public"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/components/assistant-ui/**/*.{ts,tsx}",
      "src/components/ui/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": ["error", ...restrictedStyleSyntax],
    },
  },
  {
    files: [
      "src/components/assistant-ui/**/*.{ts,tsx}",
      "src/components/ui/**/*.{ts,tsx}",
      "src/hooks/use-mobile.ts",
    ],
    rules: {
      "no-empty": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-refresh/only-export-components": "off",
    },
  },
])
