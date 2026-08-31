# CSS / Tailwind 规范

## 适用范围

适用于 `web` 中自有组件样式、全局样式、主题样式和 Tailwind 类名。上游组件目录可以保留其生成样式，但新增自定义内容仍应遵守本规范。

## 样式体系

- 默认使用 Tailwind CSS 4 工具类和项目语义主题变量。
- 全局基础样式、字体、主题令牌和跨组件动画分别放入项目已有的全局或主题样式入口。
- 禁止在业务组件中引入新的 CSS-in-JS 方案或第二套原子样式系统。
- 只有无法通过现有 Tailwind 和主题体系清晰表达的跨元素样式，才使用自有 CSS。

## 项目样式边界

- `src/index.css` 只作为全局样式入口，负责导入 Tailwind、主题和全局样式模块。
- `src/theme` 是主题状态、持久化、系统偏好和设计令牌的唯一基础层。
- `src/style` 只保存不依赖具体页面的全局排版和样式能力。
- 页面和组件负责自身布局，不把页面布局写入 `src/theme` 或 `src/style`。
- 组件优先使用已有 `variant` 和 `size`，不得在调用处重复实现组件外观。
- 布局间距优先使用 `gap-*`；等宽高使用 `size-*`；单行截断使用 `truncate`。
- Dialog、Sheet、Popover、Tooltip 等浮层使用已有层级系统，不手写任意 z-index。

## Typeset

- Markdown 和其他语义化 HTML 内容统一使用 `typeset` 排版能力。
- 不为每一种 HTML 标签在业务组件中重复编写排版类。
- 不应受到排版样式影响的组件使用 `not-typeset` 或 `data-not-typeset` 隔离。
- 页面负责内容宽度和布局，Typeset 只负责内部排版。
- 更新 `typeset.css` 必须作为独立、可审查的样式变更，禁止夹带功能修改。

## 主题与颜色

- 自有业务代码必须使用语义令牌表达背景、前景、边框、强调、危险、静音和焦点状态。
- 图表使用 `chart-*`，侧栏使用 `sidebar-*`，装饰渐变使用 `gradient-*` 或对应 CSS 变量。
- 字体、字号、字重、圆角、动画时长和对比度使用项目主题或设计尺度，不在调用处复制全局配置。
- 禁止在业务组件中直接使用 Tailwind 原始调色板颜色。
- 禁止在 JSX、TS、TSX 中写十六进制、RGB、HSL、OKLCH 等硬编码颜色。
- 禁止在业务组件中使用 `dark:` 复制一套颜色；亮暗模式差异应由语义变量解决。
- 新增颜色需求必须先判断是否属于已有语义；确需新增时同时定义亮色和暗色值。
- 图表、插画或数据可视化确需非主题色时，应集中定义具名色板，不散落硬编码值。

## 类名组合

- 条件类名统一通过项目 `cn()` 工具组合。
- 禁止用字符串拼接动态构造 Tailwind 类名，例如 `` `text-${color}-500` ``。
- 有限样式变体使用静态映射，确保构建工具能够发现完整类名。
- 可复用组件的变体应集中定义，不在每个使用位置重复长条件表达式。
- Tailwind 类名顺序交给 Prettier 插件处理，不进行手工争论。

## 布局与响应式

- 优先使用正常文档流、Flexbox 和 Grid。
- 禁止用大量绝对定位拼装主要页面布局。
- 响应式设计从最小视口开始，按内容需要增加断点，不按具体设备品牌写断点。
- 容器宽度、间距和排版应使用项目设计尺度，避免相近但不一致的任意值。
- 使用动态视口单位时必须考虑移动端地址栏变化和安全区域。
- 内容必须允许文本放大、长翻译和系统字体差异，禁止依靠固定高度容纳正文。

## CSS 文件与选择器

- 自有样式文件使用全小写 kebab-case 命名。
- 选择器保持低特异性，优先类和语义属性。
- 禁止通过 ID 选择器设计业务组件样式；应用挂载节点和根布局可以作为受控例外。
- 禁止依赖复杂 DOM 层级和过长后代选择器。
- 禁止修改上游组件内部不可公开依赖的选择器结构。
- 全局样式必须限制作用域，避免无意影响第三方和生成组件。

## `@import` 与 `!important`

- Tailwind CSS 4 的样式入口允许使用框架要求的 CSS `@import`。
- 其他自有 CSS 不得通过多层 `@import` 组织业务样式，避免隐藏加载顺序。
- 原则上禁止 `!important`。
- 为覆盖用户动画偏好而在 `prefers-reduced-motion` 中强制禁用动画属于允许例外。
- 覆盖无法通过公开接口控制的第三方样式时，必须限制作用域并说明原因，不能全局滥用 `!important`。

## 动画与交互

- 动画必须服务于状态变化和空间关系，不得阻碍操作。
- 必须支持 `prefers-reduced-motion`。
- 优先动画 `transform` 和 `opacity`，避免频繁触发布局和绘制的属性。
- 加载动画不得成为唯一状态提示。
- 焦点样式必须清晰可见，禁止在没有替代方案时移除 outline。

## 内联样式

- 静态样式使用 Tailwind 或项目 CSS，不使用 `style` 属性。
- 只有运行时计算的连续值、CSS 自定义属性或第三方 API 明确要求时才使用内联样式。
- 内联值必须经过类型和范围约束，不能直接注入不可信字符串。

## 上游组件边界

- `components/ui` 和 `components/assistant-ui` 的官方类名、文件名和结构允许保留。
- 禁止为了统一自有风格而批量替换其类名或语义令牌。
- 上游组件需要全局视觉调整时，优先修改项目主题变量；需要特定行为时在自有组件中包装。

## 项目案例

以下案例覆盖本文件全部规则章节。示例中的类名以项目 Tailwind 4 和语义主题令牌为准。

### 案例：样式体系和目录边界

**覆盖**：Tailwind 与语义变量、全局入口、主题、全局排版、页面布局、自有 CSS 使用条件、禁止第二套体系。

```tsx
// ❌ 在业务组件引入新的 CSS-in-JS，并把页面布局写进 theme/styles.css
const Card = styled.div({ color: "#2563eb" });

// ✅ 页面拥有布局，组件使用现有 Tailwind 和主题能力
export const SettingsPage = () => {
  return <main className="mx-auto grid max-w-4xl gap-6 px-4 py-8" />;
}
```

- `src/index.css` 只导入 Tailwind、`theme/styles.css` 和全局样式模块。
- `src/theme` 维护主题状态与令牌，`src/style` 维护跨页面排版；页面私有布局留在页面组件。
- 只有现有工具类无法清晰表达的跨元素规则才新增 kebab-case CSS 文件。

### 案例：复用组件变体和布局工具

**覆盖**：`variant`/`size`、`gap-*`、`size-*`、`truncate`、浮层层级。

```tsx
// ❌ 重做按钮外观、用 space 管理兄弟间距并手写浮层层级
<div className="space-y-4">
  <Button className="h-10 w-10 bg-blue-600 text-white" />
  <DialogContent className="z-[9999]" />
</div>

// ✅ 使用组件 API 和项目布局约定
<div className="flex flex-col gap-4">
  <Button size="icon" variant="default" aria-label={openLabel} />
  <DialogContent />
  <p className="truncate">{title}</p>
</div>
```

### 案例：Typeset 负责排版而非页面布局

**覆盖**：语义内容、隔离、宽度职责、独立审查。

```tsx
// ❌ 为 Markdown 的每个标签重复写排版类
<article className="max-w-3xl"><h1 className="text-3xl font-bold" />{/* ... */}</article>

// ✅ 页面负责宽度，Typeset 负责内容排版
<main className="mx-auto max-w-3xl px-4">
  <article className="typeset">
    <MarkdownContent />
    <Toolbar className="not-typeset" />
  </article>
</main>
```

修改 `typeset.css` 时单独提交并审查全部语义标签影响，不能夹在登录功能修改中。

### 案例：语义颜色与双主题

**覆盖**：业务、图表、侧栏、渐变、设计尺度、禁止原始色板/硬编码/`dark:`、新增令牌双主题、可视化色板。

```tsx
// ❌ 原始色板、硬编码颜色和重复暗色分支
<div className="border-[#ddd] bg-white text-slate-900 dark:bg-slate-950" />

// ✅ 语义令牌自动响应主题
<div className="border-border bg-background text-foreground" />
<p className="text-destructive" />
<aside className="bg-sidebar text-sidebar-foreground" />
```

图表使用 `chart-*`，装饰渐变使用 `gradient-*`。确需新的 `warning` 语义时，同时定义亮色与暗色 CSS 变量并映射为 Tailwind 令牌；独立数据色板集中为具名配置，不能在每个 JSX 中散落 RGB 值。

### 案例：可分析的条件类名

**覆盖**：`cn()`、禁止动态拼接、静态映射、集中变体、Prettier 排序。

```tsx
// ❌ Tailwind 无法静态发现
const className = `text-${tone}-500`;

// ✅ 完整类名存在于静态映射
const toneClassName = {
  normal: "text-foreground",
  danger: "text-destructive",
} as const;

return <p className={cn("text-sm", toneClassName[tone], className)} />;
```

共享组件的大量变体集中在受控变体定义中；类名顺序交给 Prettier 插件，不进行手工排序争论。

### 案例：响应式和长文案

**覆盖**：文档流、Flex/Grid、移动优先、内容断点、设计尺度、动态视口与安全区、文本放大和长翻译。

```tsx
// ❌ 绝对定位主要布局并固定正文高度
<main className="relative h-[600px]"><section className="absolute left-[123px] top-[78px] h-20" /></main>

// ✅ 从小视口开始，内容驱动断点且正文可增长
<main className="grid min-h-dvh gap-4 px-4 pb-[env(safe-area-inset-bottom)] md:grid-cols-[16rem_1fr]">
  <Sidebar />
  <section className="min-w-0" />
</main>
```

断点不命名为某款手机；使用项目尺度，避免相近的任意像素值。放大文字或切换长语言后，关键操作仍必须可见。

### 案例：低特异性和受控全局样式

**覆盖**：kebab-case CSS 文件、类和属性选择器、ID 例外、禁止复杂层级、上游内部选择器、全局作用域。

```css
/* ❌ 依赖页面和上游内部 DOM */
#settings main > div > .dialog-content span:first-child {
  color: red;
}

/* ✅ 自有能力有明确作用域和低特异性 */
.accountSummary [data-status="error"] {
  color: var(--destructive);
}
```

`#root` 只能用于应用挂载或根布局等受控场景。不要通过深层选择器修改官方 Dialog 内部结构；优先使用公开 Props、slot 或包装组件。

### 案例：`@import` 与 `!important` 的边界

**覆盖**：Tailwind 入口例外、禁止多层业务导入、原则禁用 `!important`、reduced-motion 和第三方覆盖例外。

```css
/* ✅ 框架样式入口允许 */
@import "tailwindcss";

/* ✅ 用户明确减少动画时可以强制关闭 */
@media (prefers-reduced-motion: reduce) {
  .appMotion {
    animation: none !important;
    transition: none !important;
  }
}
```

业务 CSS 不应形成 `a.css -> b.css -> c.css` 的隐藏加载链。第三方样式只能在明确容器下最小覆盖并说明原因，不能使用全局 `* { ... !important }`。

### 案例：动画、焦点与状态表达

**覆盖**：动画目的、reduced-motion、优先 transform/opacity、非唯一加载提示、焦点可见。

- ❌ 用持续改变 `width` 的动画装饰页面，移除 `outline`，并只靠旋转图标表示加载。
- ✅ 用 `transform`/`opacity` 表达状态切换，为 reduced-motion 提供降级；加载同时具有文本或 `aria-busy`，焦点使用项目 `ring` 令牌清晰展示。

### 案例：受控内联样式

**覆盖**：静态样式归位、连续运行时值、自定义属性、第三方要求、类型与范围校验。

```tsx
// ❌ 静态样式和不可信字符串直接注入
<div style={{ color: userInput, padding: "16px" }} />

// ✅ 静态部分使用类，运行时连续值经过范围限制
const progress = Math.min(100, Math.max(0, rawProgress))
<div className="bg-primary" style={{ "--progress": `${progress}%` } as React.CSSProperties} />
```

### 案例：上游视觉定制

**覆盖**：保留官方类名和结构、禁止批量替换、优先主题与包装。

- ❌ 批量替换 `components/ui` 和 `components/assistant-ui` 中全部类名以满足自有排序偏好。
- ✅ 全局品牌视觉通过主题语义变量调整；某个产品行为通过自有包装组件完成。
- 边界：必须修改官方文件时只改最小目标范围，并保留其命名、无障碍和升级可比性。
