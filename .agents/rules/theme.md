# 主题开发规则

## 适用范围

本规则适用于 `web/src` 下所有页面、业务组件、共享组件、图表、装饰背景和全局
样式。主题能力必须对整个应用生效，不依赖未来是否实现个性化设置页面。

## 唯一事实来源与边界

- `web/src/theme` 是应用外观个性化和设计令牌的唯一基础层。
- `types.ts` 定义公开配置模型，`config.ts` 负责默认值、规范化、合并和
  序列化，`runtime.ts` 负责系统偏好与 CSS 变量同步，`provider.tsx` 负责
  React 状态和公开操作，`styles.css` 负责 Tailwind v4 与 shadcn 语义令牌。
- `web/src/style` 只存放不依赖具体页面的全局排版和样式能力。
- 页面、表单和设置界面是主题系统的消费方，不得放入 `src/theme`。

## 必须遵守

1. 业务组件必须使用 shadcn/Tailwind 语义类，例如 `bg-background`、
   `bg-primary`、`text-foreground`、`text-muted-foreground`、
   `border-border` 和 `ring-ring`。
2. 图表使用 `chart-*` 语义令牌，侧栏使用 `sidebar-*` 语义令牌，装饰性
   渐变使用 `gradient-*` 语义色或 `--gradient-*` CSS 变量。
3. 字体、字号、字重、圆角、动效、对比度和颜色必须消费主题令牌，不在业务组件
   中复制主题配置。
4. 运行时主题读取和修改统一通过 `useTheme()` 及其公开 API。
5. 浅色和深色主题值必须成对维护，并分别检查文本、边框、焦点、禁用和危险状态
   的可读性。
6. 组件优先复用已有 `variant` 和 `size`；新增可复用外观差异时在组件变体
   中实现，不在各调用点重复覆盖。
7. 新增全局主题能力时，必须按“类型 → 默认配置与校验 → 运行时 CSS 变量 →
   Tailwind/shadcn 映射 → 公共 API”的顺序完整接入。
8. 主题配置只保存可验证、可序列化的数据。字体配置只保存 CSS 字体族，字体资源
   必须由应用另行加载。

## 禁止事项

- 禁止在业务组件中写死品牌色、十六进制/RGB/HSL/OKLCH 颜色或使用原始
  Tailwind 色板代替语义令牌。
- 禁止通过 `dark:` 编写浅色/深色颜色分支；颜色模式由主题变量切换。
- 禁止业务代码直接修改根元素 class、dataset、CSS 变量、主题本地存储或
  `.dark`。
- 禁止业务组件直接读取主题配置对象来拼接颜色样式；应消费已映射的语义类或
  CSS 变量。
- 禁止把 shadcn Style、组件原语库、图标库或 `components.json.baseColor`
  当作运行时主题选项；这些属于构建时配置。
- 禁止为单一页面新增全局主题令牌。只有具有跨场景语义和复用价值的视觉属性才能
  进入主题系统。
- 禁止通过无效兜底吞掉非法主题配置；输入必须经过现有规范化和校验流程。

## 扩展流程

1. 判断需求是运行时个性化能力、全局样式能力，还是页面局部布局。
2. 只有运行时个性化能力进入 `src/theme`；全局排版进入 `src/style`；页面
   布局保留在组件内部。
3. 新增字段时同步更新 `types.ts`、`config.ts` 和 `runtime.ts`；需要
   Tailwind 类名时再更新 `styles.css` 与公共出口。
4. 修改配置结构时同步更新默认值、深层合并、规范化、导入/导出和重置行为。
5. 新增颜色时先确定语义名称，再为浅色与深色提供值，最后由组件消费语义令牌。

## 验收清单

- `npm run format`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- 检查系统、浅色和深色模式。
- 检查主题持久化、跨标签页同步、首次加载是否闪烁以及重置/导入行为。
- 检查键盘焦点、文本对比度、减少动效、响应式布局、图表和渐变。
- 检查业务源码中没有新增硬编码颜色、原始色板或直接主题状态操作。

## 参考

- [Tailwind CSS Theme variables](https://tailwindcss.com/docs/theme)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
