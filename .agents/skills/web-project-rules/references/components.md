# 组件设计规范

## 适用范围

适用于 `web/src` 中所有自有 React 组件，以及对 shadcn/ui、assistant-ui 组件的组合和包装。

## 组件分层

组件按职责分为：

1. **基础组件**：`components/ui` 中的上游 UI 原语。
2. **上游业务原语**：`components/assistant-ui` 中的官方交互组件。
3. **共享组件**：项目多个功能共同使用、具有稳定业务无关语义的自有组件。
4. **功能组件**：只服务于某一功能或页面的组件。
5. **页面组件**：负责页面编排、路由输入和功能组合，不承载大量可复用细节。

依赖只能从上层指向更基础层。基础组件不得反向依赖页面或具体业务功能。

## 组件职责

- 一个组件应有一个清晰的主要职责。
- 页面组件负责组合，不应包含大量低层 UI 细节。
- 当一段 JSX 具有独立语义、独立状态、重复使用或显著降低可读性时再提取组件。
- 不得把每个标签机械拆成组件。
- 不得创建没有稳定复用场景的“万能组件”。
- 组件 API 只覆盖当前明确需求，不预留猜测性的扩展参数。

## Props 契约

- Props 名称必须描述业务含义，而不是内部样式实现。
- 必填与可选必须反映真实调用约束，不得为省事把所有字段设为可选。
- 可选 Props 必须有清楚、稳定的默认行为。
- 避免多个互斥布尔 Props；使用可辨识联合或明确变体。
- 不传递组件可以自行计算或从已有 Context 安全获取的数据。
- 不把整个页面状态对象传给只需要一个字段的子组件。
- `className` 仅用于合理的布局和视觉扩展，不允许调用方破坏组件行为和无障碍状态。

## 组合与变体

- 优先使用组合而不是复制组件实现。
- 支持内容插槽时使用明确的 `children` 或具名插槽 Props。
- 有限视觉变体使用受控的变体 API，禁止调用处堆积互相覆盖的条件类。
- 行为差异较大时应拆分组件，不使用一个组件处理大量无关模式。
- 包装上游组件时只暴露项目实际允许的能力，不必机械透传其全部 Props。

## 状态归属

- 纯展示组件不拥有业务状态。
- 交互组件可以拥有只影响自身的瞬时 UI 状态。
- 需要被父级协调、路由恢复或持久化的状态必须提升到对应拥有者。
- 禁止同时在组件内部和外部维护同一事实。
- 受控组件必须通过值和回调完整表达状态变化；非受控组件必须提供明确初始值。

## 状态界面

涉及异步数据或用户操作的组件应根据实际场景覆盖：

- 初始状态。
- 加载状态。
- 空状态。
- 成功状态。
- 可恢复错误状态。
- 禁用或无权限状态。

这些状态必须保持布局、交互和可访问性一致。不得只通过颜色表达状态。

## 可访问性

- 首选原生语义元素和上游组件已有的无障碍能力。
- 自定义交互必须支持键盘、焦点、可访问名称和正确状态属性。
- Dialog、Popover、Menu 等浮层必须处理焦点进入、焦点返回和 Escape 关闭。
- 表单字段必须关联标签、描述和错误内容。
- 装饰图标对辅助技术隐藏；表达含义的图标必须具有文本等价物。
- 禁止通过删除焦点轮廓修复视觉问题。

## 国际化与主题

- 组件内部不得硬编码用户可见文案，包括占位符、Tooltip、Toast、ARIA 和图片替代文本。
- 组件必须容纳长度变化，不假设中文或英文固定字符数。
- 方向相关布局必须考虑从右到左语言，优先使用逻辑方向表达。
- 组件颜色必须使用主题语义令牌。
- 共享组件不得自行创建独立主题或语言状态。

## 上游和生成组件

- 不得批量覆盖 `components/ui` 与 `components/assistant-ui`。
- 不得为了符合自有文件命名规则重命名官方源码。
- 优先通过组合、包装、公开 Props、主题令牌和插槽完成定制。
- 必须直接修改时，只改实现目标所需的最小范围，并避免无关格式变化。
- 上游更新前必须检查本地差异，不能使用覆盖式更新丢失定制。
- 一旦组件被深度改造并失去安全更新能力，应明确转为自有组件并迁出上游目录。

## 项目案例

以下案例覆盖本文件全部规则章节。每个案例都以 `web/src` 的自有组件为主，并明确上游目录的例外边界。

### 案例：组件分层和依赖方向

**覆盖**：基础组件、assistant-ui 原语、共享组件、功能组件、页面组件，以及依赖只能指向更基础层。

```text
✅ src/components/ui/button.tsx                  官方基础组件
✅ src/components/assistant-ui/thread.tsx        官方聊天原语
✅ src/components/ConfirmActionDialog.tsx        跨功能共享的自有组合
✅ src/auth/components/LoginForm.tsx             认证功能组件
✅ src/auth/pages/Login.tsx                      页面编排
```

- ❌ 让 `components/ui/button.tsx` 导入 `auth/pages/Login.tsx`。
- ✅ `Login` 组合 `LoginForm`，`LoginForm` 再使用 `Button`；低层组件不知道页面和认证流程。

### 案例：什么时候提取组件

**覆盖**：单一职责、页面只编排、有意义提取、禁止机械拆分、万能组件和猜测性 API。

- ❌ `Login` 同时处理请求协议、密码显隐、Toast、路由跳转和 200 行低层表单 JSX。
- ✅ 页面组合 `LoginForm`；`useLogin` 管理提交职责；`PasswordField` 封装独立的密码交互语义。
- ❌ 为一个只出现一次的 `<span>` 创建 `LoginTextAtom`，或创建带 25 个模式 Props 的 `UniversalPanel`。
- ✅ 只有 JSX 具备独立语义、状态、稳定复用或能显著降低复杂度时提取；API 只支持当前登录需求。

### 案例：Props 是产品契约

**覆盖**：业务命名、真实必填性、默认行为、互斥状态、避免重复数据、最小输入、受控 `className`。

```ts
// ❌ 样式泄漏、互斥布尔和整页状态透传
interface NoticeProps {
  red?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  pageState?: AuthPageState;
}

// ✅ 受控变体与真实数据需求
type NoticeProps =
  | { tone: "success"; message: string }
  | { tone: "error"; message: string; retry?: () => void };
```

可选的 `retry` 表示错误可以没有重试入口，并具有清楚默认行为。组件能从 Locale Context 获取语言时不再传 `locale`。`className` 可以调整页面布局，但不能覆盖禁用、焦点或错误状态。

### 案例：组合、插槽与行为拆分

**覆盖**：优先组合、明确插槽、受控视觉变体、行为差异拆分、包装上游时缩小 API。

```tsx
<AuthShell title={t("login.title")} footer={<RegisterLink />}>
  <LoginForm />
</AuthShell>
```

- ❌ 复制一份 `Card` 实现只为换标题位置，或让 `AuthShell` 通过 `isLogin`、`isRegister`、`isReset` 控制三套无关流程。
- ✅ 外观差异使用有限 `variant`；流程差异明显时使用 `LoginForm`、`RegisterForm` 等独立组件。
- ✅ 包装 Dialog 时只暴露产品允许的 `open`、`onOpenChange` 和内容插槽，不机械透传所有内部 Props。

### 案例：状态只有一个拥有者

**覆盖**：展示组件、瞬时状态、协调/路由/持久化状态、禁止双份事实、完整受控与明确非受控契约。

- ✅ `PasswordField` 可以内部维护“是否显示密码”，因为只影响自身瞬时 UI。
- ✅ 登录完成后的跳转目标属于路由状态，由路由或页面拥有。
- ❌ 父组件传 `value`，子组件又把它复制到内部 State 并各自更新。
- ✅ 受控字段接收 `value` 和 `onChange`；非受控字段只接收 `defaultValue` 并明确不响应后续默认值变化。

### 案例：异步状态界面完整

**覆盖**：初始、加载、空、成功、可恢复错误、禁用/无权限，以及布局、交互和非颜色表达。

```tsx
switch (state.status) {
  case "idle":
    return <StartPrompt />;
  case "loading":
    return <MessageListSkeleton aria-label={t("messages.loading")} />;
  case "empty":
    return <EmptyMessages />;
  case "error":
    return <RetryNotice error={state.error} onRetry={reload} />;
  case "success":
    return <MessageList messages={state.data} />;
}
```

无权限状态应禁用或隐藏危险入口并说明原因，但真正授权仍由服务端完成。错误不能只把边框变红；同时提供文本和可访问关联。

### 案例：组件无障碍契约

**覆盖**：原生语义、键盘、焦点、浮层焦点管理、表单关联、图标语义、焦点轮廓。

```tsx
<Label htmlFor="email">{t("login.emailLabel")}</Label>
<Input
  id="email"
  aria-describedby={error ? "email-error" : undefined}
/>
{error ? <p id="email-error">{t(error.messageKey)}</p> : null}
```

- ❌ 用 `div` 模拟按钮，删除 outline，或打开 Dialog 后焦点仍留在背景页面。
- ✅ 使用原生按钮或上游无障碍原语；浮层处理进入焦点、Escape 和关闭后的焦点返回。
- ✅ 装饰图标 `aria-hidden="true"`；有独立含义的图标提供翻译后的文本等价物。

### 案例：国际化、RTL 与主题

**覆盖**：所有文案、长度变化、逻辑方向、语义颜色、禁止组件自建主题/语言状态。

```tsx
<Button
  className="border-border text-foreground"
  aria-label={t("actions.next")}
>
  <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
</Button>
```

Tooltip、Toast、`alt` 和 ARIA 文案同样来自资源。布局不得用固定字符宽度假定中文更短；方向由全局 locale 配置提供。共享组件不能再读取一份自己的 `localStorage.language` 或创建独立暗色状态。

### 案例：上游组件的最小定制

**覆盖**：禁止覆盖和重命名、优先公开扩展点、最小直接修改、更新差异、所有权迁移。

- ❌ 运行组件更新命令覆盖整个 `components/ui`，没有检查本地差异。
- ✅ 更新前查看差异；通过自有包装、Props、插槽和主题变量完成定制。
- 边界：直接修改官方源码时只改目标所需行并记录原因。若长期深改到无法安全更新，则迁出上游目录、改为大驼峰自有组件并承担完整维护责任。
