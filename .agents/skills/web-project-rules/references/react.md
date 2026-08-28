# React 规范

## 适用范围

适用于 `web` 中所有 React 19 自有组件。项目是 Vite 单页应用，不使用服务端组件、服务端渲染或框架专属约定。

## 组件定义

- 只使用函数组件和 Hooks 编写新组件。
- 组件文件使用大驼峰，并与主要导出组件同名。
- 一个文件只保留一个主要导出组件；仅服务于该组件的短小私有子组件可以同文件定义。
- 可复用组件优先使用具名导出；只有路由或既有加载约定明确需要时使用默认导出。
- 禁止新增 class component、mixins 和旧式生命周期实现。
- 不使用 `React.FC` 隐式声明组件契约。

## 路由与加载边界

- 路由实例、应用级配置和只执行一次的初始化必须在 React 树外创建。
- 按业务功能划分 React Router 的路由和加载边界，不能让无关页面承担大型功能依赖。
- 全局 Provider 只承载所有页面都需要的基础能力，业务 Provider 靠近对应路由。
- 路由懒加载以功能为粒度，不把每个轻量组件拆成独立 chunk。
- 动态导入路径必须能被 Vite 静态分析，禁止通过任意字符串拼接模块路径。
- 不在组件的空依赖 Effect 中重复初始化路由、主题、语言或其他全局服务。

## 渲染纯度

- 组件渲染必须是纯计算，相同 Props、State 和 Context 应产生相同结果。
- 不在组件函数内部声明新的组件类型；私有子组件提升到模块作用域并通过 Props 获取数据。
- Props 和 State 视为只读；排序或反转前创建副本，优先使用不会修改原数组的方法。
- 禁止在渲染期间修改对象、写存储、发请求、订阅事件或调用会改变外部状态的函数。
- 派生值应在渲染中计算；不得使用 Effect 将一个状态机械同步到另一个状态。
- 不得在渲染期间读取会产生不稳定结果的时间、随机数或可变全局状态，除非通过稳定输入传入。
- 初始化全局服务、主题和语言监听应在应用入口或专用提供器中完成，不能散落在页面组件中。

## Props 设计

- Props 必须最小、明确并反映组件能力，不直接传入庞大领域对象图省事。
- 布尔 Props 使用正向、可读名称，避免双重否定。
- 回调 Props 使用 `onXxx`，组件内部处理函数使用 `handleXxx`。
- 禁止无筛选地把 Props 展开到 DOM 元素，避免泄漏无效属性和事件。
- 默认值通过参数解构表达；不要使用已过时的函数组件 `defaultProps` 模式。
- 不得通过 Props 暴露组件内部实现细节。

## JSX

- JSX 必须保持浅层和可读，复杂计算在渲染前用具名变量或函数表达。
- 禁止嵌套三元表达式。
- 条件渲染必须避免数字 `0`、空字符串等值被意外渲染；条件不是布尔值时应显式转换。
- 无子元素的组件和元素使用自闭合形式。
- JSX 属性使用双引号，JavaScript 表达式使用花括号。
- 多行 JSX 使用括号包裹，并保持开始标签、属性和结束标签结构清晰。

## 列表与 key

- 列表项必须使用来自数据的稳定、唯一标识作为 `key`。
- 数据可以增删、排序或过滤时禁止使用数组索引作为 `key`。
- 禁止在渲染期间生成随机 key。
- 只有完全静态、不会重排且没有稳定标识的展示列表才可使用索引，并应局部说明约束。

## 状态与组合

- 状态放在能够拥有它的最低公共层级。
- 优先通过组合、`children` 和明确插槽扩展组件，不通过大量模式布尔值控制内部布局。
- 不把可以从 Props 或现有 State 得出的值重复存入 State。
- Context 只承载跨层级共享且语义稳定的状态，不作为所有局部状态的默认容器。
- 组件不得直接依赖不相关页面或功能模块的内部状态。

## 事件与表单

- 事件处理器传递函数引用，不得在 JSX 中立即调用。
- 表单必须明确受控或非受控策略，同一字段不能在两者之间切换。
- 表单提交、按钮操作和异步状态必须避免重复触发。
- 按钮必须显式设置正确的 `type`，避免在表单中意外提交。
- 错误、加载、成功和禁用状态必须在交互和视觉上保持一致。

## 可访问性与国际化

- 优先使用语义化 HTML，不使用可点击的 `div` 或 `span` 替代按钮和链接。
- 所有交互必须支持键盘操作和清晰焦点状态。
- 图标按钮必须具有可国际化的可访问名称。
- 表单控件必须有关联标签、错误说明和必要状态。
- 用户可见文字、占位符、标题、替代文本和 ARIA 文案不得硬编码。
- 页面语言和文字方向由国际化模块统一维护。

## 错误与边界

- 页面级或高风险功能应有合适的错误边界，避免单个渲染异常破坏整个应用。
- 错误回退界面必须允许用户恢复、重试或返回安全位置。
- 不使用错误边界替代普通请求错误和表单校验处理。

## 上游组件例外

`components/ui` 和 `components/assistant-ui` 可以保留上游的文件命名、类型形式和局部实现。自有功能不得复制上游内部实现后任意修改；需要行为差异时优先使用包装、组合和受控扩展点。

## 项目案例

以下案例覆盖本文件全部规则章节，默认均指自有 React 代码；官方生成组件只适用最后的边界案例。

### 案例：组件定义与导出

**覆盖**：函数组件、文件命名、单一主要导出、具名导出、禁止旧式组件和 `React.FC`。

```tsx
interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function PasswordField({ value, onChange }: PasswordFieldProps) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
}
```

该组件位于 `PasswordField.tsx`。不要在同一文件再导出无关的 `LoginForm`，也不要改成 class component 或 `React.FC<PasswordFieldProps>`。路由加载契约要求默认导出时可以局部使用默认导出。

### 案例：路由、Provider 和懒加载边界

**覆盖**：树外单例、功能路由、Provider 位置、功能粒度懒加载、静态路径、禁止空 Effect 初始化全局服务。

```tsx
// ✅ 路由实例在 React 树外创建，动态路径可被 Vite 分析
const SettingsPage = lazy(() => import("@/settings/pages/SettingsPage"));

export const router = createBrowserRouter([
  { path: "/settings", element: <SettingsPage /> },
]);
```

- ❌ 在 `App` 每次渲染时创建 router，或在每个页面的 `useEffect([])` 中分别初始化主题和语言。
- ✅ 全局主题与国际化 Provider 放在应用入口；只服务聊天页的 Provider 靠近聊天路由。
- ❌ 用 ``import(`@/pages/${pageName}.tsx`)``，或把每个图标都拆成一个 chunk。

### 案例：保持渲染纯净

**覆盖**：模块级组件类型、只读 Props/State、无副作用、派生值、稳定输入、集中全局初始化。

```tsx
// ❌ 修改 Props、渲染时写存储，并在父组件内创建组件类型
function UserList({ users }: { users: User[] }) {
  users.sort(byName);
  localStorage.setItem("lastRender", String(Date.now()));
  const Row = ({ user }: { user: User }) => <li>{user.name}</li>;
  return (
    <ul>
      {users.map((user) => (
        <Row key={user.id} user={user} />
      ))}
    </ul>
  );
}

// ✅ 派生数据是纯计算，子组件类型稳定
function UserRow({ user }: { user: User }) {
  return <li>{user.name}</li>;
}

function UserList({ users }: { users: readonly User[] }) {
  const sortedUsers = users.toSorted(byName);
  return (
    <ul>
      {sortedUsers.map((user) => (
        <UserRow key={user.id} user={user} />
      ))}
    </ul>
  );
}
```

当前时间或随机值需要影响 UI 时，由事件、State 或稳定 Props 提供；不要在渲染中直接读取并导致同一输入产生不同结果。

### 案例：最小 Props 契约

**覆盖**：业务命名、真实可选性、正向布尔、回调命名、禁止 DOM 泄漏、参数默认值、隐藏实现细节。

```tsx
interface SubmitButtonProps {
  isPending?: boolean;
  onSubmit: () => void;
}

function SubmitButton({ isPending = false, onSubmit }: SubmitButtonProps) {
  const handleClick = () => onSubmit();
  return (
    <Button type="button" disabled={isPending} onClick={handleClick}>
      {/* translated label */}
    </Button>
  );
}
```

- ❌ `red`, `notEnabled`, `internalState`, `buttonImplementation` 等 Props 暴露样式或内部细节。
- ❌ 把所有字段设为可选，或把包含权限、个人资料、设置的整个 `pageState` 传给只需要 `isPending` 的按钮。
- ❌ `{...props}` 无筛选展开到 DOM。

### 案例：可读 JSX 和可靠条件

**覆盖**：浅层 JSX、具名计算、禁止嵌套三元、显式布尔、自闭合、属性格式和多行结构。

```tsx
const hasMessages = messages.length > 0;
const content = hasMessages ? (
  <MessageList messages={messages} />
) : (
  <EmptyState />
);

return (
  <section aria-labelledby="thread-title">
    <h2 id="thread-title">{title}</h2>
    {content}
    <Separator />
  </section>
);
```

`{messages.length && <MessageList />}` 会在空数组时渲染 `0`；应改为显式布尔。复杂条件先命名或拆函数，不写嵌套三元。

### 案例：稳定列表 key

**覆盖**：数据标识、索引限制、随机 key、静态列表例外。

```tsx
// ❌ 排序后输入状态可能被复用到错误行
{
  accounts.map((account, index) => (
    <AccountRow key={index} account={account} />
  ));
}

// ❌ 每次渲染都卸载并重建
{
  accounts.map((account) => (
    <AccountRow key={crypto.randomUUID()} account={account} />
  ));
}

// ✅ 使用领域稳定标识
{
  accounts.map((account) => <AccountRow key={account.id} account={account} />);
}
```

只有永不增删、排序或过滤且确无标识的静态装饰列表可以局部使用索引，并写明约束。

### 案例：状态归属与组合

**覆盖**：最低公共层级、组合插槽、禁止重复 State、Context 边界、模块隔离。

- ❌ 同时存储 `firstName`、`lastName` 和 `fullName`，再用 Effect 同步。
- ✅ 只存储可编辑字段，渲染时计算 `fullName`。
- ❌ 为标题是否展开创建全局 Context，或让认证组件读取聊天页内部 store。
- ✅ 展开状态留在所属组件；主题、语言、认证等稳定跨层状态才进入职责明确的 Context。
- ✅ 布局差异通过 `children` 或具名插槽组合；行为完全不同的模式拆为不同组件，不叠加大量布尔 Props。

### 案例：表单与重复提交

**覆盖**：函数事件、受控策略、重复触发、按钮类型、完整状态反馈。

```tsx
function LoginForm() {
  const [email, setEmail] = useState("");
  const { t } = useTranslation("auth");
  const { submit, status, error } = useLogin();
  const isPending = status === "loading";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isPending) void submit({ email });
  };

  return (
    <form onSubmit={handleSubmit} aria-busy={isPending}>
      <Input
        value={email}
        onChange={(event) => setEmail(event.currentTarget.value)}
      />
      <Button type="submit" disabled={isPending}>
        {t(isPending ? "login.submitting" : "login.submit")}
      </Button>
      {error ? <FormError error={error} /> : null}
    </form>
  );
}
```

不要写 `onClick={submit()}`。同一字段不能先使用 `defaultValue`，后又切换为受控 `value`。

### 案例：语义、键盘和国际化

**覆盖**：语义 HTML、键盘、焦点、可访问名称、表单关联、所有可见与 ARIA 文案、页面语言方向。

```tsx
const { t } = useTranslation("common");

return (
  <Button type="button" aria-label={t("actions.close")} onClick={onClose}>
    <X aria-hidden="true" />
  </Button>
);
```

不要用带 `onClick` 的 `div` 代替按钮。表单错误应通过 `aria-describedby` 关联；焦点样式必须可见。`lang` 与 `dir` 由 i18n 基础设施统一更新，不由单个组件硬编码。

### 案例：错误边界与恢复

**覆盖**：页面级边界、恢复操作、区分渲染异常与普通业务错误。

- ❌ 让聊天渲染异常白屏整个应用，或把表单“密码错误”抛给 Error Boundary。
- ✅ 在高风险路由边界提供国际化回退、重试和返回安全页；普通 API、表单校验和空状态仍由组件状态显式渲染。

### 案例：上游组件定制

**覆盖**：保留官方形式、禁止复制改造、包装与最小修改。

- ❌ 为统一自有命名批量把 `components/ui/alert-dialog.tsx` 改名，或复制其实现到功能目录再任意删减无障碍逻辑。
- ✅ 在自有 `DeleteAccountDialog.tsx` 中组合官方 `AlertDialog`，通过 Props、插槽和主题令牌完成产品行为。
- 边界：官方组件没有必要扩展点时，只做目标所需的最小本地修改并明确后续更新风险。
