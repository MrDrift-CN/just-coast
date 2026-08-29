# 代码注释与文档规范

## 适用范围

适用于 `web` 自有源代码、测试、脚本、配置和仓库内开发文档。出现以下任一场景时必须读取本文件：

- 新增、修改或删除代码注释、文档注释、TSDoc、`TODO`、`FIXME` 或规则抑制说明。
- 设计或修改导出函数、组件、Hook、类型、服务、配置、持久化结构或其他公开契约。
- 实现兼容处理、迁移逻辑、临时绕行、并发控制、生命周期清理、安全边界或非显然不变量。
- 修改会影响使用方式、运行行为、配置、构建、部署、API、存储或维护流程的内容。

`web/src/components/ui` 与 `web/src/components/assistant-ui` 属于上游或生成边界，默认保留其原有注释；只有任务明确要求修改该源码时才应用本文件中的最小改动规则。

## 基本原则

- 自有代码注释和仓库内开发文档默认使用简体中文；标识符、类型名、协议字段和工具要求的指令语法保持原样。
- 代码负责表达“做什么”，注释负责补充代码和类型不能可靠表达的“为什么”、契约、限制、风险和移除条件。
- 注释必须提供新的决策信息。重复函数名、逐行翻译语句、复述类型或描述显然控制流的注释必须删除。
- 如果职责、命名或控制流可以直接消除解释需求，必须先简化代码，再判断是否仍需注释。
- 注释放在它所约束的最小代码范围附近；跨模块契约放在稳定公开入口或相应仓库文档中，不能散落为多个不一致版本。
- 修改代码时必须同步检查邻近注释；注释与实际行为不一致视为代码缺陷，不能以“稍后更新”交付。
- 禁止用注释保留废弃实现、变更历史、作者签名或大段被注释掉的代码；这些信息由 Git 记录。
- 禁止在源代码、生效规则和项目开发文档中写入外部规范链接作为裁决依据；应把经过项目适配的结论直接写清楚。

## 强制文档覆盖

- 每个自有具名函数都必须在声明前使用 TSDoc 说明职责，包括导出函数、私有辅助函数、React 组件、自定义 Hook、事件处理器，以及赋值给标识符的箭头函数或函数表达式。
- 每个自有数据模型都必须有 TSDoc，包括 `interface`、`type`、类、DTO、领域模型、Props、状态、配置和解析结果；模型中的每个字段、联合分支和具有独立含义的成员也必须说明业务语义或约束。
- 每个自有模块级常量都必须有 TSDoc，包括默认值、限制值、键名、映射表、选项集合和正则表达式；文档必须说明常量在项目中的用途或约束来源。
- 普通局部变量不是模块契约，不要求仅因使用 `const` 声明就添加文档；但局部具名函数仍属于函数，必须写 TSDoc。
- 一次性、单表达式且没有独立职责的匿名内联回调可以不单独写文档。匿名回调一旦包含分支、多个语句、副作用、异常处理或可复用语义，必须提取为具名函数并按函数规则编写 TSDoc。
- `index.ts` 中的纯重导出不重复复制来源声明的文档；调用方应在实际声明位置读取唯一权威说明。
- 上游或生成文件继续遵循本文件的上游边界，不得为满足覆盖率而批量补写项目文档。

强制覆盖不等于允许占位注释。文档必须说明职责、业务含义、输入输出契约、限制或维护边界中的至少一项；禁止只写“函数”“数据模型”“常量”“字段”或把标识符翻译成中文。

## 必须注释的场景

以下信息无法通过命名、类型或结构充分表达时，必须写短而具体的注释：

- 反直觉但有意保留的实现，以及不能采用常见写法的项目原因。
- 业务不变量、前置条件、单位、时区、排序稳定性、缓存身份或数据所有权等容易被误改的契约。
- 兼容旧数据、旧浏览器、第三方缺陷或发布迁移的临时路径，并说明删除条件。
- 异步竞态、过期结果、取消、订阅、计时器、资源释放和 Effect 清理中的非显然时序。
- 权限、隐私、日志脱敏、富文本、文件、URL、可访问性等安全或用户保护边界。
- 有意忽略的无害失败、规则抑制或无法由类型系统表达的运行时事实，并说明安全依据。

注释不能代替正确的类型、运行时校验、错误处理、测试或可访问实现。需要通过测试固定的行为仍必须测试。

## TSDoc 与公开契约

- 使用 `/** ... */` 编写 TSDoc；普通局部解释使用 `//`。禁止用多行 `//` 模拟公开 API 文档。
- 所有自有具名函数、数据模型与字段、模块级常量都必须具有 TSDoc；公开与私有只影响文档内容，不影响是否需要文档。
- 文档首句必须直接说明职责或契约，不能使用“函数”“数据模型”“常量”等只复述声明种类的占位描述。
- `@param` 只补充取值含义、单位、约束、所有权或默认行为，不重复参数名和 TypeScript 类型。
- `@returns` 只说明调用方需要知道的结果语义、身份稳定性、缓存或特殊状态，不重复 `Promise<T>` 等签名信息。
- `@throws` 只记录调用方可以预期且需要处理的错误条件；不得用“其他运行时错误”概括所有未知异常。
- `@remarks` 用于副作用、生命周期、并发、性能、安全、兼容或迁移信息；内容简单时不添加空的 `@remarks` 区块。
- `@template` 仅在泛型角色或约束不直观时使用；`@example` 仅在正确调用方式容易误解时使用。
- `@deprecated` 必须同时给出替代方案和迁移或删除条件，不能只有“已废弃”。
- 不机械添加 `@public`、`@readonly`、`@since`。可见性与只读性由 TypeScript 表达；版本历史由 Git 和发布记录管理。只有项目实际接入的文档或发布工具消费这些标签时才允许使用。
- 接口字段、Props、联合分支和常量成员必须逐项说明业务语义、默认行为或约束；即使语义简单也不得省略，但禁止生成“参数一”“是否启用”式占位复述。

## React、Hook 与 Effect

- 组件文档只记录调用方必须知道的受控/非受控行为、组合限制、焦点、可访问性或副作用，不解释 JSX 逐层结构。
- Hook 文档必须在需要时说明 Provider 前置条件、返回值稳定性、订阅所有权、取消语义和调用方清理责任。
- Effect 内的注释必须解释外部同步或时序原因，不能用注释掩盖本可在渲染阶段计算的派生状态。
- JSX 分区注释只用于难以通过组件拆分表达的大型语义区域；诸如 `{/* Header */}`、`{/* Content */}` 的显然布局标签必须删除。

## 待办、缺陷与抑制指令

- `TODO` 必须包含具体后续动作和可验证的触发或删除条件；已有内部任务时使用 `TODO(JC-编号)` 关联。
- `FIXME` 只标记已知正确性或安全缺陷，并说明当前影响和修复方向；不能把它当作长期接受缺陷的方式。
- 禁止模糊标记，如 `TODO: optimize`、`FIXME later`、`XXX`，也禁止只写人员姓名而没有可执行条件。
- `@ts-expect-error`、ESLint 或 Stylelint 抑制必须限制在最小行范围，并在指令后写明已验证原因和移除条件。
- 禁止使用 `@ts-ignore`，禁止无说明的文件级规则关闭，也禁止用抑制指令隐藏自有代码中可以修复的问题。
- 依赖升级、兼容条件消失或相关代码变化时，必须重新验证并删除已经失效的待办、绕行和抑制。

## 安全、隐私与示例数据

- 注释、TSDoc、示例和仓库文档不得包含令牌、密码、Cookie、完整请求头、私密用户内容、真实个人信息或可复用的生产凭据。
- 安全相关注释应描述必须维持的不变量和威胁边界，不能公开不必要的攻击细节或把注释当作权限控制。
- 示例值必须使用明显虚构且不可用的数据；敏感字段仅写结构或脱敏形式。
- 有意忽略异常时，注释必须说明为什么失败无害、对用户和数据的影响，以及何时需要升级为显式处理。

## 仓库文档同步

- 修改公开行为、配置项、环境变量、构建命令、路由、主题机制、持久化键、API 契约或开发流程时，必须在同一变更更新最近且权威的仓库文档。
- 局部实现细节留在代码附近；跨模块使用方式、初始化步骤、迁移步骤和运维约束写入对应 README 或项目文档，不能只藏在实现注释中。
- 文档中的命令、路径、配置名和示例必须与当前仓库可执行状态一致；复制模板后必须删除不适用于本项目的占位内容。
- 仅修改实现细节且公开契约、使用方式和维护流程均未变化时，不强制制造文档变更，但必须确认现有文档没有因此失真。

## 上游与生成内容

- 不为统一语言、格式或标签而批量改写上游或生成文件的注释。
- 自有需求优先通过自有包装组件、适配器或扩展点记录契约；不要把项目说明持续堆入官方源码。
- 必须直接修改上游源码时，只在非显然的本地补丁附近添加最短说明，写清项目原因与可验证的移除条件，并保持该文件原有风格。
- 生成文件的注释应修改生成源或生成器；禁止只修生成结果而让下次生成覆盖。

## 审查要求

- Code Review 必须把新增、修改、删除和邻近注释与代码一起审查，检查其必要性、准确性、范围和维护成本。
- 自动修复、重构、迁移或依赖升级后，必须搜索受影响的 `TODO`、`FIXME`、抑制指令、兼容说明和仓库文档。
- 交付前确认不存在过期注释、注释代码、模板占位、敏感信息、无依据抑制或与实现冲突的示例。

## 项目案例

以下案例覆盖本文件全部规则。示例只展示与注释契约有关的关键代码，省略部分不构成类型、测试或错误处理的例外。

### 案例：解释原因而不是翻译代码

**覆盖**：默认语言、信息增量、优先简化、最小作用域、同步维护、禁止注释代码和外部裁决链接。

```ts
// ❌ 读取语言
const locale = readLocale();

// ❌ 旧实现，先留着以后可能用
// const locale = window.localStorage.getItem("locale");

// ✅ 旧键兼容只保留一个发布周期；迁移指标归零后删除回退读取。
const locale = readLocaleWithLegacyFallback();
```

如果函数名已经完整表达行为，就不添加注释。涉及多个模块的语言迁移契约应写入仓库迁移文档，代码附近只保留当前分支的原因和删除条件。

### 案例：按语义编写 TSDoc

**覆盖**：TSDoc 语法、强制覆盖、首句职责、禁止占位复述，以及按需使用 `@param`、`@returns`、`@throws`、`@remarks`、`@template` 和 `@example`。

```ts
// ❌ 复述声明、类型和所有未知错误
/**
 * 函数。
 * @param userId - string 类型的参数。
 * @returns 返回 Promise<User>。
 * @throws {Error} 发生任何错误时抛出。
 */
export async function loadUser(userId: string): Promise<User> {
  return userService.load(userId);
}

/**
 * 加载当前工作区中可展示的用户资料。
 *
 * @remarks
 * 响应会经过权限过滤；结果不得写入跨用户共享缓存。
 * @param userId - 已通过路由参数校验的用户标识。
 * @throws {UserNotFoundError} 用户不存在或当前账号不可见时抛出。
 */
export async function loadVisibleUser(userId: UserId): Promise<User> {
  return userService.loadVisible(userId);
}
```

即使 `formatDisplayName` 的名称、类型和实现足够清楚，也必须写职责摘要；清楚的签名只意味着不需要机械补充 `@param` 和 `@returns`。

### 案例：函数、模型和模块常量完整覆盖

**覆盖**：公开与私有具名函数、组件、Hook、事件处理器、数据模型及字段、模块级常量、局部变量、匿名回调、纯重导出和上游边界。

```ts
/** 登录密码的最少字符数；表单约束与请求校验必须复用此值。 */
export const PASSWORD_MIN_LENGTH = 8;

/** 浏览器校验通过后的登录字段。 */
export interface LoginFormValues {
  /** 用于认证并接收账号通知的邮箱地址。 */
  email: string;

  /** 尚未加密传输前的原始密码，不得写入日志或持久化。 */
  password: string;
}

/** 从原生表单中读取登录字段，缺失或非文本值按空字符串处理。 */
export function parseLoginFormData(formData: FormData): LoginFormValues {
  const email = formData.get("email");
  const password = formData.get("password");

  return {
    email: typeof email === "string" ? email : "",
    password: typeof password === "string" ? password : "",
  };
}

// ❌ 多语句匿名回调隐藏了独立职责
button.addEventListener("click", async () => {
  const values = parseLoginFormData(new FormData(form));
  await submitLogin(values);
});

/** 提交当前登录表单，并把失败交给页面级错误边界处理。 */
async function handleLoginClick(): Promise<void> {
  const values = parseLoginFormData(new FormData(form));
  await submitLogin(values);
}

button.addEventListener("click", handleLoginClick);
```

函数体中的 `email`、`password` 和 `values` 是普通局部变量，不要求逐个写文档；`items.map((item) => item.id)` 这类一次性单表达式匿名回调也不单独写 TSDoc。匿名回调包含分支、多个语句、副作用或可复用语义时，必须像 `handleLoginClick` 一样提取并记录职责。

`index.ts` 的纯重导出不复制来源声明的文档。`web/src/components/ui`、`web/src/components/assistant-ui` 和生成文件继续遵循上游边界，不得为满足覆盖要求批量改写。

### 案例：不机械复制文档标签

**覆盖**：`@deprecated` 替代与删除条件，限制 `@public`、`@readonly`、`@since`，字段注释只补充真实语义。

```ts
// ❌ 模型没有职责说明，字段注释只是翻译标识符
interface IncompleteLocalePreference {
  // ❌ 语言。
  locale: Locale;
}

/** 用户界面的语言与时区偏好。 */
interface LocalePreference {
  /** 用于界面翻译与区域格式化的语言。 */
  locale: Locale;

  /** IANA 时区；缺省时使用浏览器解析结果，不代表 UTC。 */
  timeZone?: string;
}

/**
 * 读取旧存储结构中的语言值。
 *
 * @deprecated 改用 `readLocalePreference`；旧存储键迁移完成后删除。
 */
export function readLanguage(): Locale {
  return readLocalePreference().locale;
}
```

本项目不是需要给每个导出生成版本化 API 文档的公共库，因此不为上述成员补 `@public`、`@readonly` 或 `@since`。

### 案例：解释 Hook 的时序边界

**覆盖**：必须注释的不变量、兼容与迁移、异步竞态、清理、安全边界，以及组件、Hook、Effect 和 JSX 注释边界。

```tsx
/** 创建当前查询的可取消请求，并返回终止该请求的清理函数。 */
function subscribeToAccountSearch(query: string): () => void {
  const controller = new AbortController();

  void searchAccounts(query, { signal: controller.signal });

  return () => controller.abort();
}

/** 在查询变化时替换账号搜索请求，避免过期响应覆盖当前结果。 */
export function useAccountSearch(query: string) {
  useEffect(() => subscribeToAccountSearch(query), [query]);
}

// ❌ JSX 结构本身已经清楚
return (
  <main>
    {/* Header */}
    <AccountHeader />
    {/* Content */}
    <AccountList />
  </main>
);
```

如果 Hook 只能在特定 Provider 下使用或返回函数身份有稳定性承诺，应在 Hook 的 TSDoc 中记录；派生值应直接计算，不能用“同步状态”注释合理化多余 Effect。

### 案例：可执行待办与最小抑制

**覆盖**：`TODO`、`FIXME`、禁止模糊标记、最小化抑制、禁止 `@ts-ignore`、移除条件和依赖升级复查。

```ts
// ❌ TODO: optimize
// ❌ @ts-ignore
thirdPartyWidget.open(options);

// TODO(JC-142): 后端提供稳定 errorCode 后删除临时状态码映射。
const errorCode = normalizeLegacyStatus(response.status);

// 第三方声明遗漏运行时已支持且已有测试的 placement；升级该依赖后删除抑制。
// @ts-expect-error -- upstream type omits the verified placement option
thirdPartyWidget.open({ placement: "inline-end" });
```

如果发现该调用在运行时也不受支持，就必须修复实现，不能继续保留抑制。已知会造成数据错误的 `FIXME` 必须说明影响并进入明确修复范围。

### 案例：注释不能代替安全实现与测试

**覆盖**：注释不能代替类型、校验、错误处理、测试和可访问性；安全隐私边界、虚构示例和受控忽略异常。

```ts
// ❌ 已经校验过，肯定安全
renderRichText(input as SafeHtml);

// ✅ 这里只记录不可绕过的边界，安全性仍由实际净化和测试保证。
const safeHtml = sanitizeRichText(input);
renderRichText(safeHtml);
```

文档示例使用 `token_example_invalid` 和 `person@example.invalid`，不得粘贴真实令牌或用户资料。只有失败不会改变数据且用户无需恢复时才允许忽略异常，并在就近注释中写明这一安全依据。

### 案例：行为变化时同步权威文档

**覆盖**：文档同步范围、局部与跨模块信息归属、文档可执行性、模板清理和无需制造文档变更的边界。

- 修改主题持久化键：同步存储适配器、迁移测试和主题文档中的键名及迁移步骤。
- 新增环境变量：同步类型声明、校验逻辑、示例配置和启动文档，不能只在读取变量的代码旁写注释。
- 仅把私有局部变量改为更准确的名称，行为和公开契约未变：检查现有文档后可不修改文档。
- 从其他项目复制说明时：删除不存在的脚本、目录和占位符，并用本仓库可运行的命令验证。

### 案例：保护上游和生成边界

**覆盖**：保留上游注释、自有包装优先、最小本地补丁、生成源修复，以及审查和交付清理。

- ❌ 为统一成中文，批量改写 `src/components/ui` 和 `src/components/assistant-ui` 的官方注释。
- ✅ 在自有 `AccountDialog.tsx` 包装组件中记录项目特有的焦点恢复契约，官方组件保持不动。
- ✅ 必须修改官方源码时，只在补丁旁说明本项目的兼容原因和删除条件；上游能力满足需求后复查并移除。
- ✅ 生成文件的注释有误时修改模板或生成器并重新生成；Code Review 同时检查输出中不存在旧注释、占位内容和无依据抑制。
