# API / 请求层规范

## 适用范围

适用于浏览器发出的 HTTP 请求、认证交互、第三方接口和请求数据到 UI 模型的转换。项目普通 JSON API 已统一使用 Axios；既有流式协议继续由其专用运行时或平台流读取能力负责，不因普通请求层接入 Axios 而强制迁移。

## 分层职责

请求相关代码按职责分离：

- **传输层**：`src/api/client.ts` 维护唯一 Axios 实例和传输异常归一化，`src/api/request.ts` 负责受限 URL、序列化、超时、取消和响应协议校验。
- **服务层**：按业务资源组织接口，定义输入输出和错误语义。
- **适配层**：校验响应并将 DTO 转换为领域模型。
- **状态层**：管理加载、缓存、重试和界面状态。
- **组件层**：触发操作并渲染结果，不解析协议细节。

这些层级表达责任边界，不要求每个请求都建立完整文件链。只创建当前实现确实需要的层；简单页面可以直接调用服务函数，只有出现独立 React 请求生命周期时才增加 Hook。

- 即使只有一个调用方，服务仍可因隔离真实 HTTP、第三方 SDK、序列化、响应校验或错误语义而独立存在。
- 禁止为猜测中的未来接入创建只转发参数、改名返回值、忽略输入或直接 `Promise.resolve()` 的空壳服务与适配器。
- 已有真实前端流程但后端尚未交付时，Mock 与真实 API 必须实现同一个类型安全契约，并通过唯一 Gateway 选择数据源；组件和状态层变量名不得因切换数据源而改变，也不得靠注释代码切换。Mock 不伪造可发送到真实服务的令牌、不持久化会话、不绕过安全校验；只有仍需人工决策的缺口才写 `TODO`。
- `pending`、页面导航、Toast、翻译和 JSX 属于 React 或产品交互层，不得为了“分层完整”移入服务。

组件不得重复实现状态码判断、鉴权头、JSON 解析和错误归一化。

## 请求函数

- 请求函数名称必须表达业务动作，例如 `getCurrentUser`、`updatePassword`。
- 输入和输出必须具有明确 TypeScript 类型。
- 可取消请求必须接受 `AbortSignal` 或由调用契约提供等效取消能力。
- 基础 URL 和环境相关配置集中读取，禁止在组件中拼接服务器地址。
- Query、Path 和 Body 参数必须按协议正确编码。
- 普通 JSON API 的业务服务必须调用 `src/api` 导出的 `request`，不得直接创建 Axios 实例或依赖 Axios 错误结构。
- 当前 Axios 实例允许 HTTP 响应进入协议包装器；`request` 必须显式检查真实 HTTP 状态，再校验响应体 `status` 与业务 `code`。
- 对无响应体、非 JSON 响应和解析失败分别处理，不能无条件调用 JSON 解析。

## 响应与错误

- 外部响应视为不可信数据，类型标注不能代替运行时校验。
- 请求层统一输出项目错误结构，至少区分网络、超时、取消、认证、权限、校验、限流、服务端和未知错误。
- UI 不直接依赖后端原始错误格式。
- 可展示消息使用稳定错误码映射到国际化资源，不直接展示服务器堆栈或内部消息。
- 取消请求不应被当作需要提示用户的普通失败。
- 错误对象应保留排查所需但不敏感的上下文。

## 并发、超时和重试

- 请求必须具有明确的生命周期，页面离开或输入变化时取消不再需要的请求。
- 搜索、联想等高频请求必须处理过期响应和必要的防抖。
- 超时必须根据操作性质设置，不能使用一个任意值覆盖所有请求。
- 自动重试仅适用于可安全重放的操作或具有幂等键保护的写操作。
- 认证失败、权限失败、参数错误和明确业务失败不得盲目重试。
- 重试应有限次、带退避，并允许用户主动重试。

## 认证与安全

- 认证方式由服务端安全模型决定，不在组件中自行保存或拼装令牌。
- 请求凭据、Cookie 策略和 CSRF 防护必须一致。
- 项目请求必须声明 `public`、`session`、`optional` 或 `required` 认证模式；省略时固定按 `public` 处理。
- `Authorization`、`X-User-Id` 与 `X-CSRF-Token` 只能由 `src/api/authentication.ts` 注入，业务调用方不得覆盖。
- `required` 请求必须同时具备有效真实 JWT 与用户标识；本地 `mockOnly` JWT 禁止发送到真实服务。
- JSON 请求使用 `request`；SSE、流式响应和原始 `Response` 使用 `fetchRequest`，两者必须共享同一认证解析能力。
- 禁止在 URL Query 中传递密码、访问令牌或敏感个人信息。
- 禁止在日志中记录完整请求头、认证信息、密码和原始敏感响应。
- 跨域请求只发送必要凭据，不使用无约束的通配配置。

## DTO 与领域模型

- API DTO 与 UI 使用的领域模型分离。
- 字段重命名、日期解析、可空值处理和默认值在适配层集中完成。
- 不将后端未使用字段透传到整个组件树。
- 日期和时间在传输层保持明确格式和时区语义，展示时再本地化。
- 金额、精度敏感数字和标识符不得未经确认转换为会丢失精度的 Number。

## 变更与兼容

- 新增 API 时应同时提供至少一个真实使用位置，避免提交未使用接口。
- 协议字段变更必须同步更新类型、运行时校验、适配器、错误映射和测试。
- 破坏性变更需要明确迁移路径，不能让新旧结构在组件中长期分支。
- 临时兼容逻辑必须集中并具有移除条件。

## 测试要求

- 测试请求成功、非成功状态、解析失败、取消和超时。
- 测试 DTO 到领域模型的关键转换。
- 写操作应覆盖重复提交、错误恢复和重试边界。
- 测试使用可控替身，不依赖不稳定的真实外部服务。

## 项目案例

以下案例覆盖本文件全部规则章节。示例以项目当前 `src/api` Axios 包装层和统一响应信封为基线，业务服务不得绕过该边界。

### 案例：请求职责逐层收窄

**覆盖**：传输、服务、适配、状态和组件层，按需分层，单一调用方服务，禁止空壳边界，以及禁止组件解析协议。

```text
api/client.ts                  唯一 Axios 实例、基础 URL、传输异常归一化
api/authentication.ts          认证模式、受保护请求头和认证提供者契约
api/request.ts                 JSON、HTTP/信封校验和 401 单次重试
api/fetch-request.ts           SSE、流式响应和原始 Response
auth/services/contract.ts      Mock/API 共同认证契约
auth/services/api.ts           真实认证接口实现
auth/services/mock.ts          同契约的完整内存模拟
auth/services/gateway.ts       唯一数据源选择
auth/session.ts                Session、JWT、CSRF 生命周期
auth/pages/login.tsx           页面组合与场景渲染
auth/components/form-login.tsx 渲染字段并触发页面动作
```

上图是当前认证实现的职责地图，不是所有功能必须复制的文件模板。只有对应职责真实存在时才添加适配器或 Hook；`FormLogin` 不应重复判断 401、拼 Authorization、依赖 Axios 错误结构或理解 DTO 字段名。

- ❌ 为尚未接入的邮件服务创建忽略参数并返回固定 `Promise.resolve()` 的 `requestPasswordResetEmail`，再增加 Hook 包装该空壳。
- ✅ 已有注册、登录或密码重置页面需要贯通时，模拟实现放在 `auth/services/mock.ts`，与 `api.ts` 实现同一 `AuthGateway`；页面始终调用 `services/index.ts`，切换后端时不改页面变量名。
- ✅ 仅有静态预览、尚无真实交互流程时，行为先与唯一页面或演示适配器共置，不为猜测中的接口制造服务层。

### 案例：通过项目请求层读取并校验响应

**覆盖**：业务命名、明确类型、取消、集中 URL、参数编码、HTTP 状态、空体/非 JSON/解析失败。

```ts
interface GetCurrentUserOptions {
  signal?: AbortSignal;
}

export async function getCurrentUser({
  signal,
}: GetCurrentUserOptions = {}): Promise<UserDto> {
  const response = await request("/users/me", {
    method: API_REQUEST_METHOD.get,
    signal,
    timeoutMs: 8_000,
    parseData: parseUserDto,
  });

  return response.data;
}
```

查询参数使用 `request` 的 `query` 契约，路径段由具体服务正确编码。服务器基础地址由唯一客户端集中读取，组件不能写字面量服务器地址或直接处理传输细节。`request` 先以真实 HTTP 状态判定传输结果，再核对 `{ code, status, message, data }` 信封并调用当前接口的 `parseData`。

### 案例：项目错误而非后端原文

**覆盖**：不可信响应、统一错误分类、UI 解耦、国际化映射、取消语义、脱敏上下文。

```ts
type AppError =
  | { kind: "network"; code: "networkUnavailable" }
  | { kind: "timeout"; code: "requestTimedOut" }
  | { kind: "authentication"; code: "sessionExpired" }
  | { kind: "validation"; code: "invalidInput"; fields?: readonly FieldError[] }
  | { kind: "unknown"; code: "unexpectedError"; requestId?: string };
```

UI 用 `code` 查找翻译，不能显示服务器堆栈或数据库消息。`AbortError` 作为取消结果处理，不弹失败 Toast。排查上下文可以保留 request ID 和状态码，但不保留令牌或原始私密响应。

### 案例：搜索竞态、超时和重试

**覆盖**：请求生命周期、防抖、过期结果、操作型超时、安全重试、禁止盲目重试、有限退避和用户重试。

- ✅ 搜索词变化时防抖并 abort 前一请求；只有最新词对应结果可以写入 State。
- ❌ 所有请求统一 3 秒超时，或对 401、403、400 和业务拒绝自动重试。
- ✅ 只对安全可重放请求做有限指数退避；写操作只有服务端提供幂等键时才自动重试。
- ✅ UI 在最终失败后提供明确的手动重试；页面卸载时取消无用请求。

### 案例：认证与敏感数据边界

**覆盖**：服务端安全模型、凭据/Cookie/CSRF 一致、禁止敏感 Query、日志脱敏、最小跨域凭据。

- ❌ 组件把 token 存入任意长期存储，再将密码放进 `?password=` Query。
- ✅ 统一传输层按照服务端模型处理 Cookie 或凭据；Cookie 方案同步考虑 CSRF，跨域只对批准源发送必要凭据。
- ❌ `console.log(request.headers, responseBody)`。
- ✅ 日志只记录脱敏的错误类别、状态码和 request ID。

### 案例：四种认证模式与统一请求入口

**覆盖**：公开请求零凭据、Cookie Session、可选身份、强制身份、CSRF、JWT 单飞刷新、401 单次重试和流式请求。

```ts
await request("/api/auth/verification-codes", {
  authMode: REQUEST_AUTH_MODE.public,
  method: API_REQUEST_METHOD.post,
  json: input,
  timeoutMs: 10_000,
  parseData: parseVerificationCodeResult,
});

const response = await fetchRequest("/api/chat", {
  authMode: REQUEST_AUTH_MODE.required,
  method: "POST",
  body: streamBody,
});
```

- `public`：不得发送 Cookie、JWT、用户标识或 CSRF Token。
- `session`：只允许浏览器发送 HttpOnly Cookie；写操作按接口契约要求 CSRF Token。
- `optional`：匿名时正常发送；存在有效真实身份时成对注入 Bearer JWT 与 `X-User-Id`。
- `required`：发送前必须存在有效真实 JWT、`X-User-Id` 与 Cookie Session，否则直接失败。
- JWT 临期或明确 401 时由 Session 运行时单飞刷新；同一请求最多重试一次，再次 401 立即清理认证状态。
- `fetchRequest` 只允许项目 API 来源；不可重放的流式正文收到 401 时不得自动重试。
- ❌ Chat、Markdown 或业务组件从 `@/auth/services` 读取令牌并手动拼请求头。
- ✅ Chat 等业务只从 `@/api` 发请求，Auth 通过依赖倒置向 API 层注册内存认证提供者。

### 案例：DTO 在适配层变成领域模型

**覆盖**：模型分离、字段/日期/空值/默认值、最少字段、时区、本地化、精度。

```ts
interface AccountDto {
  id: string;
  display_name: string | null;
  created_at: string;
  balance_minor: string;
  internal_note?: string;
}

function toAccount(dto: AccountDto): Account {
  return {
    id: parseAccountId(dto.id),
    displayName: dto.display_name ?? "",
    createdAt: parseInstant(dto.created_at),
    balanceMinor: BigInt(dto.balance_minor),
  };
}
```

UI 不接收未使用的 `internal_note`。时间保留明确时区后再按 Locale 展示；高精度金额和标识符不随意转为 Number。

### 案例：协议变更一次完成

**覆盖**：真实使用位置、同步类型/校验/适配/错误/测试、破坏性迁移、集中临时兼容。

- ❌ 新增十个没有调用方的服务函数，或只把 DTO 类型的 `display_name` 改为 `name`，组件继续长期兼容两种字段。
- ✅ 新 API 与至少一个真实使用位置一起提交；字段变化同步更新运行时解析、适配器、错误映射和测试。
- ✅ 过渡期兼容只存在于一个适配器，并写明后端切换完成后的删除条件；组件只看到一个稳定领域模型。

### 案例：请求层测试矩阵

**覆盖**：成功、非成功、解析、取消、超时、DTO 转换、写操作重复与恢复、可控替身。

| 场景                  | 必要断言                          |
| --------------------- | --------------------------------- |
| `200` 合法 JSON       | DTO 被校验并映射为领域模型        |
| `204` 但契约要求实体  | 返回协议错误而非无条件解析        |
| `401` / `429` / `500` | 映射到不同项目错误且重试策略正确  |
| 损坏 JSON             | 返回解析错误，不用类型断言通过    |
| Abort / timeout       | 取消不提示普通失败，超时可恢复    |
| 重复写操作            | UI 防重或幂等键生效，失败可以重试 |

测试使用可控传输替身，不请求真实外部服务。
