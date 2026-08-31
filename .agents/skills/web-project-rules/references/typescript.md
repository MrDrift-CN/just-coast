# TypeScript 规范

## 适用范围

适用于 `web` 中所有 TypeScript 和 TSX 自有代码。

## 编译基线

- 必须保持 `strict`、未使用代码检查和当前项目启用的安全编译选项。
- 禁止通过关闭严格模式、扩大 `exclude` 或添加全局宽松声明绕过类型错误。
- 新代码必须使用 TypeScript；自有 React 源码不得新增 `.jsx` 文件。
- 代码必须符合当前 TypeScript 可擦除语法限制，避免依赖会生成额外运行时代码的旧式 TypeScript 特性。

## 类型推断与显式类型

- 局部变量和简单返回值应优先使用可靠的类型推断。
- 导出的函数、组件 Props、公共 Hook、API 边界和持久化结构必须具有明确、稳定的类型。
- 不得为显而易见的字面量重复标注类型。
- 不得依靠过长的推断链隐藏公共接口；当类型成为模块契约时必须命名。

## `interface` 与 `type`

- 可扩展的对象契约、组件 Props 和服务接口优先使用 `interface`。
- 联合类型、交叉类型、映射类型、元组和工具类型组合使用 `type`。
- 同一类职责必须保持一致，禁止仅为风格在 `interface` 与 `type` 之间来回转换。
- 上游生成代码可以保留其原有类型声明方式。

## 禁止不安全类型

- 禁止在自有代码中使用显式 `any`。
- 无法预知的外部输入必须先使用 `unknown`，经过类型收窄或运行时验证后才能使用。
- 禁止使用双重断言绕过类型系统，例如 `value as unknown as Target`。
- 禁止通过宽泛索引签名掩盖未知字段。
- 确需表达动态键时，应约束键和值的实际范围。

## 类型断言和空值

- 类型断言统一使用 `value as Type`，不得使用尖括号断言。
- 仅当运行时事实已由代码保证而类型系统无法推断时使用断言。
- 非空断言 `!` 必须有明确不变量支撑；能够通过控制流收窄时禁止使用。
- 可缺省字段、显式空值和未初始化状态必须区分，不能随意混用 `null` 与 `undefined`。
- 使用可选链不能掩盖本应处理的缺失状态。

## 类型设计

- 状态存在多个互斥阶段时使用可辨识联合，避免一组可能互相矛盾的布尔值。
- 字面量集合优先使用 `as const` 对象或联合类型，不新增传统 `enum`。
- 禁止使用 `namespace` 组织业务代码。
- 泛型必须表达调用方与返回值之间的真实关系；只出现一次或无法形成约束的泛型应移除。
- 类型参数使用能表达职责的名称；简单通用工具可使用 `T`，多个参数应使用 `TInput`、`TResult` 等名称。
- 不得把 API 原始响应类型直接当作 UI 领域模型长期使用。

```ts
type RequestState<TData> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: TData }
  | { status: "error"; error: AppError };
```

## 函数和对象

- 参数超过三个或多个参数类型相同时，应考虑使用具名参数对象。
- 公共函数不得使用含义不明的布尔位置参数。
- 不修改输入对象；需要变化时返回新对象或显式使用可变数据结构。
- 只读契约使用 `readonly`，但不得为所有局部对象机械添加只读包装。
- 回调参数和返回值必须精确，不使用 `Function`、`object` 或空对象类型代替具体契约。

## React 类型

- 组件 Props 必须命名，并保持最小职责。
- 事件处理器使用 React 提供的具体事件类型。
- `children` 只在组件确实支持组合内容时声明，不默认给所有组件添加。
- 不使用 `React.FC` 隐式扩大组件契约；组件直接声明 Props 参数和返回 JSX。
- ref 类型必须与实际 DOM 元素或公开句柄一致。

## 外部数据边界

- API 响应、`localStorage`、URL 参数、环境变量和第三方消息均视为不可信输入。
- TypeScript 类型标注不能替代运行时校验。
- 解析失败必须返回明确错误或安全默认值，不能用断言假装数据有效。
- 领域类型转换应集中在请求层、存储适配器或专用解析函数中。

## 抑制类型错误

- 禁止使用 `@ts-ignore`。
- 只能在已确认编译器限制或第三方声明错误时使用 `@ts-expect-error`，并在同一行说明原因。
- 禁止提交无错误时仍然存在的 `@ts-expect-error`。
- 第三方类型问题优先通过局部适配解决，不得污染全局类型。

## 项目案例

以下案例覆盖本文件全部规则章节。代码用于说明类型边界；省略的运行时校验实现必须由项目实际适配器提供。

### 案例：保持严格且使用可擦除语法

**覆盖**：严格编译、安全选项、TypeScript 新代码、禁止 `.jsx`、避免生成额外运行时代码的旧语法。

```ts
// ❌ 为迁就错误关闭检查，新增运行时 enum
// tsconfig: { "strict": false }
enum ThemeMode {
  Light,
  Dark,
}

// ✅ 保持严格并使用可擦除的字面量类型
const THEME_MODES = ["light", "dark", "system"] as const;
type ThemeMode = (typeof THEME_MODES)[number];
```

新增组件应为 `theme-picker.tsx`，不能通过新增 `theme-picker.jsx` 绕开类型检查。

### 案例：推断只服务于局部，类型服务于契约

**覆盖**：局部推断、导出接口显式类型、避免重复标注、公共推断链命名。

```ts
// ❌ 字面量重复标注，公共返回契约却隐藏在长推断链中
const retryCount: number = 3;
export const loadSession = () =>
  fetchSession().then(mapDto).then(addPermissions);

// ✅ 局部值推断，公开边界命名
const retryCount = 3;

export interface SessionResult {
  session: AuthSession;
  permissions: readonly Permission[];
}

export async function loadSession(): Promise<SessionResult> {
  return addPermissions(mapDto(await fetchSession()));
}
```

### 案例：`interface` 与 `type` 各司其职

**覆盖**：对象契约、Props、联合与工具类型、一致性、上游例外。

```ts
interface FieldPasswordProps {
  value: string;
  onChange: (value: string) => void;
}

type AuthStatus = "anonymous" | "loading" | "authenticated";
type EditableAccount = Pick<Account, "displayName" | "locale">;
```

同一组自有 Props 不应在没有契约变化时反复从 `interface` 改为 `type`。上游生成组件已有的类型形式保持不动。

### 案例：从 `unknown` 开始收窄

**覆盖**：禁止 `any`、双重断言、宽泛索引签名，动态键和值必须受约束。

```ts
// ❌ 类型系统被完全绕开
function readLocale(value: any) {
  return (value as unknown as Locale).toUpperCase();
}

// ✅ 未知输入经过运行时守卫
const SUPPORTED_LOCALES = ["zh-CN", "en-US"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    SUPPORTED_LOCALES.some((locale) => locale === value)
  );
}

function readLocale(value: unknown): Locale {
  return isLocale(value) ? value : "zh-CN";
}

type LocaleLabels = Record<Locale, string>;
```

`Record<string, any>` 会掩盖拼写错误；只有实际允许任意字符串键时才使用索引签名，并约束值类型。

### 案例：断言、非空与缺失状态

**覆盖**：`as` 语法、断言依据、非空不变量、`null`/`undefined` 区分、可选链不能吞掉缺失状态。

```ts
// ❌ 断言替代控制流，缺失 Provider 会在更远处失败
const root = document.getElementById("root")!;
const locale = settings?.locale;

// ✅ 在边界建立运行时不变量
const root = document.getElementById("root");
if (!root) throw new Error("Application root element is missing");

const locale = settings?.locale;
if (!locale) return { status: "missingLocale" } as const;
```

可选字段用 `undefined` 表示未提供；只有协议明确使用 `null` 表示“已知为空”时保留 `null`，不能随意混用。

### 案例：让非法状态不可表示

**覆盖**：可辨识联合、`as const`、禁止 `enum`/`namespace`、有效泛型、DTO 与领域模型分离。

```ts
// ❌ 布尔值可能同时为真
interface RequestFlags {
  isLoading: boolean;
  hasData: boolean;
  hasError: boolean;
}

// ✅ 状态互斥且每个阶段携带正确数据
type RequestState<TData> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: TData }
  | { status: "error"; error: AppError };

function first<TItem>(items: readonly TItem[]): TItem | undefined {
  return items[0];
}
```

如果泛型只写成 `function log<T>(value: string)` 且 `T` 与参数和返回值无关，应删除它。API 的 `UserDto` 先经过适配再变为 `User`，不能长期直传 UI。

### 案例：具名参数与不可变输入

**覆盖**：参数数量、布尔位置参数、输入不可变、适度 `readonly`、精确回调契约。

```ts
// ❌ 多个同型参数和布尔位无法从调用点理解，并修改输入
function createUser(
  name: string,
  email: string,
  locale: string,
  silent: boolean,
) {}
function enableFirst(items: User[]) {
  items[0].enabled = true;
  return items;
}

// ✅ 调用契约具名且返回新值
interface CreateUserInput {
  name: string;
  email: string;
  locale: Locale;
  notificationMode: "notify" | "silent";
}

function enableFirst(items: readonly User[]): User[] {
  return items.map((item, index) =>
    index === 0 ? { ...item, enabled: true } : item,
  );
}
```

回调写成 `(result: LoginResult) => void`，不要使用 `Function`、`object` 或 `{}`。

### 案例：精确的 React 契约

**覆盖**：命名 Props、具体事件、按需 `children`、禁用 `React.FC`、正确 ref。

```tsx
interface FormLoginProps {
  onSubmit: (email: string) => void;
}

export const FormLogin = ({ onSubmit }: FormLoginProps) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget).get("email")?.toString() ?? "");
  };

  return <form onSubmit={handleSubmit}>{/* fields */}</form>;
}
```

没有组合内容的 `FormLogin` 不声明 `children`。输入框 ref 应为 `HTMLInputElement`，而不是宽泛的 `HTMLElement`。

### 案例：外部数据在边界校验

**覆盖**：API、存储、URL、环境变量、第三方消息，明确失败与集中转换。

```ts
function parseStoredTheme(rawValue: string | null): ThemePreference {
  if (rawValue === null) return "system";
  if (isThemePreference(rawValue)) return rawValue;
  return "system";
}

function toUser(dto: UserDto): User {
  return {
    id: parseUserId(dto.id),
    displayName: parseDisplayName(dto.display_name),
  };
}
```

给 `JSON.parse()` 的结果写 `as Settings` 不是校验；解析和领域转换应留在存储适配器或请求适配层。

### 案例：局部处理第三方类型缺陷

**覆盖**：禁止 `@ts-ignore`，受控 `@ts-expect-error`，避免全局污染。

```ts
// ❌ @ts-ignore
thirdPartyWidget.open(options);

// ✅ 第三方声明遗漏了运行时已支持且已有测试的属性；升级依赖后删除此行。
// @ts-expect-error -- upstream type omits the documented placement option
thirdPartyWidget.open({ placement: "inline-end" });
```

优先写一个局部适配器收窄第三方输入输出。只有确认为编译器或第三方声明问题时才使用 `@ts-expect-error`，并让编译器在问题消失时提示清理。
