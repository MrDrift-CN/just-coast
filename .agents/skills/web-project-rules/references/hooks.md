# Hooks 规范

## 适用范围

适用于 `web` 中所有 React 内置 Hook 和自定义 Hook 的使用。

## 基本规则

- Hook 只能在函数组件或自定义 Hook 顶层调用。
- 禁止在条件、循环、嵌套函数、事件回调或异常处理块中调用 Hook。
- 自定义 Hook 名称必须以 `use` 开头，文件使用小驼峰并与 Hook 同名。
- 普通工具函数不得使用 `use` 前缀伪装成 Hook。
- Hook 调用顺序必须稳定，不得依赖运行时分支。

## Hook 职责

- 一个 Hook 应封装一个可以清楚命名的状态或副作用职责。
- 页面或组件专属的简单 State、派生值和事件处理默认留在其最近拥有者中；只有形成独立且内聚的 React 状态、生命周期、订阅、并发或清理职责时才提取 Hook。
- Hook 不要求必须有多个调用方；单一调用方的复杂生命周期也可以形成边界，但必须减少调用方需要理解的时序或状态知识。
- 禁止创建只调用另一个 Hook、转发相同参数、重命名操作或重排返回字段的薄包装 Hook，除非它同时建立了稳定公共契约或新增领域规则。
- 不得创建汇总大量无关能力的万能 Hook。
- 只复用纯计算时应提取普通函数，不应创建 Hook。
- Hook 不得隐藏调用方必须理解的重要副作用。
- 页面特有 Hook 放在对应功能目录；跨功能复用且语义稳定后再移动到共享 `hooks` 目录。

## Effect 使用边界

Effect 只用于将 React 状态与外部系统同步，例如：

- 订阅和取消订阅外部事件。
- 同步浏览器 API 或非 React 控件。
- 根据已提交状态执行网络交互。
- 维护必须与组件生命周期一致的外部资源。

以下情况不得使用 Effect：

- 根据 Props 或 State 计算派生值。
- 响应用户点击等明确事件。
- 重置可通过组件 key 或状态结构解决的内部状态。
- 串联多个只为更新彼此状态的 Effect。
- 把渲染逻辑延迟到下一次渲染。

## 依赖数组

- Effect、Memo 和 Callback 的依赖必须完整、真实。
- 禁止通过关闭依赖检查、删除依赖或使用空数组掩盖闭包问题。
- 对象或函数导致 Effect 频繁运行时，应先移动创建位置、缩小依赖或重构职责。
- 不得为了让依赖数组“稳定”而无依据地缓存所有值。
- Effect 中只使用一次的辅助函数优先定义在 Effect 内部。

## 清理与并发

- 订阅、计时器、事件监听和外部资源必须返回对称的清理函数。
- 清理函数只能撤销对应 Effect 建立的资源，不执行无关业务逻辑。
- 异步操作必须支持取消或忽略过期结果，避免旧响应覆盖新状态。
- 请求类 Hook 应接受或内部维护 `AbortSignal`，组件卸载和请求替换时停止无效工作。
- 禁止仅使用“组件是否已挂载”的旧式标志掩盖未清理的资源。
- 在开发模式重复执行 Effect 时，逻辑仍必须正确且可重复。

## 返回契约

- 返回值必须稳定、明确并易于解构。
- 具有固定且公认顺序的少量值可以返回元组，并使用 `as const` 保留位置类型。
- 包含多个操作或将来可能独立扩展的值应返回具名对象。
- Hook 不得每次渲染无意义地创建庞大对象图。
- 是否稳定函数引用应由调用契约决定，不得让调用方猜测。

## `useMemo` 与 `useCallback`

- 不以“看起来更快”为理由预先添加缓存。
- 只有计算成本已确认较高、引用稳定性是子组件或依赖契约的一部分，或性能测量证明有收益时使用。
- 缓存依赖必须完整；缓存内容不得产生副作用。
- 不使用 `useMemo` 保证语义正确性，代码在缓存失效时仍必须正确。
- 移除无收益缓存时不得改变组件行为。

## `useRef`

- ref 用于 DOM 引用、跨渲染保存但不驱动界面的可变值或外部实例。
- 界面需要响应的值必须使用 State，不得藏在 ref 中。
- 禁止在渲染期间随意读写影响输出的 ref。
- 对外公开 ref 句柄时只暴露调用方真正需要的最小能力。

## 浏览器状态 Hook

- 访问 `localStorage`、`matchMedia`、`document`、剪贴板等 API 前必须检查可用性并捕获异常。
- 初始状态必须有安全默认值，不能因浏览器策略或损坏数据使应用无法启动。
- 本地存储解析或其他昂贵初始计算使用 `useState(() => initialValue)` 惰性执行；简单字面量不需要包装。
- 跨标签页同步必须验证事件来源和解析结果。
- 监听全局浏览器事件应集中管理，避免每个组件重复注册。

## 错误处理

- Hook 应返回调用方能够渲染或处理的结构化错误，不向 UI 泄漏原始未知异常。
- 不能恢复的异常应交由明确的错误边界或上层流程处理。
- Hook 内部日志不得包含敏感输入。
- 禁止捕获异常后只返回空数据，使错误与真实空状态无法区分。

## 项目案例

以下案例覆盖本文件全部规则章节。示例以 React 19 函数组件和项目浏览器环境为基线。

### 案例：Hook 调用顺序稳定

**覆盖**：顶层调用、禁止条件/循环/回调/异常块、`use` 命名、普通函数边界。

```tsx
// ❌ 条件改变 Hook 顺序
if (isAuthenticated) {
  const session = useSession();
}

// ✅ 始终调用，由 Hook 或渲染分支处理状态
const session = useSession();
if (!session.isAuthenticated) return <LoginPage />;
```

自定义 Hook 写在 `useSession.ts` 并导出 `useSession`。纯格式化函数叫 `formatSession`，不能为了形式命名为 `useFormatSession`。

### 案例：Hook 只封装一个职责

**覆盖**：可命名职责、提取门槛、单一调用方边界、禁止薄包装与万能 Hook、纯计算提取函数、副作用可见、功能私有到稳定共享。

- ❌ `useEverything()` 同时处理登录、主题、语言、窗口大小和 Toast。
- ❌ `useLogin()` 只调用 `useAuthAction(action)` 并把 `execute` 改名为 `login`；页面应直接使用原 Hook 或保留局部提交状态。
- ✅ `useLogin()` 管理登录请求的取消、过期结果、错误和会话更新，`useTheme()` 管理主题；纯粹的错误码映射使用 `mapAuthError()` 普通函数。
- 边界：只有一个页面使用的 `useLogin()` 仍可保留，但它必须隐藏上述独立生命周期；“将来可能复用”或文件变长不构成理由。
- ✅ 认证页面专用 Hook 先留在 `src/auth/hooks`；只有跨功能复用且语义稳定后才迁移到 `src/hooks`。
- ✅ Hook 名称和返回契约应让调用方知道它会订阅、持久化或发请求，不能把重要副作用藏在看似读取值的 `useLabel()` 中。

### 案例：派生值不需要 Effect

**覆盖**：Effect 只同步外部系统，以及派生值、事件、重置、Effect 链和延迟渲染等反例。

```tsx
// ❌ 多一次渲染并可能失去同步
const [fullName, setFullName] = useState("");
useEffect(() => setFullName(`${firstName} ${lastName}`), [firstName, lastName]);

// ✅ 渲染时派生
const fullName = `${firstName} ${lastName}`.trim();

// ✅ 用户事件中的副作用留在事件处理器
const handleSave = () => void saveProfile(draft);
```

重置完整子树可以改变稳定 `key`；不要串联多个 Effect 只为把 A State 复制到 B 再复制到 C。订阅 `matchMedia` 或同步非 React 编辑器才属于 Effect。

### 案例：真实依赖而非压制检查

**覆盖**：依赖完整、禁止空数组掩盖闭包、缩小职责、不过度缓存、Effect 内辅助函数。

```tsx
useEffect(() => {
  const controller = new AbortController();

  async function loadAccount() {
    await getAccount(accountId, { signal: controller.signal });
  }

  void loadAccount();
  return () => controller.abort();
}, [accountId]);
```

不要删除 `accountId` 或关闭依赖规则。若 options 对象导致重复运行，先把它移入 Effect 或只依赖实际字段；不能无依据地给页面所有函数加 `useCallback`。

### 案例：清理、取消和过期结果

**覆盖**：对称清理、清理职责、异步取消、`AbortSignal`、禁止 mounted 标志、开发重复执行安全。

```tsx
useEffect(() => {
  const controller = new AbortController();
  const unsubscribe = sessionStore.subscribe(handleSessionChange);

  void refreshSession({ signal: controller.signal });

  return () => {
    controller.abort();
    unsubscribe();
  };
}, []);
```

清理函数不能顺便注销用户或写业务数据。单纯用 `let mounted = true` 忽略结果却让请求继续运行不是资源清理。Effect 在开发模式建立、清理、再建立时仍应正确。

### 案例：返回契约选择元组或对象

**覆盖**：明确稳定、元组边界、具名对象、避免庞大对象、函数稳定性契约。

```ts
// ✅ 公认顺序、固定两个值
return [isOpen, setIsOpen] as const;

// ✅ 多个独立能力使用具名对象
return { status, session, login, logout, refresh };
```

不要返回包含整个页面状态的巨大对象。若 `login` 的引用稳定性会被依赖数组或 memo 子组件使用，Hook 必须明确并实现该契约；调用方不应靠猜测。

### 案例：只为已证明的收益缓存

**覆盖**：禁止预防性缓存、适用条件、纯缓存、语义不依赖缓存、可安全移除。

```tsx
// ❌ 简单拼接无收益
const label = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);

// ✅ 已测量的大列表排序可缓存，且无副作用
const sortedMessages = useMemo(
  () => messages.toSorted(byCreatedAt),
  [messages],
);
```

缓存丢失时结果仍必须正确。删除无收益的 `useMemo` 或 `useCallback` 不应改变行为，只改变性能特征。

### 案例：ref 不代替界面 State

**覆盖**：DOM/实例/非渲染值、界面响应、禁止渲染读写、最小公开句柄。

```tsx
const inputRef = useRef<HTMLInputElement>(null);
const requestIdRef = useRef(0);
const [isExpanded, setIsExpanded] = useState(false);
```

`isExpanded` 驱动 UI，不能藏进 ref。渲染期间不要修改 `requestIdRef.current` 来决定输出。公开编辑器 ref 时只暴露 `focus()` 等调用方真实需要的能力，不暴露内部实例全部方法。

### 案例：安全的浏览器状态 Hook

**覆盖**：能力和异常检查、安全默认、惰性初始化、跨标签校验、集中全局监听。

```tsx
const [locale, setLocale] = useState<Locale>(() => {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    return parseLocale(window.localStorage.getItem("preferences.language"));
  } catch {
    return DEFAULT_LOCALE;
  }
});
```

`storage` 事件的新值必须通过支持语言校验，并忽略无关 key。不要让每个语言按钮各自注册全局监听；由 i18n 基础层集中订阅。简单的 `useState(0)` 不需要惰性函数。

### 案例：错误与空状态分离

**覆盖**：结构化错误、不可恢复异常上交、日志脱敏、禁止把错误伪装为空。

```ts
type UseAccountsResult =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "success"; accounts: readonly Account[] }
  | { status: "error"; error: AppError };
```

Hook 把未知异常归一化为 `AppError`，不向 UI 暴露服务器堆栈；真正违反不变量的异常交给边界。日志只保留非敏感错误码，不记录令牌或用户正文。
