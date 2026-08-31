# 状态管理规范

## 适用范围

适用于组件状态、Context、URL 状态、持久化状态和远程数据状态。

## 状态分类

新增状态前必须判断它属于哪一类：

1. **局部交互状态**：仅影响单个组件或紧邻子树，使用组件 State。
2. **派生状态**：能够从现有输入计算，不单独存储。
3. **共享客户端状态**：多个远距离组件共同使用，放入职责明确的 Context 或专用状态模块。
4. **URL 状态**：需要分享、刷新恢复或参与导航，放入 URL。
5. **持久化偏好**：主题、语言等用户偏好，通过专用存储适配器持久化。
6. **远程数据状态**：来自 API，保留加载、错误、数据时效和取消语义。

不得因为“以后可能用到”把局部状态提前提升为全局状态。

## 单一事实来源

- 同一事实只能有一个拥有者。
- 禁止在 Props、State、Context 和存储中同时维护未经同步契约约束的副本。
- 可计算的值在渲染中派生，不通过 Effect 复制。
- 需要编辑服务器数据时，应区分服务器快照、表单草稿和已提交结果。
- 状态名称必须表达业务含义，不能仅使用 `data`、`value` 或 `state`。

## 局部状态

- 状态应放在使用它的最低公共拥有者。
- 相互独立的状态分开维护；必须原子更新的字段使用同一状态对象或 reducer。
- 更新依赖前一状态时使用函数式更新。
- 禁止直接修改数组、对象、Map 或 Set 后复用原引用。
- 临时输入、展开状态和悬停状态不得进入全局存储。

## Context

- Context 必须围绕稳定职责建立，例如主题、语言、认证会话。
- 不创建包含整个应用所有状态的单一 Context。
- 高频变化值与稳定操作应根据渲染影响拆分。
- Provider 值必须避免无意义地每次创建新对象；只有确认引用会影响订阅方时做稳定化处理。
- 自定义消费 Hook 必须在缺少 Provider 时给出明确错误或定义清楚的默认行为。
- Context 不应隐藏功能模块之间的反向依赖。

## 主题状态

- 运行时主题读取和修改统一通过 `useTheme()` 及其公开 API。
- 业务代码不得直接修改根元素 class、dataset、CSS 变量、主题存储或 `.dark`。
- `theme/types.ts` 定义公开配置模型，`theme/config.ts` 负责默认值、校验、合并和序列化。
- `theme/runtime.ts` 负责系统偏好和 CSS 变量同步，`theme/provider.tsx` 负责 React 状态和公开操作。
- `theme/styles.css` 负责 Tailwind CSS 4 与组件语义令牌映射。
- 新增全局主题能力必须完整贯通类型、配置、运行时、样式映射和公开 API。

## Reducer

- 多个字段存在明确状态转换、一次操作需要原子修改多个值或转换规则需要集中测试时使用 reducer。
- Action 使用可辨识联合，名称描述发生的业务事件。
- Reducer 必须是纯函数，不发请求、不写存储、不读取当前时间。
- 禁止把简单布尔开关机械改写为 reducer。

## 持久化状态

- 持久化通过专用适配器访问，不在任意组件中散落 `localStorage` 调用。
- 键名描述职责，不使用品牌技术前缀；主题和语言分别使用 `preferences.theme` 与 `preferences.language`。
- 存储内容必须能够进行运行时校验。
- 读取失败、权限拒绝、容量不足和损坏数据必须回退到安全默认值。
- 存储结构改变时必须提供版本或迁移逻辑。
- 从旧键迁移时先读取新键，再兼容读取旧键；成功写入新键后再移除旧键。
- 敏感认证材料不得仅因方便而放入可被脚本读取的长期存储。

## 初始化与同步

- 主题、语言等影响首屏的状态应在应用初始化阶段尽早确定，减少闪烁和重复渲染。
- 初始化逻辑只执行一次，不在多个页面分别初始化同一服务。
- 跨标签页同步必须避免自身写入形成循环通知。
- 外部状态变化应通过清晰订阅接口接入 React，并提供取消订阅。
- 默认值、系统偏好和用户显式偏好的优先级必须固定。

## 远程数据

- 远程数据必须区分未请求、加载、成功、空数据和错误状态。
- 旧请求结果不得覆盖新请求结果。
- 不在多个组件中无协调地重复请求同一资源。
- 缓存、重新验证和失效策略必须与数据时效需求一致；项目未引入专用请求状态库前，不得假设其能力存在。
- 乐观更新必须有失败回滚或重新同步策略。

## 引入状态库

只有出现以下情况并有实际证据时才考虑新增状态库：

- Context 分层仍无法控制复杂跨页面状态。
- 状态转换和订阅模型已经超出 React 内置能力的合理范围。
- 远程缓存、失效和并发需求无法由当前请求层可靠维护。

引入前必须说明状态所有权、持久化、开发工具、包体积和迁移成本，不能仅因个人熟悉度增加依赖。

## 项目案例

以下案例覆盖本文件全部规则章节。状态选型先依据所有权和生命周期，不依据个人熟悉的库。

### 案例：先分类再选择容器

**覆盖**：局部、派生、共享、URL、持久化偏好、远程数据，以及禁止提前全局化。

| 状态               | 正确拥有者                              |
| ------------------ | --------------------------------------- |
| 密码是否可见       | `FieldPassword` 局部 State              |
| `fullName`         | 由 `firstName` 和 `lastName` 渲染时派生 |
| 认证会话           | 职责明确的认证 Context/状态模块         |
| 搜索条件和当前分页 | URL 参数，支持刷新和分享                |
| 主题、语言         | 专用存储适配器与对应 Provider           |
| 用户列表           | 请求状态，包含加载、错误、时效和取消    |

“以后也许别的页面会用”不能成为把密码显隐放进 Zustand 的理由。

### 案例：同一事实只有一个源

**覆盖**：唯一拥有者、禁止无契约副本、渲染派生、服务器快照与草稿、语义命名。

```tsx
// ❌ Props 复制为 State，再用 Effect 追赶
const [email, setEmail] = useState(account.email);
useEffect(() => setEmail(account.email), [account.email]);

// ✅ 明确区分服务器快照和用户草稿
const accountSnapshot = account;
const [profileDraft, setProfileDraft] = useState(() =>
  toProfileDraft(accountSnapshot),
);
```

保存成功后由明确动作替换快照并重建草稿。不要把它们都命名为 `data`、`value` 或 `state`。

### 案例：局部状态原子且不可变

**覆盖**：最低公共层级、拆分与聚合、函数式更新、不可变集合、禁止瞬时状态全局化。

```tsx
const [attemptCount, setAttemptCount] = useState(0);
setAttemptCount((currentCount) => currentCount + 1);

setAccounts((currentAccounts) =>
  currentAccounts.map((account) =>
    account.id === targetId ? { ...account, enabled: true } : account,
  ),
);
```

一次必须原子更新的多字段状态可使用对象或 reducer；互不相关的字段分开。不要直接 `accounts.push()` 后复用原数组，也不要把 hover 和本地展开状态放进全局 store。

### 案例：按职责拆分 Context

**覆盖**：稳定职责、禁止全局大 Context、变化频率、Provider 值、缺失 Provider、依赖方向。

- ❌ `AppContext` 同时包含主题、认证、聊天消息、表单草稿和每个页面弹窗状态。
- ✅ `ThemeProvider`、`I18nProvider`、`AuthProvider` 各自维护稳定职责；聊天状态留在聊天功能边界。
- ✅ 消费 Hook 在 Provider 缺失时抛出明确开发错误，或文档化安全默认值。
- ✅ 只有引用变化确实会触发无关订阅方时才稳定 Provider value；不能机械 `useMemo`。
- ❌ 低层主题 Context 导入认证页面以获取一个颜色值。

### 案例：新增主题能力必须贯通全链路

**覆盖**：`useTheme()`、禁止业务直接写根元素、主题各文件职责、完整能力链路。

```tsx
// ❌ 业务组件绕过主题基础设施
document.documentElement.classList.toggle("dark");
localStorage.setItem("theme", "dark");

// ✅ 只使用公开 API
const { theme, setTheme } = useTheme();
setTheme("dark");
```

新增 `contrast` 时：`theme/types.ts` 定义模型，`config.ts` 校验和序列化，`runtime.ts` 同步 DOM，`provider.tsx` 暴露操作，`styles.css` 映射语义令牌；缺一部分都不是完整实现。

### 案例：何时使用 reducer

**覆盖**：复杂转换、可辨识 Action、纯函数、禁止机械 reducer。

```ts
type AuthAction =
  | { type: "submitStarted" }
  | { type: "submitSucceeded"; session: AuthSession }
  | { type: "submitFailed"; error: AppError };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "submitStarted":
      return { status: "loading" };
    case "submitSucceeded":
      return { status: "authenticated", session: action.session };
    case "submitFailed":
      return { status: "error", error: action.error };
  }
}
```

Reducer 不读取时间、不发请求、不写存储。单个 `isOpen` 使用 `useState`，不为形式改成 reducer。

### 案例：安全持久化与旧键迁移

**覆盖**：专用适配器、职责键名、运行时校验、失败回退、版本迁移、新键优先、敏感材料。

```ts
const LANGUAGE_KEY = "preferences.language";
const LEGACY_LANGUAGE_KEY = "just-coast.language";

function readLanguage(): Locale {
  try {
    const current = parseLocale(localStorage.getItem(LANGUAGE_KEY));
    if (current) return current;

    const legacy = parseLocale(localStorage.getItem(LEGACY_LANGUAGE_KEY));
    if (!legacy) return DEFAULT_LOCALE;

    localStorage.setItem(LANGUAGE_KEY, legacy);
    localStorage.removeItem(LEGACY_LANGUAGE_KEY);
    return legacy;
  } catch {
    return DEFAULT_LOCALE;
  }
}
```

结构升级使用版本或迁移函数。容量不足和权限拒绝都回退安全默认。高价值认证令牌不能只因调用方便就长期放在 `localStorage`。

### 案例：初始化和跨标签同步

**覆盖**：首屏尽早初始化、只执行一次、避免同步环、订阅清理、固定优先级。

- ✅ 主题和语言在应用启动或专用 Provider 中初始化，优先级固定为“有效用户偏好 > 支持的系统偏好 > 项目默认值”。
- ❌ 每个页面各自读取存储并设置根元素，造成闪烁和重复监听。
- ✅ `storage` 订阅返回取消函数，验证 key 与值；处理来自其他标签页的变化时避免再次无条件写回形成循环。

### 案例：可靠远程数据状态

**覆盖**：完整状态、请求竞态、去重、缓存时效、乐观更新回滚、不能假定未安装库。

- ❌ 用 `data ?? []` 把未请求、加载、错误和真实空列表合并；两个组件各自请求同一用户。
- ✅ 使用可辨识状态并由共同拥有者协调请求；新请求取消旧请求或用请求标识忽略过期结果。
- ✅ 缓存明确说明过期和重新验证策略；项目没有既定请求缓存库时按现有请求层实现，不能在规则或代码中假设其 API。
- ✅ 乐观删除失败时恢复原列表或重新拉取权威快照。

### 案例：引入状态库需要证据

**覆盖**：引入条件、所有权、持久化、工具、体积和迁移成本。

- ❌ 因开发者熟悉某个库，就为两个局部开关再引入一套状态系统。
- ✅ 先证明 Context 分层、reducer 和现有请求层无法合理处理跨页面转换或缓存失效，再提交决策说明：哪些状态归库、谁拥有、如何持久化、调试方式、浏览器体积、现有状态迁移和退出方案。
