# 目录结构规范

## 适用范围

适用于 `web` 前端目录和 `web/src` 中所有自有代码。目录结构服务于依赖边界，不为了视觉整齐进行无收益搬迁。

## 顶层结构

```text
web/
├── public/                 静态公开资源
├── src/
│   ├── components/
│   │   ├── ui/             shadcn/ui 官方源码
│   │   └── assistant-ui/   assistant-ui 官方源码
│   ├── hooks/              跨功能共享 Hook
│   ├── i18n/               国际化初始化、资源和语言工具
│   ├── lib/                无业务归属的共享基础能力
│   ├── style/              跨页面全局排版与样式能力
│   ├── theme/              主题配置、令牌和样式
│   ├── chat/               聊天功能模块
│   ├── <featureName>/      按业务能力组织的功能模块
│   ├── App.tsx             应用组合入口
│   ├── router.ts           路由定义入口
│   └── main.tsx            浏览器启动入口
├── eslint.config.js
├── package.json
└── tsconfig*.json
```

现有功能目录可以继续保留；新增目录必须有清晰职责，不能为了匹配示意树批量移动代码。

## 功能模块

功能模块使用小驼峰目录名，例如：

```text
src/auth/
├── components/
├── hooks/
├── pages/
├── services/
├── authTypes.ts
└── authUtils.ts
```

- 只创建实际需要的子目录，不建立空目录。
- 功能私有组件、Hook、服务和类型保留在功能目录内。
- 只有被多个功能稳定复用且不依赖具体业务时才提升到共享目录。
- 功能模块不得导入另一个功能的内部文件；确有共享语义时先建立公开边界或提取共享模块。

## 文件命名

- 自有 React 组件和页面文件使用大驼峰。
- 自有 Hook、服务、工具、类型和样式文件使用小驼峰。
- 测试文件与被测文件同名并追加 `.test` 或 `.spec`。
- `components/ui` 和 `components/assistant-ui` 保持官方命名，不重命名。
- URL 路径使用小写短横线形式；URL 命名不决定源码文件命名。
- 禁止使用 `common.ts`、`helpers.ts`、`misc.ts` 等无法表达职责的模糊文件名。

## 页面和组件位置

- 只被一个页面使用的组件优先放在对应功能目录，而不是全局 `components`。
- 跨功能共享的自有组件可放在 `components` 下按稳定职责组织。
- 页面负责布局和功能组合；复杂业务逻辑放在对应 Hook、服务或领域模块。
- 不将普通业务组件放入 `components/ui` 或 `components/assistant-ui`。

## Hook、工具和服务

- `src/hooks` 只存放跨功能共享 Hook。
- 纯函数和浏览器无关基础能力放在 `src/lib` 中的具名模块。
- 功能专属工具放在功能目录，不能默认堆到全局 `utils`。
- API 服务按业务资源组织，不能创建包含所有接口的单一巨大文件。
- 主题和国际化相关能力分别留在 `theme` 与 `i18n`，禁止散落到通用工具目录。

## 资源与样式

- 需要原样公开并通过 URL 访问的资源放在 `public`。
- 参与构建、需要哈希或通过模块引用的资源放在 `src` 内相应功能目录。
- 全局样式和主题样式使用既有入口；组件私有样式与组件共置。
- 禁止复制同一资源到多个目录。

## 测试位置

- 单元和组件测试默认与被测文件共置，便于同步维护。
- 跨模块集成测试可放入明确的测试目录。
- E2E 测试单独放在前端根目录的测试区域，不混入运行时代码。
- 测试辅助工具按复用范围放置，禁止生产代码依赖测试目录。

## 导出与依赖方向

- 项目内部导入统一使用 `@/`。
- 功能模块可通过一个明确入口暴露公共能力，但禁止层层 barrel 重新导出。
- 低层模块不得依赖高层页面。
- 主题、国际化、基础组件和通用库不得导入具体功能模块。
- 检测到循环依赖时应调整职责，而不是通过延迟导入隐藏问题。

## 项目案例

以下案例覆盖本文件全部规则章节。目录示例表达依赖边界，不要求为匹配示例树而批量搬迁现有文件。

### 案例：新增功能目录而不重排全仓

**覆盖**：顶层职责、保留现有结构、只为真实职责建目录。

- 需求：新增账户设置页面。
- ❌ 先把所有现有 `auth`、`theme`、`i18n` 文件移动到一套全新架构，再开始功能开发。
- ✅ 新建 `src/accountSettings/`，只包含当前需要的页面、组件、Hook 和服务；`App.tsx`、`router.ts`、`main.tsx` 继续承担既有入口职责。

`public` 保存原样公开资源，`src/style` 保存跨页面排版，`src/theme` 保存主题基础能力；不能因为目录树“更整齐”互换职责。

### 案例：功能私有优先，稳定复用后提升

**覆盖**：小驼峰功能目录、按需子目录、功能私有内容、共享提升条件、模块公开边界。

```text
src/accountSettings/
├── components/
│   └── ProfileForm.tsx
├── hooks/
│   └── useProfileUpdate.ts
├── pages/
│   └── AccountSettingsPage.tsx
├── accountService.ts
└── accountTypes.ts
```

- ❌ 预先创建空的 `stores/`、`models/`、`adapters/` 和 `utils/`。
- ✅ 只创建已有文件需要的目录。
- ❌ `accountSettings` 直接导入 `auth/internal/sessionCache.ts`。
- ✅ 认证模块通过稳定入口公开必要会话能力；真正跨功能且无业务归属的能力再提取到共享模块。

### 案例：源码、URL 与上游命名边界

**覆盖**：大驼峰/小驼峰、测试后缀、官方目录例外、URL 命名、禁止模糊文件名。

```text
✅ src/accountSettings/pages/AccountSettingsPage.tsx
✅ src/accountSettings/hooks/useAccountSettings.ts
✅ src/accountSettings/accountService.ts
✅ src/accountSettings/pages/AccountSettingsPage.test.tsx
✅ /account-settings                              URL
✅ src/components/ui/alert-dialog.tsx             官方例外

❌ src/accountSettings/pages/account-settings.tsx
❌ src/accountSettings/helpers.ts
```

已有自有短横线文件在相关修改或独立重构中原子迁移，不能因此重命名官方组件文件。

### 案例：页面、功能组件和共享组件的位置

**覆盖**：页面私有、跨功能共享、页面编排、禁止业务组件进入上游目录。

- `ProfileForm` 只服务账户设置，放在 `accountSettings/components`。
- `ConfirmActionDialog` 被认证和账户设置稳定复用且没有功能依赖，可放在自有 `components`。
- `AccountSettingsPage` 负责路由输入、布局和功能组合；复杂保存逻辑进入 `useProfileUpdate` 或 `accountService`。
- ❌ 把 `DeleteAccountDialog` 放进 `components/ui` 冒充 shadcn 官方原语。

### 案例：Hook、工具、服务各回其位

**覆盖**：共享 Hook、基础纯函数、功能工具、资源型服务、主题/i18n 边界。

- ✅ 跨功能的 `useMediaQuery` 可放 `src/hooks/useMediaQuery.ts`；认证专用 `useLogin` 留在 `src/auth/hooks`。
- ✅ 无业务归属的 `mergeHeaders` 放在 `src/lib/mergeHeaders.ts`；`normalizeLoginError` 留在认证功能。
- ❌ 建立一个 `src/api.ts` 容纳全部资源接口；✅ 按 `authService.ts`、`accountService.ts` 等资源职责组织。
- ❌ 把语言解析或主题存储放进 `src/lib/utils.ts`；它们分别属于 `i18n` 和 `theme`。

### 案例：公开资源和构建资源

**覆盖**：`public`、构建哈希资源、样式共置、禁止重复资源。

- 需要固定 `/robots.txt` 路径的文件放 `public/robots.txt`。
- 账户页插图需要模块导入与内容哈希，放 `src/accountSettings/assets/` 并从组件导入。
- 组件私有 CSS 与组件共置；全局排版和主题样式继续使用既有入口。
- ❌ 同一个 logo 同时复制到 `public`、`src/assets` 和功能目录；应根据访问方式保留一个权威来源。

### 案例：测试位置与生产依赖

**覆盖**：共置单元/组件测试、集成目录、E2E 区域、辅助工具范围、生产不能依赖测试。

```text
✅ src/auth/components/LoginForm.test.tsx
✅ src/auth/authAdapter.test.ts
✅ tests/integration/authSession.test.ts
✅ e2e/login.spec.ts
```

只服务一个测试文件的 builder 与测试共置；跨模块复用的测试工具进入明确测试目录。生产 `src/auth/api.ts` 不得导入 `tests/mockServer.ts`。

### 案例：公开入口不等于层层 barrel

**覆盖**：`@/`、单一公共入口、依赖向下、基础层隔离、循环依赖治理。

```ts
// ✅ 功能消费者从明确边界导入
import { LoginPage, useSession } from "@/auth";

// ❌ 基础主题层反向依赖功能页面
import { LoginPage } from "@/auth/pages/LoginPage";
```

不要再建立 `src/index.ts -> auth/index.ts -> components/index.ts -> forms/index.ts` 的多层重导出。发生循环时提取共同契约或重新分配职责，不能以动态导入掩盖。
