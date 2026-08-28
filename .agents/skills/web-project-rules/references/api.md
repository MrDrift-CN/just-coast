# API / 请求层规范

## 适用范围

适用于浏览器发出的 HTTP 请求、认证交互、第三方接口和请求数据到 UI 模型的转换。项目尚未采用的请求库不得在规则中假定存在。

## 分层职责

请求相关代码按职责分离：

- **传输层**：基础 URL、请求头、序列化、超时、取消和响应读取。
- **服务层**：按业务资源组织接口，定义输入输出和错误语义。
- **适配层**：校验响应并将 DTO 转换为领域模型。
- **状态层**：管理加载、缓存、重试和界面状态。
- **组件层**：触发操作并渲染结果，不解析协议细节。

组件不得重复实现状态码判断、鉴权头、JSON 解析和错误归一化。

## 请求函数

- 请求函数名称必须表达业务动作，例如 `getCurrentUser`、`updatePassword`。
- 输入和输出必须具有明确 TypeScript 类型。
- 可取消请求必须接受 `AbortSignal` 或由调用契约提供等效取消能力。
- 基础 URL 和环境相关配置集中读取，禁止在组件中拼接服务器地址。
- Query、Path 和 Body 参数必须按协议正确编码。
- `fetch` 只有在网络异常时才会拒绝；传输层必须显式检查 HTTP 状态。
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

以下案例覆盖本文件全部规则章节。示例使用平台 `fetch` 表达现有能力，不暗示项目已经安装其他请求库。

### 案例：请求职责逐层收窄

**覆盖**：传输、服务、适配、状态和组件层，以及禁止组件解析协议。

```text
transport/request.ts       基础 URL、headers、超时、取消、响应读取
auth/authService.ts        login、getCurrentUser 等业务动作
auth/authAdapter.ts        AuthSessionDto -> AuthSession
auth/hooks/useLogin.ts     loading、error、重复提交和取消
auth/components/LoginForm.tsx 触发提交并渲染状态
```

`LoginForm` 不应重复判断 401、拼 Authorization、调用 `response.json()` 或理解 DTO 字段名。

### 案例：完整处理 `fetch` 响应

**覆盖**：业务命名、明确类型、取消、集中 URL、参数编码、HTTP 状态、空体/非 JSON/解析失败。

```ts
interface GetCurrentUserOptions {
  signal?: AbortSignal;
}

export async function getCurrentUser({
  signal,
}: GetCurrentUserOptions = {}): Promise<UserDto> {
  const response = await request("/users/me", { signal });

  if (!response.ok) throw await toRequestError(response);
  if (response.status === 204)
    throw new ProtocolError("Expected user response body");

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json"))
    throw new ProtocolError("Expected JSON");

  return parseUserDto(await response.json());
}
```

搜索参数使用 `URLSearchParams`，路径段使用正确编码。服务器基础地址由集中配置读取，组件不能写字面量服务器地址或直接处理传输细节。网络成功不代表 HTTP 成功，不能只靠 `catch`。

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
