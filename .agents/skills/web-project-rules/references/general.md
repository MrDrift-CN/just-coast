# 通用开发规范

## 适用范围

适用于 `web` 中所有自有源代码、脚本和配置。上游或生成组件的例外以规则总入口中的边界为准。

## 格式与编码

- 必须使用 UTF-8 和 LF 换行。
- 必须由项目 Prettier 统一格式化，不得手工建立另一套引号、分号、缩进或换行规则。
- 禁止在功能变更中夹带无关的全文件格式化、排序或重命名。
- 单个变更必须聚焦于一个可独立说明和验证的目标。

## 文件命名

自有源码文件必须使用驼峰命名：

- React 组件、页面和 Error Boundary 使用大驼峰，例如 `LoginPage.tsx`、`PasswordField.tsx`。
- Hook、工具、服务、配置模块和普通脚本使用小驼峰，例如 `useTheme.ts`、`formatMessage.ts`、`authService.ts`。
- 测试文件沿用被测文件名，例如 `PasswordField.test.tsx`。
- 类型声明文件使用小驼峰，例如 `authTypes.ts`；全局声明可使用约定文件名 `vite-env.d.ts`。
- barrel 文件可以使用 `index.ts`，但不得为了缩短导入路径而创建层层 barrel。

`components/ui` 和 `components/assistant-ui` 中的官方源码保留原文件名，不执行驼峰重命名。

已有自有文件不符合命名规则时，应在相关功能修改或独立重构中迁移；禁止为统一名称一次性制造不可审查的大规模重命名。

## 标识符命名

- 变量、函数和实例使用小驼峰。
- React 组件、类、类型和接口使用大驼峰。
- 真正常量使用全大写下划线；普通不可变局部变量仍使用小驼峰。
- 布尔值使用能够表达真假含义的前缀，如 `is`、`has`、`can`、`should`。
- 事件处理函数使用 `handleXxx`，对应的回调属性使用 `onXxx`。
- 禁止无上下文缩写、单字母业务变量和不能表达职责的名称，如 `data1`、`obj`、`temp`、`handle`。
- 名称应准确表达当前职责，不得为猜测中的未来扩展使用过度泛化名称。

## 导入

- `web/src` 内部模块必须使用 `@/` 别名，包括同级、父级、样式和资源导入。
- 禁止使用 `./` 或 `../` 导入项目内部模块。
- 类型专用导入必须使用 `import type`。
- 导入必须位于模块顶部。确有代码分割需要时可以使用动态导入。
- 禁止循环依赖。
- 禁止从其他功能模块的内部文件越层导入；模块应暴露稳定的公开入口。
- 不得仅为追求导入行数更少而创建会扩大包体积或形成循环依赖的 barrel。

## 代码组织

- 一个函数只承担一个可以清楚命名的职责。
- 优先使用提前返回降低嵌套层级。
- 禁止嵌套三元表达式；复杂条件应拆为具名变量、分支或独立函数。
- 避免隐式副作用。修改外部状态、读写存储或发起请求的函数应通过名称和调用位置体现副作用。
- 不得实现当前需求之外的抽象、参数或扩展点。
- 重复代码只有在共享语义已经稳定时才提取；相似外形不等于相同职责。
- 删除废弃代码，不使用注释长期保留旧实现。

## 错误处理

- 禁止静默吞掉异常。
- 捕获异常后必须恢复、转换为项目错误、记录必要上下文或交给上层处理。
- 用户可恢复的错误必须提供可理解、可国际化的反馈。
- 浏览器存储、剪贴板、媒体查询等 API 可能不可用，调用必须包含能力检查和异常保护。
- 错误日志不得包含密码、令牌、完整请求头、用户私密内容或其他敏感数据。
- 禁止使用空的 `catch`；确需忽略时必须说明忽略理由，并保证不会掩盖数据损坏或安全问题。

## 注释与文档

- 注释主要解释“为什么”、限制条件、兼容原因和非显然风险，不重复描述代码字面行为。
- 如果代码需要长篇注释才能说明流程，应先尝试简化代码。
- `TODO` 必须说明待办事项和触发条件；能够关联任务时应附内部任务标识。
- 修改行为、配置、构建或使用方式时，必须同步更新仓库内相关文档。
- 禁止在源代码和生效规则中保留可能与项目结论冲突的外部规范链接。

## 项目标识与持久化

- `just-coast` 只用于面向用户的品牌展示和项目元数据。
- 禁止把品牌名作为变量、函数、组件、CSS 类、事件名或存储键的技术前缀。
- Cookie、缓存、消息键、环境变量、请求头、API 字段和数据库字段同样不得使用品牌技术前缀，除非字段内容本身表达产品名称。
- 持久化键必须描述数据职责，例如 `preferences.language`、`preferences.theme`。
- 修改已发布的持久化键时必须提供向后兼容读取和一次性迁移，不能直接导致用户设置丢失。

## 依赖与配置

- 新增依赖前必须确认现有依赖无法合理解决问题，并说明运行时体积、维护状态和安全影响。
- 禁止为一个简单函数引入大型依赖。
- 依赖版本和配置必须与当前 Node、Vite、React、TypeScript 和 ESLint 主版本兼容。
- 禁止通过降低检查强度、跳过脚本或扩大忽略范围掩盖代码问题。

## 项目案例

以下案例覆盖本文件全部规则章节。一个案例可以同时覆盖同一职责下的多条规则；示例省略的代码不构成例外。

### 案例：聚焦的格式化变更

**覆盖**：UTF-8、LF、Prettier、禁止无关格式化、单一变更目标。

- ❌ 修复登录按钮时，同时把 80 个无关文件改成另一种引号并重排全部导入。
- ✅ 只修改登录功能涉及的文件，使用项目 Prettier 格式化这些文件，并在提交前确认差异中没有换行符或编码噪声。
- 边界：独立的全仓格式化可以进行，但必须单独提交、说明原因并验证生成物和上游目录不会被意外改写。

### 案例：自有文件与上游文件命名

**覆盖**：组件、Hook、服务、类型、测试、barrel 命名，以及存量迁移和上游例外。

```text
❌ src/auth/components/password-field.tsx        新增自有组件继续使用短横线
❌ src/auth/helpers.ts                           职责模糊
❌ src/auth/index/index.ts                       层层 barrel

✅ src/auth/components/PasswordField.tsx
✅ src/auth/hooks/useLogin.ts
✅ src/auth/authService.ts
✅ src/auth/authTypes.ts
✅ src/auth/components/PasswordField.test.tsx

✅ src/components/ui/alert-dialog.tsx             保留官方文件名
✅ src/components/assistant-ui/thread.tsx          保留官方文件名
```

已有 `password-field.tsx` 只有在相关功能修改或独立重构中才原子迁移为 `PasswordField.tsx`，并同步更新全部导入；不得顺手批量重命名整个 `auth` 目录。

### 案例：能够表达职责的标识符

**覆盖**：大小驼峰、小驼峰、常量、布尔值、事件命名、禁止模糊缩写和过度泛化。

```ts
// ❌ 含义不清，回调和属性无法对应
const data1 = await load();
const flag = data1.length > 0;
const handle = () => submit(data1);

// ✅ 名称直接说明当前职责
const loginMethods = await loadLoginMethods();
const hasLoginMethods = loginMethods.length > 0;
const handleSubmit = () => submitLoginMethods(loginMethods);

const DEFAULT_LOCALE = "zh-CN";
interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void;
}
```

不要把普通不可变局部变量写成 `LOGIN_METHODS`，也不要把当前只负责登录的函数命名为猜测性的 `processEverything`。

### 案例：项目内导入边界

**覆盖**：`@/` 别名、类型导入、顶部导入、动态导入、公开入口、循环依赖和 barrel 边界。

```ts
// ❌ 相对导入、越层读取内部实现、值导入类型
import { normalizeSession } from "../../auth/internal/sessionAdapter";
import { AuthSession } from "../auth/authTypes";

// ✅ 从稳定边界导入，类型使用 import type
import { normalizeSession } from "@/auth";
import type { AuthSession } from "@/auth";

// ✅ 只有代码分割确有需要时动态导入静态路径
const SettingsPage = lazy(() => import("@/settings/pages/SettingsPage"));
```

如果 `auth` 公开入口重新导出 `chat`，而 `chat` 又导入 `auth`，应调整职责或提取共享模块；不能再增加一层 barrel 或用延迟导入隐藏循环。

### 案例：职责、控制流与抽象时机

**覆盖**：单一职责、提前返回、禁止嵌套三元、显式副作用、不过度设计、稳定语义后再复用、删除废弃代码。

```ts
// ❌ 嵌套三元、职责混杂，并为未知未来预留模式
function handleAccount(account: Account, mode?: "login" | "export" | "future") {
  return account.disabled
    ? "disabled"
    : account.email
      ? writeStorageAndLogin(account, mode)
      : "missing";
}

// ✅ 先表达当前业务分支，副作用函数名称清晰
function getAccountAvailability(account: Account) {
  if (account.disabled) return "disabled";
  if (!account.email) return "missingEmail";
  return "available";
}

async function loginAccount(account: Account) {
  const availability = getAccountAvailability(account);
  if (availability !== "available") return availability;
  await persistSessionAndNavigate(account);
  return "authenticated";
}
```

两个表单当前只有 JSX 外形相似、校验语义不同，就先保留各自实现；当字段、错误和交互契约稳定一致后再提取共享组件。废弃实现直接删除，由 Git 历史追溯，不用注释保留。

### 案例：可恢复错误与浏览器能力

**覆盖**：异常不可静默、结构化处理、国际化反馈、浏览器能力检查、日志脱敏、受控忽略。

```ts
// ❌ 空 catch、直接记录敏感输入
try {
  await navigator.clipboard.writeText(password);
} catch {}
console.error({ password, token });

// ✅ 能力检查、可恢复结果和脱敏上下文
async function copyShareLink(
  shareUrl: string,
): Promise<"copied" | "unavailable"> {
  if (!navigator.clipboard?.writeText) return "unavailable";

  try {
    await navigator.clipboard.writeText(shareUrl);
    return "copied";
  } catch (error: unknown) {
    console.warn("Clipboard write failed", { cause: getErrorName(error) });
    return "unavailable";
  }
}
```

UI 根据结果展示国际化提示。只有能够证明失败无害时才允许忽略异常，并在注释中说明原因和安全边界。

### 案例：有价值的注释和同步文档

**覆盖**：解释原因、简化复杂流程、可执行 TODO、同步仓库文档、禁止在生效规则中保留外部规范链接。

```ts
// ❌ 获取语言
const locale = readLocale();

// ✅ 旧键只保留一个发布周期；全部活跃用户完成迁移后删除兼容读取。
const locale = readLocaleWithLegacyFallback();

// TODO(JC-142): 后端返回稳定 errorCode 后移除临时状态码映射。
```

如果主题持久化方式改变，代码、`src/theme/README.md`、迁移说明和相关测试应在同一变更中更新。外部资料只用于研究，不写入生效规则作为运行时裁决来源。

### 案例：品牌与持久化迁移

**覆盖**：品牌只用于展示、技术标识不加品牌前缀、职责型键名、已发布键兼容迁移。

```ts
// ❌ 品牌侵入技术契约，直接换键会丢失用户偏好
const JUST_COAST_THEME_KEY = "just-coast.theme";

// ✅ 键名表达职责，并兼容旧数据
const THEME_KEY = "preferences.theme";
const LEGACY_THEME_KEY = "just-coast.theme";

function readThemePreference() {
  return (
    readValidTheme(THEME_KEY) ?? readValidTheme(LEGACY_THEME_KEY) ?? "system"
  );
}

function persistThemePreference(theme: ThemePreference) {
  localStorage.setItem(THEME_KEY, theme);
  localStorage.removeItem(LEGACY_THEME_KEY);
}
```

页面标题可以展示 `just-coast`；变量名、CSS 类、请求头或消息键不应为了品牌化增加同名前缀。

### 案例：依赖和检查强度

**覆盖**：复用现有能力、评估体积维护与安全、版本兼容、禁止通过降级检查绕过问题。

- ❌ 为一个 `capitalize` 函数加入完整工具库，或因新插件报错就在 ESLint 中忽略整个 `src`。
- ✅ 先确认现有依赖和平台 API；确需引入依赖时记录用途、浏览器体积、维护状态、许可证、安全风险及与 React 19、Vite 8、TypeScript 6、ESLint 10 的兼容性。
- ✅ 类型失败时修复边界类型或局部适配第三方声明，不关闭 `strict`、不扩大 `exclude`、不跳过 CI。
