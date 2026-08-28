import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

const sourceFiles = ["src/**/*.{js,jsx,ts,tsx}"];
const reactFiles = ["src/**/*.{jsx,tsx}"];
const projectTypeScriptFiles = ["src/**/*.{ts,tsx}", "vite.config.ts"];
const generatedFiles = [
  "src/components/assistant-ui/**/*.{ts,tsx}",
  "src/components/ui/**/*.{ts,tsx}",
  "src/hooks/use-mobile.ts",
];

const classStringScope =
  ":matches(JSXAttribute[name.name='className'], CallExpression[callee.name=/^(clsx|cn|cva)$/])";

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
];

export default defineConfig([
  globalIgnores([
    "dist/**",
    "coverage/**",
    "node_modules/**",
    "public/**",
    "*.min.*",
  ]),
  {
    name: "project/configuration-javascript",
    files: ["*.config.js"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.node,
      sourceType: "module",
    },
  },
  {
    name: "project/javascript",
    files: ["src/**/*.{js,jsx}"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      sourceType: "module",
    },
  },
  {
    name: "project/typescript",
    files: projectTypeScriptFiles,
    ignores: generatedFiles,
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-shadow": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          fixStyle: "inline-type-imports",
          prefer: "type-imports",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    name: "project/generated-typescript",
    files: generatedFiles,
    extends: [js.configs.recommended, tseslint.configs.recommended],
  },
  {
    name: "project/browser",
    files: sourceFiles,
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    name: "project/node",
    files: ["*.config.js", "vite.config.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    name: "project/react",
    files: reactFiles,
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
  },
  {
    name: "project/source-boundaries",
    files: sourceFiles,
    ignores: generatedFiles,
    rules: {
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-nested-ternary": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./*", "./**", "../*", "../**"],
              message:
                "web/src 内部模块与样式必须通过 @/ 别名导入，禁止使用相对路径。",
            },
          ],
        },
      ],
    },
  },
  {
    name: "project/theme-boundaries",
    files: ["src/**/*.{ts,tsx}"],
    ignores: generatedFiles,
    rules: {
      "no-restricted-syntax": ["error", ...restrictedStyleSyntax],
    },
  },
  {
    name: "project/generated-components",
    files: generatedFiles,
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-empty": "off",
      "no-nested-ternary": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-refresh/only-export-components": "off",
    },
  },
]);
