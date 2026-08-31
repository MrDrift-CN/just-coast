# 样式与主题规范

本目录存放可复用的全局样式能力。组件布局留在组件内部，主题状态和设计令牌由
`src/theme` 管理。

## 目录职责

- `src/index.css`：全局样式入口，只负责导入 Tailwind、主题和样式模块。
- `src/theme`：主题状态、持久化、系统偏好和 CSS 设计令牌。
- `src/style`：不依赖具体页面的全局排版与样式能力。
- `src/components/ui`：shadcn 基础组件源码。
- `src/components/assistant-ui`：assistant-ui 对话组件源码。

## 样式规则

1. 优先使用组件已有的 `variant` 和 `size`，不要在调用处重新实现组件外观。
2. 颜色使用 `primary`、`background`、`foreground`、`muted`、
   `accent`、`destructive`、`border` 和 `ring` 等语义令牌。
3. 不在业务组件中使用原始 Tailwind 色板或硬编码颜色。新增颜色时，先在主题中
   定义有业务含义的变量，再映射为 Tailwind 语义令牌。
4. 不为浅色和深色模式分别编写 `dark:` 颜色；两种模式由主题变量统一切换。
5. `className` 主要用于布局。条件类名使用 `cn()`，组件变体使用 `cva()`。
6. 布局间距使用 `gap-*`，不使用 `space-x-*` 或 `space-y-*`。
7. 宽高相同时使用 `size-*`；单行截断使用 `truncate`。
8. Dialog、Sheet、Popover、Tooltip 等浮层不手写 `z-index`。
9. 优先复用项目已有动画与滚动工具，不重复编写相同的关键帧。
10. 自有 CSS 文件使用全小写 kebab-case；官方生成或生态固定文件名保留原约定。

## Typeset

`typeset.css` 是项目持有的 shadcn Typeset 完整样式，用于 Markdown 和其他
语义化 HTML 内容。

- 在内容容器上添加 `typeset`，不要为每一种 HTML 标签重复编写排版类。
- 组件不应受到 Typeset 影响时，使用 `not-typeset` 或
  `data-not-typeset`。
- 页面负责内容宽度和布局，Typeset 只负责排版。
- 未出现明确产品需求时，不增加场景预设，也不覆盖 Streamdown 默认渲染组件。
- 更新 `typeset.css` 时，应与 shadcn 官方版本对照并单独审查差异。

## 检查

`prettier-plugin-tailwindcss` 会根据 `src/index.css` 排序 Tailwind 类名。
ESLint 会在业务组件中阻止原始 Tailwind 色板、任意颜色、手写 `dark:` 颜色以及
`space-x-*`、`space-y-*`。Stylelint 检查自有 CSS、Tailwind 4 指令和 `#root`
边界；reduced-motion 中必要的 `!important` 保留为可见警告。
`src/components/ui` 和 `src/components/assistant-ui` 是上游生成源码，保留其原始实现并由代码审查把关。其他无法可靠静态判断的设计规则仍需要代码审查。

```powershell
npm run format
npm run lint
npm run lint:css
npm run typecheck
npm run build
```
