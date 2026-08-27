# 主题模块

`src/theme` 是应用外观个性化的唯一基础层。它不包含设置页面，也不依赖具体页面；未来的设置页、快捷操作、主题预设或导入流程都只消费本模块的公开 API。

## 文件职责

- `types.ts`：公开类型和完整配置结构。
- `config.ts`：默认值、数据校验、深层合并与序列化。
- `runtime.ts`：系统偏好解析、本地存储和 CSS 变量同步。
- `provider.tsx`：React 上下文、跨标签页同步以及主题操作。
- `styles.css`：Tailwind v4 与 shadcn 语义令牌、全局主题效果。
- `index.ts`：模块唯一公共出口。

## 已准备的运行时能力

- 系统、浅色、深色主题，浅色与深色配置彼此独立。
- 完整的 shadcn 表面和交互语义色：背景、前景、卡片、弹层、主色、次色、弱化色、强调色、危险色、边框、输入框和焦点环。
- 可按浅色和深色分别配置的渐变起点、中点、终点和光晕色；默认跟随背景与主色等语义色变化。
- 五个图表色，以及独立的侧边栏背景、前景、主色、强调色、边框和焦点环。
- 正文字体、标题字体、等宽字体、全局字号和正文字重。
- shadcn 基础圆角，以及从基础值派生的全部圆角等级。
- 半透明侧栏、系统/完整/减少动效、指针光标、全局对比度、差异标记。
- 本地持久化、跨标签页同步、JSON 导入/导出和重置。
- React 挂载前初始化，减少首屏主题闪烁。

因此，未来可以实现类似 shadcn Create 的主题色、基础表面色、图表色和字体控制，而不需要修改业务组件。字体配置只保存 CSS 字体族；使用某个字体前仍需在应用中加载相应字体资源。

## 运行时与构建时边界

以下能力适合放入未来的个性化页面，并通过 `useTheme()` 即时应用：

- 主题模式、语义颜色、图表颜色、侧栏颜色。
- 渐变起点、中点、终点和光晕色。
- 正文/标题/等宽字体、字号、字重。
- 圆角、动效、对比度和其他界面偏好。

以下项目选项会改变生成的组件源码或依赖，属于构建时配置，不能作为普通运行时主题切换：

- Nova、Vega、Maia 等 shadcn **Style**。
- Base UI 与 Radix UI 等组件原语库。
- Lucide 等图标库。
- `components.json` 中供 CLI 生成组件使用的 `baseColor`。

`baseColor` 可作为项目生成时的默认中性色；运行时页面表面颜色仍由本模块的语义 CSS 变量控制。

## 在组件中使用

```tsx
import { useTheme } from "@/theme"

export function Example() {
  const { config, resolvedTheme, setTheme, updateConfig } = useTheme()

  setTheme("system")

  updateConfig({
    palettes: {
      light: {
        primary: "#00c853",
        gradient: {
          glow: "color-mix(in oklab, #00c853 62%, transparent)",
        },
        charts: {
          chart1: "#00c853",
        },
        sidebar: {
          primary: "#00c853",
        },
      },
    },
    typography: {
      bodyFontFamily: "'Inter Variable', sans-serif",
      headingFontFamily: "'Geist Variable', sans-serif",
    },
    shape: {
      radius: 0.75,
    },
  })

  return (
    <span>
      {resolvedTheme}: {config.typography.fontSize}px
    </span>
  )
}
```

`updateConfig` 接受深层局部更新，未传字段保持不变。`importTheme` 接受 `exportTheme` 生成的 JSON；导入数据会经过枚举、范围和 CSS 值校验。

## 开发约束

1. 业务组件只使用 shadcn/Tailwind 语义类，例如 `bg-primary`、`text-foreground`、`border-border`、`font-heading`，禁止写死品牌色或直接读取主题对象。
2. 图表使用 `var(--color-chart-1)` 至 `var(--color-chart-5)`；侧栏使用 `sidebar-*` 语义类；装饰背景使用 `gradient-*` 语义色或 `--gradient-*` 变量。
3. 主题只能通过 `useTheme()` 修改。页面或组件不得直接操作根元素、主题 `localStorage` 或 `.dark`。
4. 新增全局个性化字段时，依次更新 `types.ts`、`config.ts`、`runtime.ts`；如影响 Tailwind 映射，再更新 `styles.css`。
5. 修改配置结构时同步更新默认值和规范化逻辑。浅色和深色值必须成对维护并检查可读性。
6. 页面和表单属于消费方，不放进本目录。只有出现多个同类文件时，再按 `components/`、`hooks/` 等职责拆分。
7. `components.json` 继续指向 `src/index.css`；该文件是 shadcn 注册入口，主题实现由它导入 `styles.css`。

## 参考规范

- [Tailwind CSS Theme variables](https://tailwindcss.com/docs/theme)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [shadcn Create](https://ui.shadcn.com/docs/changelog/2025-12-shadcn-create)
